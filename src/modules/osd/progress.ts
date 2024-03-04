import type Gtk from "gi://Gtk?version=3.0";

type ProgressProps = {
  height?: number;
  width?: number;
  vertical?: boolean;
  child: Gtk.Widget;
};

export function Progress({
  height = 50,
  width = 250,
  vertical = true,
}: ProgressProps) {
  const fill = Widget.Box({
    className: "fill",
    hexpand: vertical,
    vexpand: !vertical,
    hpack: vertical ? "fill" : "start",
    vpack: vertical ? "end" : "fill",
  });

  const container = Widget.Box({
    child: fill,
    css: `min-width: ${width}px; min-height: ${height}px;`,
  });

  return Object.assign(container, {
    setValue: (value: number) => {
      if (value < 0) return "";

      const axis = vertical ? "height" : "width";
      const axisv = vertical ? height : width;
      const current_fill = (axisv * value) / 100;
      fill.css = `min-${axis}: ${current_fill}px;`;
    },
  });
}
