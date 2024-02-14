import Widget from "resource:///com/github/Aylur/ags/widget.js";
import Battery from "resource:///com/github/Aylur/ags/service/battery.js";

const BatteryModule = () =>
  Widget.Box({
    class_name: "battery",
    children: [
      Widget.Icon({
        connections: [
          [
            Battery,
            (self) => {
              self.icon = `battery-level-${
                Math.floor(Battery.percent / 10) * 10
              }-symbolic`;
            },
          ],
        ],
      }),
      Widget.ProgressBar({
        vpack: "center",
        connections: [
          [
            Battery,
            (self) => {
              if (Battery.percent < 0) return;

              self.fraction = Battery.percent / 100;
            },
          ],
        ],
      }),
    ],
  });

export { BatteryModule as Battery };
