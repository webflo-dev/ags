import { DateTime } from "./date-time";
import { Workspaces } from "./workspace";
import { SystemInfo } from "./system-info";
import { Systray } from "./systray";
import { Audio } from "./audio";

const StartWidget = () =>
  Widget.Box({
    className: "left",
    spacing: 8,
    children: [Workspaces() /*, Mpris()*/],
  });

const CenterWidget = () =>
  Widget.Box({
    spacing: 8,
    className: "middle",
    children: [
      DateTime(),
      // Date(),
      // Time(),
      // ScreenrecordIndicator(),
      // ScreenshotIndicator(),
      // NotificationIndicator(),
    ],
  });

const EndWidget = () =>
  Widget.Box({
    hpack: "end",
    className: "right",
    spacing: 8,
    children: [Systray(), Audio(), SystemInfo()],
  });

export default () =>
  Widget.Window({
    name: "bar",
    className: "bar",
    exclusivity: "exclusive",
    anchor: ["top", "left", "right"],
    margins: [5, 20, 0, 20],
    child: Widget.CenterBox({
      // className: "bar",
      startWidget: StartWidget(),
      centerWidget: CenterWidget(),
      endWidget: EndWidget(),
    }),
  });
