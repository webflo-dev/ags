import Widget from "resource:///com/github/Aylur/ags/widget.js";
import * as Utils from "resource:///com/github/Aylur/ags/utils.js";
import type { WindowProps } from "~/types/widgets/window";
import type GObject from "@girs/gobject-2.0";

const OSD_DELAY_MS = 2000;

type UpdateCallback = (...args: unknown[]) => boolean;
type OSDConnection =
  | [GObject.Object, string]
  | [GObject.Object, string, UpdateCallback];

export type OSDProps = Pick<WindowProps, "anchor" | "name" | "child"> & {
  connection: OSDConnection;
};

export const OSD = ({ name, anchor = [], connection, child }: OSDProps) => {
  let _count = 0;

  return Widget.Window({
    name,
    class_name: "osd",
    layer: "overlay",
    anchor,
    child,
    connections: [
      [
        connection[0],
        (self, ...args) => {
          const updateCallback = connection[2];
          const isVisible = updateCallback
            ? updateCallback(self, ...args)
            : true;

          if (isVisible) {
            self.visible = true;
            _count++;
            Utils.timeout(OSD_DELAY_MS, () => {
              _count--;

              if (_count === 0) {
                self.visible = false;
              }
            });
          }
        },
        connection[1],
      ],
    ],
  });
};
