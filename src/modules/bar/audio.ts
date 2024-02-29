import { FontIcon } from "@widgets";

const audio = await Service.import("audio");

function Microphone() {
  return Widget.EventBox({
    onPrimaryClick: () => {
      Utils.execAsync("volume --toggle-mic");
    },
    tooltip_markup: audio.microphone
      .bind("description")
      .as((description) => description || ""),
    child: Widget.Box({
      className: "microphone",
      spacing: 8,
      children: [
        FontIcon("volume").hook(audio.microphone, (self) => {
          self.icon = FontIcon.getName(
            audio.microphone.stream?.isMuted ? "microphone-slash" : "microphone"
          );
        }),
      ],
      setup: (self) => {
        self.hook(audio.microphone, () => {
          self.toggleClassName("muted", audio.microphone.stream?.isMuted);
        });
      },
    }),
  });
}

function Volume() {
  return Widget.EventBox({
    onPrimaryClick: () => {
      Utils.execAsync("volume --toggle");
    },
    tooltip_markup: audio.speaker
      .bind("description")
      .as((description) => description || ""),
    child: Widget.Box({
      className: "volume",
      spacing: 8,
      children: [
        FontIcon("volume").hook(audio.speaker, (self) => {
          self.icon = FontIcon.getName(
            audio.speaker.stream?.isMuted ? "volume-slash" : "volume"
          );
        }),
        Widget.Label({
          label: audio.speaker.bind("volume").as(
            (volume) =>
              `${Math.round(volume * 100)
                .toString()
                .padStart(3, " ")}%`
          ),
        }),
      ],
      setup: (self) => {
        self.hook(audio.speaker, () => {
          self.toggleClassName("muted", audio.speaker.stream?.isMuted);
        });
      },
    }),
  });
}

export const Audio = () =>
  Widget.Box({
    name: "audio",
    spacing: 12,
    children: [Microphone(), Volume()],
  });
