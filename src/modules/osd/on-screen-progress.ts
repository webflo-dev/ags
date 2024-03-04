import { FontIcon } from "@widgets";
import { Progress } from "./progress";
import { Audio } from "@services";

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

  const progressBar = Widget.Box({
    vertical: true,
    className: "progress-bar",
    children: [progress, indicator],
  });

  const revealer = Widget.Revealer({
    transition: "slide_left",
    child: progressBar,
  });

  let count = 0;
  function show() {
    progressBar.toggleClassName("muted", Audio.speakers.defaultSpeaker.muted);

    indicator.icon = FontIcon.getName(
      Audio.speakers.defaultSpeaker.muted ? "volume-slash" : "volume"
    );

    progress.setValue(Audio.speakers.defaultSpeaker.volume);

    revealer.reveal_child = true;
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
      // .hook(
      //   Audio.speakers.defaultSpeaker,
      //   () =>
      //     show(
      //       Audio.speakers.defaultSpeaker.volume,
      //       FontIcon.getName(
      //         Audio.speakers.defaultSpeaker.muted ? "volume-slash" : "volume"
      //       )
      //     ),
      //   "notify::volume"
      // )
      .hook(Audio.speakers.defaultSpeaker, show, "notify::volume")
      .hook(Audio.speakers.defaultSpeaker, show, "notify::muted")
  );
}
