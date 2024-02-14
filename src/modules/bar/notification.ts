import App from "resource:///com/github/Aylur/ags/app.js";
import Widget from "resource:///com/github/Aylur/ags/widget.js";
import Notifications from "resource:///com/github/Aylur/ags/service/notifications.js";
import * as Utils from "resource:///com/github/Aylur/ags/utils.js";
import { icons } from "~/icons";
import type { Notification } from "~/types/service/notifications";

const Summary = () =>
  Widget.Label({
    class_name: "summary",
    connections: [
      [
        Notifications,
        (label) => {
          label.label =
            Notifications.notifications[0]?.summary ??
            " ".repeat(label.label.length);
        },
        "notify::popups",
      ],
    ],
  });

const ListIcon = () =>
  Widget.Label({
    label: Notifications.dnd
      ? icons.notifications.dnd
      : icons.notifications.indicator,
  });

const AppIcon = ({ app_icon, app_entry }: Notification) => {
  if (Utils.lookUpIcon(app_icon)) {
    return Widget.Icon({ class_name: "app-icon", icon: app_icon });
  }

  if (app_entry && Utils.lookUpIcon(app_entry)) {
    return Widget.Icon({ class_name: "app-icon", icon: app_entry });
  }
};

const Indicator = () =>
  Widget.Box({
    connections: [
      [
        Notifications,
        (box) => {
          if (Notifications.popups.length > 0) {
            const lastPopup: Notification = Notifications.popups[0];
            const child = AppIcon(lastPopup) || ListIcon();
            box.children = [child];
          } else {
            box.children = [ListIcon()];
          }
        },
      ],
    ],
  });

export const NotificationIndicator = () =>
  Widget.Button({
    on_clicked: () => {
      App.toggleWindow("notification-center");
    },
    name: "notification-indicator",
    child: Widget.Box({
      children: [
        Indicator(),
        Widget.Revealer({
          reveal_child: false,
          transition_duration: 250,
          transition: "slide_right",
          child: Summary(),
          binds: [
            ["revealChild", Notifications, "popups", (p) => p.length > 0],
          ],
        }),
      ],
    }),
    connections: [
      [
        Notifications,
        (btn) =>
          btn.toggleClassName("full", Notifications.notifications.length > 0),
        "notify::notifications",
      ],
    ],
  });
