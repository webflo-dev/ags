import { Screenshot } from "@services";
import icons from "@icons";

export function ScreenshotIndicator() {
  return Widget.Box({
    name: "screenshot-indicator",
    spacing: 8,
    visible: Screenshot.bind().as(({ busy }) => busy),
    children: [
      Widget.Icon({
        icon: icons.camera,
      }),
      // Widget.Label("taking screenshot"),
    ],
  });
}
