import Widget from "resource:///com/github/Aylur/ags/widget.js";
import App from "resource:///com/github/Aylur/ags/app.js";
import { CenteredBox, type CenteredBoxProps } from "./centered-box";
import type { WindowProps } from "~/types/widgets/window";

type PopupWindowProps = Pick<
  WindowProps,
  "popup" | "focusable" | "anchor" | "child"
> & {
  name: NonNullable<WindowProps["name"]>;
};

export const PopupWindow = ({
  name,
  popup = true,
  focusable = true,
  anchor = [],
  child,
}: PopupWindowProps) => {
  const _window = Widget.Window({
    name,
    popup,
    focusable,
    anchor,
    visible: false,
    child,
  });

  _window.connect("button-release-event", (emitter) => {
    const [x, y] = emitter.get_pointer();
    if (x === 0 && y === 0) {
      App.closeWindow(name);
    }
  });

  return _window;
};

type BlockingWindowProps = Pick<WindowProps, "name" | "popup"> & {
  childProps: CenteredBoxProps;
};
export const BlockingWindow = ({
  name,
  popup = false,
  childProps,
}: BlockingWindowProps) =>
  Widget.Window({
    name,
    visible: false,
    popup,
    focusable: true,
    anchor: ["top", "left", "bottom", "right"],
    child: CenteredBox(childProps),
  });
