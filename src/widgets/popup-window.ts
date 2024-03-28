import Gtk from "gi://Gtk?version=3.0";
import { BoxProps } from "types/widgets/box";
import { RevealerProps } from "types/widgets/revealer";

type Placement =
  | "top-left"
  | "top-center"
  | "top-right"
  | "middle-left"
  | "center"
  | "middle-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

type VoidFunction = () => void;

const placementTransistion: Record<Placement, RevealerProps["transition"]> = {
  "top-left": "slide_down",
  "top-center": "slide_down",
  "top-right": "slide_down",
  "middle-left": "slide_right",
  center: "crossfade",
  "middle-right": "slide_left",
  "bottom-left": "slide_up",
  "bottom-center": "slide_up",
  "bottom-right": "slide_up",
};

const hpack: Record<Placement, "start" | "center" | "end"> = {
  "top-left": "start",
  "top-center": "center",
  "top-right": "end",
  "middle-left": "start",
  center: "center",
  "middle-right": "end",
  "bottom-left": "start",
  "bottom-center": "center",
  "bottom-right": "end",
};

type PopupRevealerRevealerProps = {
  name: string;
  placement: Placement;
  child: BoxProps["child"];
};

function PopupRevealer({ child, name, placement }: PopupRevealerRevealerProps) {
  return Widget.Revealer({
    transition: placementTransistion[placement],
    child: Widget.Box({
      // css: "* { border: 1px solid blue;}",
      hexpand: false,
      vexpand: false,
      child,
    }),
    setup: (self) =>
      self.hook(App, (_, wname, visible) => {
        if (wname === name) self.reveal_child = visible;
      }),
  });
}

function Closer(onClose: VoidFunction) {
  return (match: boolean = true) =>
    Widget.EventBox({
      // css: "* { border: 1px solid cyan;}",
      hexpand: true,
      vexpand: !match,
      canFocus: false,
      onPrimaryClick: onClose,
      onMiddleClick: onClose,
      onSecondaryClick: onClose,
    });
}

type SlotProps = {
  child: PopupWindowProps["child"];
  name: string;
  placement: Placement;
};
function Slot({ child, name, placement }: SlotProps) {
  const closer = Closer(() => App.closeWindow(name));
  const _child = PopupRevealer({ child, name, placement });

  let children: Gtk.Widget[] = [];

  switch (hpack[placement]) {
    case "center":
      children = [closer(), _child, closer()];
      break;
    case "start":
      children = [_child, closer()];
      break;
    case "end":
      children = [closer(), _child];
      break;
  }

  return (requestPlacement: Placement) =>
    requestPlacement === placement ? Widget.Box({ children }) : closer(false);
}

type PopupWindowProps = {
  name: string;
  placement: Placement;
  child: RevealerProps["child"];
};
export function PopupWindow({ child, name, placement }: PopupWindowProps) {
  const slot = Slot({ child, name, placement });

  return Widget.Window({
    name,
    keymode: "on-demand",
    classNames: [name, "popup-window"],
    setup: (w) => {
      w.keybind("Escape", () => {
        App.closeWindow(name);
      });
    },
    visible: false,
    layer: "top",
    anchor: ["top", "bottom", "right", "left"],
    child: Widget.Box({
      children: [
        Widget.Box({
          vertical: true,
          children: [
            slot("top-left"),
            slot("middle-left"),
            slot("bottom-left"),
          ],
        }),
        Widget.Box({
          vertical: true,
          children: [slot("top-center"), slot("center"), slot("bottom-center")],
        }),
        Widget.Box({
          vertical: true,
          children: [
            slot("top-right"),
            slot("middle-right"),
            slot("bottom-right"),
          ],
        }),
      ],
    }),
  });
}
