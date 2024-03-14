const mpris = await Service.import("mpris");

export function Mpris() {
  return Widget.Button({
    class_name: "media",
    on_primary_click: () => mpris.getPlayer("")?.playPause(),
    on_scroll_up: () => mpris.getPlayer("")?.next(),
    on_scroll_down: () => mpris.getPlayer("")?.previous(),
    child: Widget.Label("-").hook(
      mpris,
      (self) => {
        if (mpris.players[0]) {
          const { track_artists, track_title } = mpris.players[0];
          self.label = `${track_artists.join(", ")} - ${track_title}`;
        } else {
          self.label = "Nothing is playing";
        }
      },
      "player-changed"
    ),
  });
}
