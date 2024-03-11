import { type WindowProps } from "types/widgets/window";
import type Gtk from "gi://Gtk?version=3.0";
import { Padding } from "./padding";

type PopupWindowProps = Omit<WindowProps, "name"> & {
  name: string;
  layout?: keyof ReturnType<typeof Layout>;
};

// const PopupRevealer = (
//   name: string,
//   child: Child,
//   transition: Transition = "slide_down"
// ) =>
//   Widget.Box(
//     { css: "padding: 1px;" },
//     Widget.Revealer({
//       transition,
//       child: Widget.Box({
//         class_name: "window-content",
//         child,
//       }),
//       // transitionDuration: options.transition.bind(),
//       setup: (self) =>
//         self.hook(App, (_, wname, visible) => {
//           if (wname === name) self.reveal_child = visible;
//         }),
//     })
//   );

const Layout = (name: string, child: Gtk.Widget) => ({
  center: () =>
    Widget.CenterBox(
      {},
      Padding(name),
      Widget.CenterBox(
        { vertical: true },
        Padding(name),
        child,
        // PopupRevealer(name, child, transition),
        Padding(name)
      ),
      Padding(name)
    ),
  top: () =>
    Widget.CenterBox(
      {},
      Padding(name),
      Widget.Box(
        { vertical: true },
        child,
        // PopupRevealer(name, child, transition),
        Padding(name)
      ),
      Padding(name)
    ),
  "top-right": () =>
    Widget.Box(
      {},
      Padding(name),
      Widget.Box(
        {
          hexpand: false,
          vertical: true,
        },
        child,
        // PopupRevealer(name, child, transition),
        Padding(name)
      )
    ),
  "top-center": () =>
    Widget.Box(
      {},
      Padding(name),
      Widget.Box(
        {
          hexpand: false,
          vertical: true,
        },
        child,
        // PopupRevealer(name, child, transition),
        Padding(name)
      ),
      Padding(name)
    ),
  "top-left": () =>
    Widget.Box(
      {},
      Widget.Box(
        {
          hexpand: false,
          vertical: true,
        },
        child,
        // PopupRevealer(name, child, transition),
        Padding(name)
      ),
      Padding(name)
    ),
  "bottom-left": () =>
    Widget.Box(
      {},
      Widget.Box(
        {
          hexpand: false,
          vertical: true,
        },
        Padding(name),
        child
        // PopupRevealer(name, child, transition)
      ),
      Padding(name)
    ),
  "bottom-center": () =>
    Widget.Box(
      {},
      Padding(name),
      Widget.Box(
        {
          hexpand: false,
          vertical: true,
        },
        Padding(name),
        child
        // PopupRevealer(name, child, transition)
      ),
      Padding(name)
    ),
  "bottom-right": () =>
    Widget.Box(
      {},
      Padding(name),
      Widget.Box(
        {
          hexpand: false,
          vertical: true,
        },
        Padding(name),
        child
        // PopupRevealer(name, child, transition)
      )
    ),
});

export function PopupWindow({
  name,
  child,
  layout = "center",
  exclusivity = "ignore",
  ...props
}: PopupWindowProps) {
  return Widget.Window<Gtk.Widget>({
    name,
    class_names: [name, "popup-window"],
    setup: (w) => w.keybind("Escape", () => App.closeWindow(name)),
    visible: false,
    keymode: "on-demand",
    exclusivity,
    layer: "top",
    anchor: ["top", "bottom", "right", "left"],
    child: Layout(name, Widget.Box({ child }))[layout](),
    ...props,
  });
}
