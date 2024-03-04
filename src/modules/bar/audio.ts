import { FontIcon } from "@widgets";
import { Audio as AudioService } from "@services";
import { clsx } from "clsx";

function Microphone() {
  return Widget.EventBox({
    onPrimaryClick: () => {
      Utils.execAsync("volume --toggle-mic");
    },
    tooltip_markup: AudioService.microphones.defaultMicrophone.bind("name"),
    child: Widget.Box({
      className: AudioService.microphones.defaultMicrophone
        .bind("muted")
        .as((muted) => `microphone ${clsx({ muted })}`),
      spacing: 8,
      children: [
        FontIcon(
          AudioService.microphones.defaultMicrophone
            .bind("muted")
            .as((muted) => (muted ? "microphone-slash" : "microphone"))
        ),
      ],
    }),
  });
}

function Volume() {
  return Widget.EventBox({
    onPrimaryClick: () => {
      Utils.execAsync("volume --toggle");
    },
    tooltip_markup: AudioService.speakers.defaultSpeaker.bind("name"),
    child: Widget.Box({
      className: AudioService.speakers.defaultSpeaker
        .bind("muted")
        .as((muted) => `volume ${clsx({ muted })}`),
      spacing: 8,
      children: [
        FontIcon(
          AudioService.speakers.defaultSpeaker
            .bind("muted")
            .as((muted) => (muted ? "volume-slash" : "volume"))
        ),
        Widget.Label({
          label: AudioService.speakers.defaultSpeaker
            .bind("volume")
            .as((volume) => `${volume.toString().padStart(3, " ")}%`),
        }),
      ],
    }),
  });
}

export const Audio = () =>
  Widget.Box({
    name: "audio",
    spacing: 12,
    children: [Microphone(), Volume()],
  });
