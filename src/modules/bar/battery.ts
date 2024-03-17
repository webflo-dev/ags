import { clsx } from "clsx";
import icons from "@icons";

const battery = await Service.import("battery");
const powerProfiles = await Service.import("powerprofiles");

function getLevel(value: number) {
  if (value < 5) return { key: "empty", icon: icons.battery.empty };
  if (value < 10) return { key: "low", icon: icons.battery.low };
  if (value < 25) return { key: "quarter", icon: icons.battery.quarter };
  if (value < 50) return { key: "half", icon: icons.battery.half };
  if (value < 75)
    return { key: "three-quarters", icon: icons.battery.threeQuarters };
  return { key: "full", icon: icons.battery.full };
}

function BatteryIcon() {
  return Widget.Icon().hook(battery, (widget) => {
    if (battery.charging || battery.charged) {
      widget.icon = icons.battery.charging;
    } else {
      widget.icon = getLevel(battery.percent).icon;
    }
  });
}

function PowerProfile() {
  if (powerProfiles === undefined) {
    return Widget.Box();
  }

  const menu = Widget.Menu({
    children: powerProfiles?.bind("profiles").as((profiles) => {
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
                      ? icons.ui.check
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
      icon: powerProfiles
        .bind("active_profile")
        .as((profile) => icons.powerProfiles[profile] || ""),
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
        [getLevel(battery.percent).key]: !charging,
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
