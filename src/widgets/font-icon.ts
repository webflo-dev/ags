/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Binding } from "types/service";

type Props = {
  icon?: string | Binding<any, any, string>;
  className?: string | Binding<any, any, string>;
};

export const FontIcon = ({ icon, className }: Props = {}) =>
  Widget.Icon({
    icon: bind(icon, getFontIconName),
    className: bind(className, getFontIconClassName),
  });

function bind(
  value: string | Binding<any, any, string> | undefined,
  getter: (value: string | undefined) => string
) {
  return !value || typeof value === "string" ? getter(value) : value.as(getter);
}

export function getFontIconClassName(className: string | undefined): string {
  return `font-icon ${className}`;
}

export function getFontIconName(shortName: string | undefined): string {
  return !shortName ? "" : `fa-${shortName}-symbolic`;
}
// FontIcon.getName = function (shortName: string) {
//   return !shortName ? "" : `fa-${shortName}-symbolic`;
// };
