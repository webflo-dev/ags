import Widget from "resource:///com/github/Aylur/ags/widget.js";
import { icons } from "~/icons";
import { SystemInfoService } from "~/services";

type Level = "normal" | "warning" | "critical";

function getLevel(value: number): Level {
  if (value >= 70 && value < 90) return "warning";
  if (value >= 90) return "critical";
  return "normal";
}

const System = (
  signalName: string,
  icon: string,
  transform: (data: any) => string
) => {
  const childLabel = Widget.Label({
    label: "---",
    class_name: "text monospace",
  });
  const childIcon = Widget.Label({
    class_name: "icon",
    label: icon,
  });

  return Widget.Box({
    spacing: 8,
    children: icon ? [childIcon, childLabel] : [childLabel],
    connections: [
      [
        SystemInfoService,
        (self) => {
          const data = SystemInfoService[signalName];
          const value = transform(data);
          childLabel.label = `${value.padStart(2, " ")}%`;
          self.class_name = getLevel(Number.parseFloat(value));
        },
        `notify::${signalName}`,
      ],
    ],
  });
};

export const SystemInfo = () =>
  Widget.Box({
    class_name: "system-info",
    spacing: 24,
    children: [
      System("cpu", icons.cpu, ({ usage }) => usage),
      System("memory", icons.memory, ({ total, used }) =>
        Math.floor((used / total) * 100).toString()
      ),
      System("gpu", icons.gpu, ({ usage }) => usage),
    ],
  });
