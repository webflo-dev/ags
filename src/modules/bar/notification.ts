import icons from "@icons";
import { clsx } from "clsx";
import type { Notification as Notif } from "types/service/notifications";

const notifications = await Service.import("notifications");

function AppIcon({ app_icon, app_entry }: Notif) {
  if (Utils.lookUpIcon(app_icon)) return app_icon;
  if (Utils.lookUpIcon(app_entry)) return app_entry;
}

export function Notification() {
  const _dnd = notifications.bind("dnd");
  const _notifications = notifications.bind("notifications");

  const messageIcon = Widget.Icon();
  const messageLabel = Widget.Label();

  return Widget.Box({
    name: "notification",
    className: Utils.merge([_dnd, _notifications], (dnd, notifications) =>
      clsx({
        dnd: dnd,
        empty: notifications.length === 0,
      })
    ),
    children: [
      Widget.Button({
        child: Widget.Box({
          children: [
            Widget.Icon({
              icon: _dnd.as((dnd) =>
                dnd
                  ? icons.notifications.dnd.enabled
                  : icons.notifications.dnd.disabled
              ),
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
        },
        onSecondaryClick: () => {
          notifications.dnd = !notifications.dnd;
        },
      }),
    ],
  });
}
