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
    icon: "_logout-symbolic",
  },
  {
    cmd: "systemctl reboot",
    label: "Reboot",
    key: "reboot",
    icon: "_reboot-symbolic",
  },
  {
    cmd: "systemctl poweroff",
    label: "Shutdown",
    key: "shutdown",
    icon: "_power-off-symbolic",
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

type ActionButtonProps = {
  action: Action;
  onClicked: () => void;
};

function ActionButton({ action, onClicked }: ActionButtonProps) {
  return Widget.Button({
    onClicked: () => {
      actionToConfirm.value = action;
      onClicked();
    },
    attribute: action.key,
    className: action.key,
    child: Widget.Box({
      spacing: 8,
      vertical: true,
      vpack: "center",
      children: [
        Widget.Icon({ icon: action.icon }),
        Widget.Label(action.label),
      ],
    }),
  });
}

type PowerMenuConfirmProps = {
  onCancel: () => void;
  onConfirm: (action: Action) => void;
};

function PowerMenuConfirm({ onCancel, onConfirm }: PowerMenuConfirmProps) {
  const cancelBtn = Widget.Button({
    className: "cancel",
    label: "No",
    onClicked: onCancel,
  });

  const menu = Widget.Box({
    className: actionToConfirm.bind("value").as((v) => `${v?.key}`),
    vertical: true,
    children: [
      Widget.Box({
        className: "title",
        hpack: "center",
        spacing: 16,
        children: [
          Widget.Icon({
            icon: actionToConfirm.bind("value").as((v) => v?.icon || ""),
          }),
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
          cancelBtn,
          Widget.Button({
            className: "confirm",
            label: "Yes",
            onClicked: () => {
              if (actionToConfirm.value) {
                onConfirm(actionToConfirm.value);
              }
            },
          }),
        ],
      }),
    ],
  });

  return Object.assign(menu, {
    onShown: () => {
      cancelBtn.grab_focus();
    },
  });
}

export function PowerMenu() {
  const actionButtons = Actions.map((action) =>
    ActionButton({
      action,
      onClicked: () => {
        stack.shown = "confirmation";
      },
    })
  );

  const confirmMenu = PowerMenuConfirm({
    onCancel: () => {
      stack.shown = "selection";
    },
    onConfirm: (action) => {
      Utils.exec(action.cmd);
    },
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
        child: confirmMenu,
      }),
    },
  }).on("notify::shown", (_) => {
    switch (_.shown) {
      case "selection":
        actionButtons.find((btn) => btn.attribute === "logout")?.grab_focus();
        break;
      case "confirmation":
        confirmMenu.onShown();
        break;
    }
  });

  return Widget.Window({
    name: WINDOW_NAME,
    visible: false,
    keymode: "exclusive",
    anchor: ["top", "left", "bottom", "right"],
    exclusivity: "ignore",
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
  }).keybind("Escape", () => App.closeWindow(WINDOW_NAME));
}

export function togglePowerMenu() {
  App.toggleWindow(WINDOW_NAME);
}
