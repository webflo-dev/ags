import { DateTime } from "./date-time";
import { Workspaces } from "./workspace";
import { SystemInfo } from "./system-info";
import { Systray } from "./systray";
import { Audio } from "./audio";
import { Notification } from "./notification";
import { Battery } from "./battery";
import { Mpris } from "./mpris";
import { ClientState } from "./client-state";
import { Screenshot } from "./screenshot";
import { Screenrecord } from "./screen-record";

const StartWidget = () =>
  Widget.Box({
    className: "left",
    spacing: 8,
    children: [
      Workspaces(),
      ClientState(),
      Mpris(),
      Widget.Box({
        hpack: "end",
        hexpand: true,
        children: [Screenshot(), Screenrecord()],
      }),
    ],
  });

function Settings() {
  return Widget.Button({
    className: "settings",
    child: Widget.Icon("emblem-system-symbolic"),
    onClicked: () => {
      App.toggleWindow("settings-dialog");
    },
  });
}

const CenterWidget = () =>
  Widget.Box({
    spacing: 8,
    className: "middle",
    hpack: "center",
    children: [Settings(), DateTime()],
  });

const EndWidget = () =>
  Widget.Box({
    className: "right",
    spacing: 8,
    children: [
      Notification(),
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
