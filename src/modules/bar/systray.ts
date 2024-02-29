import { type TrayItem } from "types/service/systemtray";
import Gdk from "gi://Gdk";

const systemtray = await Service.import("systemtray");

const SysTrayItem = (item: TrayItem) =>
  Widget.Button({
    className: "systray-item",
    child: Widget.Icon({ icon: item.bind("icon") }),
    tooltipMarkup: item.bind("tooltip_markup"),

    onPrimaryClick: (btn) =>
      item.menu?.popup_at_widget(
        btn,
        Gdk.Gravity.SOUTH,
        Gdk.Gravity.NORTH,
        null
      ),

    onSecondaryClick: (btn) =>
      item.menu?.popup_at_widget(
        btn,
        Gdk.Gravity.SOUTH,
        Gdk.Gravity.NORTH,
        null
      ),
  });

export const Systray = () =>
  Widget.Box({
    name: "systray",
    spacing: 16,
  }).bind("children", systemtray, "items", (i) => i.map(SysTrayItem));
