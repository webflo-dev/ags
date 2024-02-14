import App from "resource:///com/github/Aylur/ags/app.js";
import Widget from "resource:///com/github/Aylur/ags/widget.js";
import Notifications from "resource:///com/github/Aylur/ags/service/notifications.js";
import { CenteredBox, PopupWindow } from "~/widgets";
import { icons } from "~/icons";

import { Notification } from "./notification.js";

const List = () =>
  Widget.Box({
    vertical: true,
    vexpand: true,
    class_name: "list",
    binds: [
      [
        "children",
        Notifications,
        "notifications",
        (n) => n.reverse().map((n) => Notification(n)),
      ],
    ],
  });

const EmptyList = () =>
  CenteredBox({
    class_name: "empty-list",
    children: [Widget.Label("No notifications")],
  });

const NotificationList = () =>
  Widget.Scrollable({
    class_name: "notifications-scrollable",
    vexpand: true,
    hscroll: "never",
    vscroll: "automatic",
    child: Widget.Stack({
      items: [
        ["empty", EmptyList()],
        ["list", List()],
      ],
      binds: [
        [
          "shown",
          Notifications,
          "notifications",
          (n) => (n.length > 0 ? "list" : "empty"),
        ],
      ],
    }),
  });

const ClearButton = () =>
  Widget.Button({
    on_clicked: (btn) => {
      if (btn.sensitive) {
        Notifications.clear();
        App.closeWindow("notification-center");
      }
    },
    class_name: "clear-button",
    child: Widget.Box({
      spacing: 5,
      children: [
        Widget.Label({
          label: "Clear",
          vpack: "center",
        }),
        Widget.Label({ class_name: "icon", label: icons.trash }),
      ],
    }),
  });

const DoNotDisturbSwitch = () =>
  Widget.Switch({
    class_name: "dnd",
    vpack: "center",
    connections: [
      [
        "notify::active",
        ({ active }) => {
          Notifications.dnd = active;
        },
      ],
    ],
  });

const Header = () =>
  Widget.Box({
    class_name: "header",
    spacing: 8,
    vpack: "center",
    children: [
      Widget.Label({
        label: "Do Not Disturb",
        vpack: "center",
      }),
      DoNotDisturbSwitch(),
      Widget.Box({ hexpand: true }),
      ClearButton(),
    ],
    connections: [
      [
        Notifications,
        (box) =>
          (box.children[3].visible = Notifications.notifications.length > 0),
        "notify::notifications",
      ],
    ],
  });

export const NotificationCenter = () =>
  PopupWindow({
    name: "notification-center",
    anchor: ["top"],
    child: Widget.Box({
      vertical: true,
      class_name: "notifications",
      children: [Header(), NotificationList()],
    }),
  });
