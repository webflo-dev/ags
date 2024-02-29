import { FontIcon } from "@widgets";
import { BoxProps } from "types/widgets/box";

const WINDOW_NAME = "power-menu";

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
    icon: "logout",
  },
  {
    cmd: "systemctl reboot",
    label: "Reboot",
    key: "reboot",
    icon: "reboot",
  },
  {
    cmd: "systemctl poweroff",
    label: "Shutdown",
    key: "shutdown",
    icon: "power-off",
  },
];

const actionToConfirm = Variable<Action | undefined>(undefined);

function CenteredBox(props: BoxProps) {
  return Widget.Box({
    vpack: "center",
    hpack: "center",
    ...props,
  });
}

function ActionButton(action: Action) {
  return Widget.Button({
    onClicked: () => {
      actionToConfirm.value = action;
      stack.shown = "confirmation";
      cancelButton.grab_focus();
    },
    className: action.key,
    child: Widget.Box({
      spacing: 8,
      vertical: true,
      vpack: "center",
      children: [FontIcon(action.icon), Widget.Label(action.label)],
    }),
  });
}

const actionButtons = Actions.map(ActionButton);

const cancelButton = Widget.Button({
  className: "cancel",
  label: "No",
  onClicked: () => {
    stack.shown = "selection";
  },
});

const powerMenuConfirm = Widget.Box({
  className: actionToConfirm.bind("value").as((v) => `${v?.key}`),
  vertical: true,
  children: [
    Widget.Box({
      className: "title",
      hpack: "center",
      spacing: 16,
      children: [
        FontIcon(actionToConfirm.bind("value").as((v) => v?.icon || "")),
        Widget.Label({
          label: actionToConfirm.bind("value").as((v) => v?.label || "---"),
        }),
      ],
    }),
    Widget.Box({
      className: "buttons",
      vexpand: true,
      vpack: "end",
      homogeneous: true,
      children: [
        cancelButton,
        Widget.Button({
          className: "confirm",
          label: "Yes",
          onClicked: () => {
            if (actionToConfirm.value) {
              Utils.exec(actionToConfirm.value.cmd);
            }
          },
        }),
      ],
    }),
  ],
});

const stack = Widget.Stack({
  children: {
    selection: CenteredBox({
      homogeneous: true,
      classNames: ["power-menu", "selection"],
      children: actionButtons,
    }),
    confirmation: CenteredBox({
      homogeneous: true,
      classNames: ["power-menu", "confirmation"],
      child: powerMenuConfirm,
    }),
  },
});

actionButtons
  .find((button) => button.class_name === "logout")
  ?.hook(
    stack,
    (btn) => {
      if (stack.shown === "selection") btn.grab_focus();
    },
    "notify::shown"
  );

export const PowerMenu = () => {
  return Widget.Window({
    name: WINDOW_NAME,
    popup: true,
    visible: false,
    keymode: "exclusive",
    anchor: ["top", "left", "bottom", "right"],
    child: stack,
    setup: (self) => {
      self.hook(
        App,
        (_, windowName, visible) => {
          if (windowName === WINDOW_NAME && visible) {
            stack.shown = "selection";
          }
        },
        "window-toggled"
      );
    },
  });
};

export function togglePowerMenu() {
  App.toggleWindow(WINDOW_NAME);
}
