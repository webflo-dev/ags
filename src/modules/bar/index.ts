import Widget from "resource:///com/github/Aylur/ags/widget.js";
import { Date, Time } from "./date-time";
import { Workspaces } from "./workspaces";
import { SysTray } from "./systray";
import { Audio } from "./audio";
import { SystemInfo } from "./system-info";
import { ScreenshotIndicator } from "./screenshot";
import { ScreenrecordIndicator } from "./screenrecord";
import { NotificationIndicator } from "./notification";
import { Mpris } from "./mpris";

const Left = () =>
  Widget.Box({
    class_name: "left",
    spacing: 8,
    children: [Workspaces(), Mpris()],
  });

const Center = () =>
  Widget.Box({
    spacing: 8,
    class_name: "middle",
    children: [
      Date(),
      Time(),
      ScreenrecordIndicator(),
      ScreenshotIndicator(),
      NotificationIndicator(),
    ],
  });

const Right = () =>
  Widget.Box({
    class_name: "right",
    spacing: 8,
    children: [Widget.Box({ hexpand: true }), Audio(), SysTray(), SystemInfo()],
  });

type BarProps = {
  monitor?: number;
};

export const Bar = ({ monitor = 0 }: BarProps = {}) =>
  Widget.Window({
    name: `bar-${monitor}`,
    class_name: "bar",
    exclusive: true,
    monitor,
    anchor: ["top", "left", "right"],
    child: Widget.CenterBox({
      class_name: "bar",
      start_widget: Left(),
      center_widget: Center(),
      end_widget: Right(),
    }),
  });
