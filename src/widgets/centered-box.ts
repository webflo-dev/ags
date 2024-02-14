import Widget from "resource:///com/github/Aylur/ags/widget.js";
import AgsBox, { type BoxProps } from "~/types/widgets/box";

export type CenteredBoxProps = BoxProps<AgsBox>;
export const CenteredBox = (props: CenteredBoxProps) =>
  Widget.Box({
    vertical: true,
    vpack: "center",
    hpack: "center",
    vexpand: true,
    hexpand: true,
    ...props,
  });
