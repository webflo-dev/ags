import Widget from "resource:///com/github/Aylur/ags/widget.js";
import { icons } from "~/icons";
import GLib from "gi://GLib";
import type { Props } from "types/widgets/label";
import { FontIcon } from "~/widgets";

type BaseProps = Props & { name: string; icon: string };
const Base = ({ name, icon, ...labelProps }: BaseProps) => {
  const label = Widget.Label({
    vpack: "baseline",
    ...labelProps,
  });

  const children = icon
    ? [
        // Widget.Label({
        //   class_name: "icon",
        //   vpack: "baseline",
        //   label: icon,
        // }),
        FontIcon({ icon }),
        label,
      ]
    : [label];

  return Widget.Box({
    name,
    class_name: "module",
    spacing: 8,
    vpack: "baseline",
    children,
  });
};

export const Date = () =>
  Base({
    name: "module-date",
    class_name: "date",
    icon: icons.calendar,
    connections: [
      [
        1000,
        (label) =>
          (label.label = GLib.DateTime.new_now_local().format("%H:%M") || ""),
      ],
    ],
  });

export const Time = () =>
  Base({
    name: "module-time",
    class_name: "time",
    icon: icons.clock,
    label: GLib.DateTime.new_now_local().format("%A %d %B"),
  });

export const l = () =>
  Widget.Box({
    spacing: 8,
    children: [Date(), Time()],
  });
