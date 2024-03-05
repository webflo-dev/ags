import GLib from "gi://GLib";
import { FontIcon } from "@widgets";
import { type Notification as Notif } from "types/service/notifications";

const WINDOW_NAME = "notification-center";

const notifications = await Service.import("notifications");
const _notifications = notifications.bind("notifications");
const _dnd = notifications.bind("dnd");

function Header() {
  return Widget.CenterBox({
    className: "header",
    startWidget: Widget.Box({
      child: Widget.Button({
        className: "btn-dnd",
        child: FontIcon({
          icon: _dnd.as((dnd) => (dnd ? "dnd" : "notification")),
        }),
        onClicked: () => (notifications.dnd = !notifications.dnd),
      }),
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
        className: "btn-clear",
        visible: _notifications.as((n) => n.length > 0),
        child: Widget.Box({
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

function time(time: number, format = "%H:%M") {
  return GLib.DateTime.new_from_unix_local(time).format(format);
}

function NotificationIcon({ app_entry, app_icon, image }: Notif) {
  if (image) {
    return Widget.Box({
      vpack: "start",
      hexpand: false,
      class_name: "icon img",
      css: `
              background-image: url("${image}");
              background-size: cover;
              background-repeat: no-repeat;
              background-position: center;
              min-width: 78px;
              min-height: 78px;
          `,
    });
  }

  let icon = "dialog-information-symbolic";
  if (Utils.lookUpIcon(app_icon)) icon = app_icon;

  if (Utils.lookUpIcon(app_entry || "")) icon = app_entry || "";

  return Widget.Box({
    vpack: "start",
    hexpand: false,
    class_name: "icon",
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
    class_name: "content",
    children: [
      NotificationIcon(notification),
      Widget.Box({
        hexpand: true,
        vertical: true,
        children: [
          Widget.Box({
            children: [
              Widget.Label({
                class_name: "title",
                xalign: 0,
                justification: "left",
                hexpand: true,
                max_width_chars: 24,
                truncate: "end",
                wrap: true,
                label: notification.summary.trim(),
                use_markup: true,
              }),
              Widget.Label({
                class_name: "time",
                vpack: "start",
                label: time(notification.time),
              }),
              Widget.Button({
                class_name: "close-button",
                vpack: "start",
                child: Widget.Icon("window-close-symbolic"),
                on_clicked: notification.close,
              }),
            ],
          }),
          Widget.Label({
            class_name: "description",
            hexpand: true,
            use_markup: true,
            xalign: 0,
            justification: "left",
            label: notification.body.trim(),
            max_width_chars: 24,
            wrap: true,
          }),
        ],
      }),
    ],
  });

  const actionsbox =
    notification.actions.length > 0
      ? Widget.Revealer({
          transition: "slide_down",
          child: Widget.EventBox({
            child: Widget.Box({
              class_name: "actions horizontal",
              children: notification.actions.map((action) =>
                Widget.Button({
                  class_name: "action-button",
                  on_clicked: () => notification.invoke(action.id),
                  hexpand: true,
                  child: Widget.Label(action.label),
                })
              ),
            }),
          }),
        })
      : null;

  const eventbox = Widget.EventBox({
    vexpand: false,
    on_primary_click: notification.dismiss,
    on_hover() {
      if (actionsbox) actionsbox.reveal_child = true;
    },
    on_hover_lost() {
      if (actionsbox) actionsbox.reveal_child = true;

      notification.dismiss();
    },
    child: Widget.Box({
      vertical: true,
      children: actionsbox ? [content, actionsbox] : [content],
    }),
  });

  return Widget.Box({
    class_name: `notification ${notification.urgency}`,
    child: eventbox,
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
      (_, id: number) => {
        if (id !== undefined) {
          if (map.has(id)) {
            remove(id);
          }

          const notif = notifications.getNotification(id);
          if (!notif) return;

          const notifWidget = Notification(notif);
          map.set(id, notifWidget);
          _.children = [notifWidget, ..._.children];
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
    anchor: ["top"],
    // keymode: "exclusive",
    child: _NotificationCenter(),
  });
