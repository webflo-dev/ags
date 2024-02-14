import App from "resource:///com/github/Aylur/ags/app.js";
import Widget from "resource:///com/github/Aylur/ags/widget.js";
import Variable from "resource:///com/github/Aylur/ags/variable.js";
import * as Utils from "resource:///com/github/Aylur/ags/utils.js";

import { BlockingWindow } from "~/widgets";
import { icons } from "~/icons";

export const WINDOW_NAME_POWERMENU = "power-menu";
export const WINDOW_NAME_CONFIRM = "power-menu-confirm";

type Action = {
  cmd: string;
  label: string;
  key: string;
  icon: string;
};
const Actions: ReadonlyArray<Action> = <const>[
  {
    cmd: "loginctl terminate-session self",
    label: "Log Out",
    key: "logout",
    icon: icons.powerMenu.logout,
  },
  {
    cmd: "systemctl reboot",
    label: "Reboot",
    key: "reboot",
    icon: icons.powerMenu.reboot,
  },
  {
    cmd: "systemctl poweroff",
    label: "Shutdown",
    key: "shutdown",
    icon: icons.powerMenu.shutdown,
  },
];

const confirmInfo = Variable<Action>({
  label: "",
  cmd: "",
  icon: "",
  key: "",
});

function confirm(action: Action) {
  confirmInfo.value = action;
  App.openWindow(WINDOW_NAME_CONFIRM);
}

export const ConfirmWindow = () =>
  Widget.Window({
    name: WINDOW_NAME_CONFIRM,
    expand: true,
    visible: false,
    anchor: [],
    focusable: true,
    popup: true,
    child: Widget.Box({
      class_name: "confirmation",
      vertical: true,
      homogeneous: true,
      binds: [
        ["className", confirmInfo, "value", ({ key }) => `confirmation ${key}`],
      ],
      children: [
        Widget.Box({
          class_name: "title",
          vertical: false,
          vexpand: true,
          hpack: "center",
          children: [
            Widget.Label({
              class_name: "icon",
              binds: [["label", confirmInfo, "value", ({ icon }) => icon]],
            }),
            Widget.Label({
              binds: [["label", confirmInfo, "value", ({ label }) => label]],
            }),
          ],
        }),
        Widget.Box({
          class_name: "buttons",
          vexpand: true,
          vpack: "end",
          homogeneous: true,
          children: [
            Widget.Button({
              class_name: "no",
              child: Widget.Label("No"),
              on_clicked: () => App.closeWindow(WINDOW_NAME_CONFIRM),
            }),
            Widget.Button({
              class_name: "yes",
              child: Widget.Label("Yes"),
              on_clicked: () => {
                Utils.exec(confirmInfo.value.cmd);
              },
            }),
          ],
        }),
      ],
    }),
  });

const Button = (action: Action) =>
  Widget.Button({
    on_clicked: () => {
      confirm(action);
    },
    vpack: "center",
    class_name: action.key,
    child: Widget.Box({
      spacing: 8,
      vertical: true,
      children: [
        Widget.Label({ class_name: "icon", label: action.icon }),
        Widget.Label(action.label),
      ],
    }),
  });

export const PowerMenuWindow = () =>
  BlockingWindow({
    name: WINDOW_NAME_POWERMENU,
    popup: true,
    childProps: {
      vertical: false,
      homogeneous: true,
      class_name: "power-menu",
      children: Actions.map(Button),
    },
  });
