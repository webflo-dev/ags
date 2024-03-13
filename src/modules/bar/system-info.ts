import { SystemInfo as SystemInfoService } from "@services";
import icons from "@icons";
import { clsx } from "clsx";
import type { Binding } from "types/service";

const levels = [
  { thresold: 90, value: "critical" },
  { thresold: 70, value: "warning" },
] as const;
function getLevel(value: string) {
  const current = Number(value);
  return levels.find(({ thresold }) => current >= thresold)?.value;
}

function SystemModule(
  icon: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  binding: Binding<any, any, string>
) {
  return Widget.Box({
    spacing: 8,
    className: binding.as((v) => {
      return clsx("info", getLevel(v));
    }),
    children: [
      Widget.Icon({ icon }),
      Widget.Label({
        label: binding.as((v) => `${v.padStart(2, " ")}%`),
      }),
    ],
  });
}

export function SystemInfo() {
  return Widget.Box({
    name: "system-info",
    spacing: 24,

    children: [
      SystemModule(
        icons.systemInfo.cpu,
        SystemInfoService.cpu.bind().as(({ usage }) => `${usage}`)
      ),
      SystemModule(
        icons.systemInfo.memory,
        SystemInfoService.memory
          .bind()
          .as(({ used, total }) => Math.floor((used / total) * 100).toString())
      ),
      SystemModule(
        icons.systemInfo.gpu,
        SystemInfoService.gpu.bind().as(({ usage }) => `${usage}`)
      ),
    ],
  });
}
