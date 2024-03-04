import { SystemInfo as SystemInfoService } from "@services";
import { FontIcon } from "@widgets";
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
      FontIcon(icon),
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
        "processor-symbolic",
        SystemInfoService.cpu.bind().as(({ usage }) => `${usage}`)
      ),
      SystemModule(
        "memory-symbolic",
        SystemInfoService.memory
          .bind()
          .as(({ used, total }) => Math.floor((used / total) * 100).toString())
      ),
      SystemModule(
        "gpu-symbolic",
        SystemInfoService.gpu.bind().as(({ usage }) => `${usage}`)
      ),
    ],
  });
}
