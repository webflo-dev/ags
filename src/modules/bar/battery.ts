import { clsx } from "clsx";

const battery = await Service.import("battery");
const powerProfiles = await Service.import("powerprofiles");

function getLevel(value: number) {
  if (value < 5) return "empty";
  if (value < 10) return "low";
  if (value < 25) return "quarter";
  if (value < 50) return "half";
  if (value < 75) return "three-quarters";
  return "full";
}

function BatteryIcon() {
  return Widget.Icon().hook(battery, (widget) => {
    if (battery.charging || battery.charged) {
      widget.icon = "_battery-bolt-symbolic";
    } else {
      widget.icon = `_battery-${getLevel(battery.percent)}-symbolic`;
    }
  });
}

function PowerProfile() {
  const menu = Widget.Menu({
    children: powerProfiles.bind("profiles").as((profiles) => {
      return profiles.map((profile) => {
        return Widget.MenuItem({
          onActivate: () => {
            powerProfiles.active_profile = profile.Profile;
          },
          child: Widget.Box({
            spacing: 8,
            children: [
              Widget.Icon({
                icon: powerProfiles
                  .bind("active_profile")
                  .as((activeProfile) => {
                    return profile.Profile === activeProfile
                      ? "_check-symbolic"
                      : "";
                  }),
              }),
              Widget.Label({
                label: profile.Profile,
              }),
            ],
          }),
        });
      });
    }),
  });

  return Widget.EventBox({
    onSecondaryClick: (_, event) => {
      menu.popup_at_pointer(event);
    },
    child: Widget.Icon({
      icon: powerProfiles.bind("active_profile").as((profile) => {
        switch (profile) {
          case "performance":
            return "_gauge-max-symbolic";
          case "power-saver":
            return "_gauge-min-symbolic";
          default:
            return "_gauge-symbolic";
        }
      }),
    }),
  });
}

export function Battery() {
  return Widget.Box({
    name: "battery",
    className: Utils.watch("", battery, () => {
      const charging = battery.charging || battery.charged;
      return clsx({
        charging,
        [getLevel(battery.percent)]: !charging,
      });
    }),
    visible: battery.bind("available"),
    spacing: 8,
    children: [
      Widget.Box({
        className: "battery",
        spacing: 8,
        children: [
          PowerProfile(),
          BatteryIcon(),
          Widget.Label({
            label: battery.bind("percent").as((percent) => `${percent}%`),
          }),
        ],
      }),
    ],
  });
}
