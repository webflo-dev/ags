import Gtk from "gi://Gtk";
import AgsLabel from "resource:///com/github/Aylur/ags/widgets/label.js";
import GObject from "gi://GObject";
import type { Props as AgsLabelProps } from "~/types/widgets/label";

type FontIconProps = AgsLabelProps & { icon?: string };

class FontIconClass extends AgsLabel {
  static {
    GObject.registerClass(this);
  }

  constructor({ icon, ...labelProps }: FontIconProps) {
    super(labelProps);
    this.toggleClassName("font-icon");

    if (icon) {
      this.icon = icon;
    }
  }

  get icon() {
    return this.label;
  }
  set icon(icon: string) {
    this.label = icon;
  }

  get size() {
    return this.get_style_context().get_property(
      "font-size",
      Gtk.StateFlags.NORMAL
    );
  }

  vfunc_get_preferred_height(): [number, number] {
    return [this.size, this.size];
  }

  vfunc_get_preferred_width(): [number, number] {
    return [this.size, this.size];
  }
}

export const FontIcon = (params: FontIconProps) => new FontIconClass(params);
