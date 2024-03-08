import GLib from "gi://GLib";
import { FontIcon, getFontIconName } from "@widgets";
import { type Notification as Notif } from "types/service/notifications";

const WINDOW_NAME = "notification-center";

const notifications = await Service.import("notifications");
const _notifications = notifications.bind("notifications");

function time(time: number, format = "%H:%M") {
  return GLib.DateTime.new_from_unix_local(time).format(format);
}

function Header() {
  const dndButton = Widget.Button({
    className: "dnd",
    child: FontIcon({ icon: "notification" }),
    onClicked: () => (notifications.dnd = !notifications.dnd),
  }).hook(
    notifications,
    (self) => {
      self.child.icon = getFontIconName(
        notifications.dnd ? "dnd" : "notification"
      );
      self.toggleClassName("on", notifications.dnd);
    },
    "notify::dnd"
  );

  return Widget.CenterBox({
    className: "header",
    startWidget: Widget.Box({
      child: dndButton,
    }),
    centerWidget: Widget.Box({
      child: Widget.Label({
        className: "title",
        label: "Notifications",
      }),
      hpack: "center",
    }),
    endWidget: Widget.Box({
      hpack: "end",
      child: Widget.Button({
        className: "clear",
        visible: _notifications.as((n) => n.length > 0),
        child: Widget.Box({
          spacing: 8,
          children: [
            FontIcon({ icon: "clear-notifications" }),
            Widget.Label({
              label: "Clear",
            }),
          ],
        }),
        onPrimaryClick: () => notifications.clear(),
      }),
    }),
  });
}

function NotificationIcon({ app_entry, app_icon, image }: Notif) {
  if (image) {
    return Widget.Box({
      vpack: "start",
      hexpand: false,
      className: "icon",
      css: `background-image: url("${image}");`,
    });
  }

  let icon = "dialog-information-symbolic";
  if (Utils.lookUpIcon(app_icon)) icon = app_icon;

  if (Utils.lookUpIcon(app_entry || "")) icon = app_entry || "";

  return Widget.Box({
    vpack: "start",
    hexpand: false,
    className: "icon",
    css: `
          min-width: 78px;
          min-height: 78px;
      `,
    child: Widget.Icon({
      icon,
      size: 58,
      hpack: "center",
      hexpand: true,
      vpack: "center",
      vexpand: true,
    }),
  });
}

function Notification(notification: Notif) {
  const content = Widget.Box({
    className: "content",
    children: [
      NotificationIcon(notification),
      Widget.Box({
        hexpand: true,
        vertical: true,
        children: [
          Widget.Box({
            children: [
              Widget.Label({
                className: "title",
                xalign: 0,
                justification: "left",
                hexpand: true,
                maxWidthChars: 24,
                truncate: "end",
                wrap: true,
                label: notification.summary.trim(),
                useMarkup: true,
              }),
              Widget.Label({
                className: "time",
                vpack: "start",
                label: time(notification.time),
              }),
              Widget.Button({
                className: "close-button",
                vpack: "start",
                child: Widget.Icon("window-close-symbolic"),
                onClicked: notification.close,
              }),
            ],
          }),
          Widget.Label({
            className: "description",
            hexpand: true,
            useMarkup: true,
            xalign: 0,
            justification: "left",
            label: notification.body.trim(),
            maxWidthChars: 24,
            wrap: true,
          }),
        ],
      }),
    ],
  });

  const actionsbox =
    notification.actions.length > 0
      ? Widget.Box({
          className: "actions horizontal",
          // homogeneous: true,
          children: notification.actions.map((action) =>
            Widget.Button({
              className: "action",
              onClicked: () => notification.invoke(action.id),
              hexpand: true,
              child: Widget.Label(action.label),
            })
          ),
        })
      : null;

  return Widget.Box({
    className: `notification ${notification.urgency}`,
    vexpand: false,
    hexpand: true,
    vertical: true,
    children: actionsbox ? [content, actionsbox] : [content],
  });
}

function List() {
  const map: Map<number, ReturnType<typeof Notification>> = new Map();

  function remove(id: number) {
    const notif = map.get(id);
    if (notif) {
      notif.destroy();
      map.delete(id);
    }
  }

  const list = Widget.Box({
    vertical: true,
    vexpand: true,
    className: "list",
    children: notifications.notifications.reverse().map((n) => {
      const notif = Notification(n);
      map.set(n.id, notif);
      return notif;
    }),
  })
    .hook(
      notifications,
      (_, id) => {
        remove(id);
      },
      "closed"
    )
    .hook(
      notifications,
      (self, id: number) => {
        if (id !== undefined) {
          if (map.has(id)) {
            remove(id);
          }

          const notif = notifications.getNotification(id);
          if (!notif) return;

          const notifWidget = Notification(notif);
          map.set(id, notifWidget);
          self.children = [notifWidget, ...self.children];
        }
      },
      "notified"
    );
  return Widget.Scrollable({
    hscroll: "never",
    vscroll: "automatic",
    className: "list-container",
    vexpand: true,
    child: list,
  });
}

function _NotificationCenter() {
  return Widget.Box({
    hpack: "center",
    vpack: "start",
    vertical: true,
    className: "notification-center",
    children: [Header(), List()],
  });
}

export const NotificationCenter = () =>
  Widget.Window({
    name: WINDOW_NAME,
    popup: true,
    visible: false,
    anchor: ["top", "right", "bottom", "left"],
    child: Widget.EventBox({
      onPrimaryClick: () => {
        App.closeWindow(WINDOW_NAME);
      },
      child: _NotificationCenter(),
    }),
  });
