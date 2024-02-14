import Widget from "resource:///com/github/Aylur/ags/widget.js";
import SystemTray, {
  TrayItem,
} from "resource:///com/github/Aylur/ags/service/systemtray.js";

const SysTrayItem = (item: TrayItem) =>
  Widget.Button({
    child: Widget.Icon({
      binds: [["icon", item, "icon"]],
    }),
    binds: [["tooltip-markup", item, "tooltip-markup"]],
    on_primary_click: (_, event) => item.activate(event),
    on_secondary_click: (_, event) => item.openMenu(event),
  });

export const SysTray = () =>
  Widget.Box({
    class_name: "systray",
    binds: [
      ["children", SystemTray, "items", (i: TrayItem[]) => i.map(SysTrayItem)],
    ],
  });
