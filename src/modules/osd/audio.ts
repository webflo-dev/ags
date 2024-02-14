import Audio from "resource:///com/github/Aylur/ags/service/audio.js";
import { OSD, Progressbar, type ProgressbarProps } from "~/widgets";
import { icons } from "~/icons";

type CustomOSDProps = Pick<ProgressbarProps, "anchor">;

export const VolumeOSD = ({ anchor }: CustomOSDProps = { anchor: "right" }) =>
  OSD({
    name: "osd-volume",
    anchor: anchor === "center" ? [] : [anchor],
    connection: [Audio, "speaker-changed"],
    child: Progressbar({
      anchor,
      connection: [
        Audio,
        "speaker-changed",
        () => {
          if (!Audio.speaker) return;

          const volume = Audio.speaker.volume;
          const isMuted = Audio.speaker.stream.is_muted;

          return {
            value: volume,
            icon: isMuted ? icons.volume.muted : icons.volume.normal,
            classNames: [["muted", isMuted]],
          };
        },
      ],
    }),
  });

export const MicrophoneOSD = (
  { anchor }: CustomOSDProps = { anchor: "right" }
) =>
  OSD({
    name: "osd-microphone",
    anchor: anchor === "center" ? [] : [anchor],
    connection: [Audio, "microphone-changed"],
    child: Progressbar({
      anchor,
      connection: [
        Audio,
        "microphone-changed",
        () => {
          if (!Audio.microphone) return;

          const volume = Audio.microphone.volume;
          const isMuted = Audio.microphone.stream.is_muted;

          return {
            value: volume,
            icon: isMuted ? icons.microphone.muted : icons.microphone.normal,
            classNames: [["muted", isMuted]],
          };
        },
      ],
    }),
  });
