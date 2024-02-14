import Widget from "resource:///com/github/Aylur/ags/widget.js";
import Audio from "resource:///com/github/Aylur/ags/service/audio.js";
import { icons } from "~/icons";

const Volume = () => {
  const childIcon = Widget.Label({
    label: icons.volume.normal,
    class_name: "icon",
  });

  const childLabel = Widget.Label({
    label: "---",
    class_name: "text monospace",
  });

  return Widget.Box({
    class_name: "volume",
    spacing: 8,
    children: [childIcon, childLabel],
    connections: [
      [
        Audio,
        (self) => {
          if (!Audio.speaker) return;

          const muted = Audio.speaker.stream.is_muted;
          const volume = Math.round(Audio.speaker.volume * 100);

          childLabel.label = `${volume.toString().padStart(3, " ")}%`;

          if (muted === true) {
            self.toggleClassName("muted", true);
            childIcon.label = icons.volume.muted;
          } else {
            self.toggleClassName("muted", false);
            childIcon.label = icons.volume.normal;
          }
        },
        "speaker-changed",
      ],
    ],
  });
};

const Microphone = () =>
  Widget.Box({
    class_name: "microphone",
    children: [
      Widget.Label({
        label: icons.microphone.normal,
        class_name: "icon",
        connections: [
          [
            Audio,
            (self) => {
              const muted = Audio.microphone?.stream.is_muted;
              if (muted === true) {
                self.label = icons.microphone.muted;
                self.toggleClassName("muted", true);
              } else {
                self.label = icons.microphone.normal;
                self.toggleClassName("muted", false);
              }
            },
            "microphone-changed",
          ],
        ],
      }),
    ],
  });

const AudioModule = () => {
  return Widget.Box({
    class_name: "audio",
    spacing: 12,
    children: [Microphone(), Volume()],
  });
};

export { AudioModule as Audio };
