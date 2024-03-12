import { DateTime } from "./date-time";
import { Workspaces } from "./workspace";
import { SystemInfo } from "./system-info";
import { Systray } from "./systray";
import { Audio } from "./audio";
import { NotificationIndicator } from "./notification-indicator";
import { Battery } from "./battery";

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
    hpack: "center",
    children: [
      DateTime(),
      // Date(),
      // Time(),
      // ScreenrecordIndicator(),
      // ScreenshotIndicator(),
    ],
  });

const EndWidget = () =>
  Widget.Box({
    className: "right",
    spacing: 8,
    children: [
      NotificationIndicator(),
      Widget.Box({
        hpack: "end",
        hexpand: true,
        spacing: 8,
        children: [Systray(), Audio(), SystemInfo(), Battery()],
      }),
    ],
  });

export const TopBar = () =>
  Widget.Window({
    name: "bar",
    className: "bar",
    exclusivity: "exclusive",
    anchor: ["top", "left", "right"],
    margins: [5, 20, 0, 20],
    child: Widget.CenterBox({
      spacing: 8,
      // className: "bar",
      startWidget: StartWidget(),
      centerWidget: CenterWidget(),
      endWidget: EndWidget(),
    }),
  });
