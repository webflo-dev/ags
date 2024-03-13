import { Audio as AudioService } from "@services";
import { clsx } from "clsx";
import icons from "@icons";

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
        Widget.Icon({
          icon: AudioService.microphones.defaultMicrophone
            .bind("muted")
            .as((muted) =>
              muted ? icons.microphone.muted : icons.microphone.unmuted
            ),
        }),
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
        Widget.Icon({
          icon: AudioService.speakers.defaultSpeaker
            .bind("muted")
            .as((muted) => (muted ? icons.volume.muted : icons.volume.unmuted)),
        }),
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
