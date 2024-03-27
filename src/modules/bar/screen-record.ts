import { Screenrecord as ScreenrecordService } from "@services";
import icons from "@icons";

function humanReadableTimer(timer: number) {
  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function Screenrecord() {
  const label = Widget.Label();

  return Widget.Button({
    name: "screen-record",
    onClicked: () => {
      ScreenrecordService.stop();
    },
    child: Widget.Box({
      spacing: 8,
      children: [
        Widget.Icon({
          icon: icons.video,
        }),
        label,
      ],
    }),
  }).hook(ScreenrecordService, (self) => {
    const { recording, timer, action } = ScreenrecordService.value;

    self.class_name = action || "";

    if (recording) {
      self.visible = true;
      if (timer === -1) {
        label.visible = false;
      } else {
        label.visible = true;
        label.label = humanReadableTimer(timer);
      }
    } else {
      self.visible = false;
      label.label = "";
    }
  });
}
