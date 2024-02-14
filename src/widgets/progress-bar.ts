import Widget from "resource:///com/github/Aylur/ags/widget.js";
import type GObject from "@girs/gobject-2.0";

const PROGRESS_OSD_DEFAULTS = <const>{
  width: 50,
  height: 250,
};

type UpdateCallback = (...args: unknown[]) =>
  | {
      value: number;
      icon: string;
      classNames?: Array<[string, boolean]>;
    }
  | undefined;

type ProgressbarConnection =
  | [GObject.Object, string]
  | [GObject.Object, string, UpdateCallback];

export type ProgressbarProps = {
  anchor: "center" | "right";
  connection: ProgressbarConnection;
};

export const Progressbar = ({ anchor, connection }: ProgressbarProps) => {
  const isAnchorRight = anchor === "right";

  const width = isAnchorRight
    ? PROGRESS_OSD_DEFAULTS.width
    : PROGRESS_OSD_DEFAULTS.height;
  const height = isAnchorRight
    ? PROGRESS_OSD_DEFAULTS.height
    : PROGRESS_OSD_DEFAULTS.width;

  const progressIcon = Widget.Label({
    class_name: "icon",
    hpack: isAnchorRight ? "center" : "start",
    vpack: isAnchorRight ? "end" : "center",
  });

  const progressBar = Widget.Box({
    class_name: "progress-bar",
    hexpand: isAnchorRight,
    vexpand: !isAnchorRight,
    hpack: isAnchorRight ? "fill" : "start",
    vpack: isAnchorRight ? "end" : "fill",
  });

  return Widget.Box({
    vertical: isAnchorRight,
    class_name: `progress ${isAnchorRight ? "vertical" : "horizontal"}`,
    child: Widget.Overlay({
      child: progressBar,
      overlays: [progressIcon],
    }),
    css: `min-width: ${width}px; min-height: ${height}px;`,
    connections: [
      [
        connection[0],
        (box, ...args) => {
          const updateCallback = connection[2];
          if (!updateCallback) return;

          const updateValues = updateCallback(...args);
          if (!updateValues) return;

          const progressBarValue =
            (isAnchorRight ? height : width) * updateValues.value;
          progressBar.setCss(
            `min-${isAnchorRight ? "height" : "width"}: ${progressBarValue}px`
          );

          progressIcon.label = updateValues.icon;

          updateValues.classNames?.forEach(([className, condition]) => {
            box.toggleClassName(className, condition);
          });
        },
        connection[1],
      ],
    ],
  });
};
