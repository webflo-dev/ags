import { merge } from "@utils";
import { FontIcon } from "@widgets";
import { clsx } from "clsx";
import type { Notification } from "types/service/notifications";

const notifications = await Service.import("notifications");

function AppIcon({ app_icon, app_entry }: Notification) {
  if (Utils.lookUpIcon(app_icon)) return app_icon;
  if (Utils.lookUpIcon(app_entry)) return app_entry;
}

export function NotificationIndicator() {
  const _dnd = notifications.bind("dnd");
  const _notifications = notifications.bind("notifications");

  const messageIcon = FontIcon();
  const messageLabel = Widget.Label();

  return Widget.Box({
    name: "notification-indicator",
    className: merge([_dnd, _notifications], (dnd, notifications) =>
      clsx({
        dnd: dnd,
        empty: notifications.length === 0,
      })
    ),
    children: [
      Widget.Button({
        child: Widget.Box({
          children: [
            FontIcon({
              icon: _dnd.as((dnd) => (dnd ? "dnd" : "notification")),
            }),
            Widget.Revealer({
              transitionDuration: 500,
              transition: "slide_left",
              child: Widget.Box({
                spacing: 8,
                marginLeft: 8,
                children: [messageIcon, messageLabel],
              }),
            }).hook(
              notifications,
              (revealer) => {
                if (notifications.popups.length > 0) {
                  revealer.revealChild = true;
                  const popup = notifications.popups[0];

                  messageLabel.label = popup.summary;

                  const icon = AppIcon(popup);
                  if (icon) {
                    messageIcon.visible = true;
                    messageIcon.icon = icon;
                  } else {
                    messageIcon.visible = false;
                  }
                } else {
                  revealer.revealChild = false;
                }
              },
              "notify::popups"
            ),
          ],
        }),
        onClicked: () => {
          App.toggleWindow("notification-center");
          // if (notifications.notifications.length > 0) {
          //   App.toggleWindow("notification-center");
          // }
        },
        onSecondaryClick: () => {
          notifications.dnd = !notifications.dnd;
        },
      }),
      // Widget.Button({
      //   label: "Clear",
      //   onClicked: () => {
      //     notifications.clear();
      //   },
      // }),
    ],
  });
}