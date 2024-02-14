import Widget from "resource:///com/github/Aylur/ags/widget.js";
import * as Utils from "resource:///com/github/Aylur/ags/utils.js";
import GLib from "gi://GLib";
import type { Notification } from "~/types/service/notifications";

const NotificationIcon = ({ app_entry, app_icon, image }: Notification) => {
  if (image) {
    return Widget.Box({
      vpack: "start",
      hexpand: false,
      class_name: "image",
      css: `background-image: url("${image}");`,
    });
  }

  let icon = "dialog-information-symbolic";
  if (app_icon && Utils.lookUpIcon(app_icon)) icon = app_icon;
  if (app_entry && Utils.lookUpIcon(app_entry)) icon = app_entry;

  return Widget.Box({
    vpack: "start",
    hexpand: false,
    class_name: "image",
    children: [
      Widget.Icon({
        icon,
        size: 58,
        hpack: "center",
        hexpand: true,
        vpack: "center",
        vexpand: true,
      }),
    ],
  });
};

const Content = (notification: Notification) =>
  Widget.EventBox({
    child: Widget.Box({
      class_name: "content",
      vexpand: false,
      children: [
        NotificationIcon(notification),
        Widget.Box({
          hexpand: true,
          vertical: true,
          children: [
            Widget.Box({
              spacing: 8,
              children: [
                Widget.Label({
                  class_name: "title",
                  vpack: "center",
                  xalign: 0,
                  justification: "left",
                  hexpand: true,
                  max_width_chars: 24,
                  truncate: "end",
                  wrap: true,
                  label: notification.summary,
                  use_markup: true,
                  // useMarkup: notification.summary.startsWith("<"),
                }),
                Widget.Label({
                  class_name: "time",
                  vpack: "center",
                  label: GLib.DateTime.new_from_unix_local(
                    notification.time
                  ).format("%H:%M"),
                }),
                Widget.Button({
                  // onHover: hover,
                  class_name: "close-button",
                  vpack: "center",
                  child: Widget.Icon("window-close-symbolic"),
                  on_clicked: () => notification.close(),
                }),
              ],
            }),
            Widget.Label({
              class_name: "description",
              hexpand: true,
              use_markup: true,
              xalign: 0,
              justification: "left",
              label: notification.body,
              wrap: true,
            }),
          ],
        }),
      ],
    }),
  });

const Actions = (notification: Notification) =>
  Widget.Box({
    class_name: "actions",
    children: notification.actions.map((action) =>
      Widget.Button({
        class_name: "action-button",
        on_clicked: () => notification.invoke(action.id),
        hexpand: true,
        child: Widget.Label(action.label),
      })
    ),
    binds: [
      ["visible", notification, "actions", (actions) => actions.length > 0],
    ],
  });

const NotificationItem = (notification: Notification) =>
  Widget.Box({
    class_name: `notification ${notification.urgency}`,
    vertical: true,
    children: [Content(notification), Actions(notification)],
  });

export { NotificationItem as Notification };
