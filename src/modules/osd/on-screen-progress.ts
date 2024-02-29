import { FontIcon } from "@widgets";
import { Progress } from "./progress";

const audio = await Service.import("audio");

type OnScreenProgressProps = {
  vertical: boolean;
  delay: number;
};

export function OnScreenProgress({ vertical, delay }: OnScreenProgressProps) {
  const indicator = Widget.Icon({
    size: 32,
    className: "font-icon",
    vpack: "end",
    hexpand: true,
  });

  const progress = Progress({
    vertical,
    width: vertical ? 50 : 250,
    height: vertical ? 250 : 50,
    child: indicator,
  });

  const revealer = Widget.Revealer({
    transition: "slide_left",
    child: progress,
  });

  let count = 0;
  function show(value: number, icon: string) {
    revealer.reveal_child = true;
    indicator.icon = icon;
    progress.setValue(value);
    count++;
    Utils.timeout(delay, () => {
      count--;

      if (count === 0) revealer.reveal_child = false;
    });
  }

  return (
    revealer
      // .hook(
      //   brightness,
      //   () => show(brightness.screen, icons.brightness.screen),
      //   "notify::screen"
      // )
      // .hook(
      //   brightness,
      //   () => show(brightness.kbd, icons.brightness.keyboard),
      //   "notify::kbd"
      // )
      .hook(
        audio.speaker,
        () =>
          show(
            audio.speaker.volume,
            FontIcon.getName(
              audio.speaker.stream?.isMuted ? "volume-slash" : "volume"
            )
          ),
        "notify::volume"
      )
  );
}
