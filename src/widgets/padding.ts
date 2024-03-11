import { EventBoxProps } from "types/widgets/eventbox";

export const Padding = (
  name: string,
  { css = "", hexpand = true, vexpand = true }: EventBoxProps = {}
) =>
  Widget.EventBox({
    hexpand,
    vexpand,
    can_focus: false,
    child: Widget.Box({ css }),
    setup: (w) => w.on("button-press-event", () => App.toggleWindow(name)),
  });
