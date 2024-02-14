import Widget from "resource:///com/github/Aylur/ags/widget.js";
import { ScreenshotService } from "../../services/index.js";
import { icons } from "~/icons";

export const ScreenshotIndicator = () =>
  Widget.Box({
    name: "screenshot",
    spacing: 8,
    children: [
      Widget.Label({
        class_name: "icon",
        label: icons.camera,
      }),
      Widget.Label({
        label: "taking screenshot...",
      }),
    ],
    binds: [["visible", ScreenshotService, "busy"]],
  });
