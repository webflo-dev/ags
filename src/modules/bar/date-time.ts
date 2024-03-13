import GLib from "gi://GLib?version=2.0";
import icons from "@icons";

const Date = Widget.Label();
const Time = Widget.Label();

export function DateTime() {
  return Widget.Box({
    name: "date-time",
    spacing: 8,
    child: Widget.Box({
      className: "date-time",
      spacing: 16,
      children: [
        Widget.Box({
          className: "date",
          spacing: 8,
          children: [Widget.Icon({ icon: icons.dateTime.calendar }), Date],
        }),
        Widget.Box({
          className: "time",
          spacing: 8,
          children: [Widget.Icon({ icon: icons.dateTime.clock }), Time],
        }),
      ],
      setup: (self) => {
        self.poll(1000, () => {
          const now = GLib.DateTime.new_now_local();
          Date.label = now.format("%A %d %B") || "";
          Time.label = now.format("%H:%M") || "";
        });
      },
    }),
  });
}
