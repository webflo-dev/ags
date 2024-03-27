import { Screenshot as ScreenshotService } from "@services";
import icons from "@icons";

export function Screenshot() {
  return Widget.Box({
    name: "screenshot",
    spacing: 8,
    visible: ScreenshotService.bind().as(({ busy }) => busy),
    children: [
      Widget.Icon({
        icon: icons.camera,
      }),
      // Widget.Label("taking screenshot"),
    ],
  });
}
