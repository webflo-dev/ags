import type { Binding } from "types/service";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const FontIcon = (icon: string | Binding<any, any, string>) =>
  Widget.Icon({
    icon:
      typeof icon === "string"
        ? FontIcon.getName(icon)
        : icon.as(FontIcon.getName),
    classNames: ["font-icon"],
  });

FontIcon.getName = function (shortName: string) {
  return !shortName ? "" : `fa-${shortName}-symbolic`;
};
