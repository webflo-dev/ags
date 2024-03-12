import { OnScreenProgress } from "./on-screen-progress";

export const VolumeOSD = () =>
  Widget.Window({
    name: "osd",
    layer: "overlay",
    clickThrough: true,
    anchor: ["right", "left", "top", "bottom"],
    child: Widget.Box({
      className: "overlay",
      expand: true,
      child: Widget.Overlay(
        {
          child: Widget.Box({
            expand: true,
          }),
        },
        Widget.Box({
          hpack: "end",
          vpack: "center",
          child: OnScreenProgress({ vertical: true, delay: 2500 }),
        })
        // Widget.Box({
        //   hpack: "center",
        //   vpack: "end",
        //   child: MicrophoneMute(),
        // })
      ),
    }),
  });
