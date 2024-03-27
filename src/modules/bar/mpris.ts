import GLib from "gi://GLib?version=2.0";
import { type MprisPlayer } from "types/service/mpris";
import icons from "@icons";

const mpris = await Service.import("mpris");

function icon(name: string | null, fallback = "image-missing-symbolic") {
  if (!name) return fallback || "";

  if (GLib.file_test(name, GLib.FileTest.EXISTS)) return name;

  if (Utils.lookUpIcon(name)) return name;

  return fallback;
}

function iconWithFallback(fallback = "image-missing-symbolic") {
  return (name: string | null) => icon(name, fallback);
}

function Player(player: MprisPlayer) {
  return Widget.Box({
    spacing: 8,
    className: "player",
    children: [
      Widget.Icon({
        class_name: "icon",
        tooltip_text: player.identity || "<no-identity>",
        icon: player.bind("name").as(iconWithFallback(icons.mpris.default)),
      }),
      Widget.Icon({
        className: "icon",
        size: 24,
        icon: Utils.merge(
          [player.bind("cover_path"), player.bind("track_cover_url")],
          (path, url) => path || url
        ),
      }),
      Widget.Button({
        onClicked: () => player.previous(),
        visible: player.bind("can_go_prev"),
        child: Widget.Icon(icons.mpris.previous),
      }),
      Widget.Button({
        child: Widget.Icon({
          className: "play-pause",
          icon: player.bind("play_back_status").as((s) => {
            switch (s) {
              case "Playing":
                return icons.mpris.pause;
              case "Paused":
              case "Stopped":
                return icons.mpris.play;
            }
          }),
        }),
        onClicked: () => player.playPause(),
        visible: player.bind("can_play"),
      }),
      Widget.Button({
        on_clicked: () => player.next(),
        visible: player.bind("can_go_next"),
        child: Widget.Icon(icons.mpris.next),
      }),
      Widget.Label({
        className: "artists",
        label: player.bind("track_artists").as((x) => x.join(", ")),
      }),
      Widget.Label({ className: "title", label: player.bind("track_title") }),
    ],
  });
}

export function Mpris() {
  const box = Widget.Box({
    name: "mpris",
    attribute: { busName: "" },
  });

  function attachPlayer(widget: typeof box, busName: string) {
    const player = mpris.getPlayer(busName);

    if (!player) {
      widget.visible = false;
      return;
    }

    widget.attribute.busName = player.bus_name;
    widget.child = Player(player);
  }

  return box
    .hook(
      mpris,
      (self, busName) => {
        if (busName === self.attribute.busName) {
          return;
        }
        attachPlayer(self, busName);
      },
      "player-changed"
    )
    .hook(
      mpris,
      (self, busName) => {
        if (busName !== self.attribute.busName) {
          return;
        }
        attachPlayer(self, "");
      },
      "player-closed"
    );
}
