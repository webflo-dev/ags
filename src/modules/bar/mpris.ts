import Widget from "resource:///com/github/Aylur/ags/widget.js";
import Mpris from "resource:///com/github/Aylur/ags/service/mpris.js";
import { icons } from "~/icons";
import { getIconName } from "~/utils";

const PROPERTY_PLAYER_NAME = "_playerName";
const PROPERTY_BUS_NAME = "_busName";

const CurrentPlayer = (player) => {
  const childIcon = Widget.Icon({ class_name: "icon", size: 24 });
  const childThumbnail = Widget.Icon({ class_name: "thumbnail", size: 24 });
  const childArtist = Widget.Label({ class_name: "artist" });
  const childTitle = Widget.Label({ class_name: "title" });

  return Widget.Box({
    spacing: 8,
    class_name: "active-player",
    children: [childIcon, childThumbnail, childArtist, childTitle],
    connections: [
      [
        player,
        (box) => {
          if (box[PROPERTY_PLAYER_NAME] !== player.name) {
            const iconName = getIconName(player.name);
            childIcon.icon = iconName ?? icons.mpris.fallback;
          }
          box[PROPERTY_PLAYER_NAME] = player.name;

          if (childThumbnail.icon !== player.coverPath && !!player.coverPath) {
            childThumbnail.icon = player.coverPath;
          }
          childThumbnail.visible = !!player.coverPath;

          childArtist.label = player.trackArtists.join(", ");
          childTitle.label = player.trackTitle;
        },
      ],
    ],
  });
};

const MprisModule = () =>
  Widget.Box({
    class_name: "mpris",
    connections: [
      [
        Mpris,
        (box, busName) => {
          const player = Mpris.getPlayer(busName as string);
          box.visible = !!player;
          if (!player) {
            box[PROPERTY_BUS_NAME] = null;
            return;
          }

          if (box[PROPERTY_BUS_NAME] === busName) return;

          box[PROPERTY_BUS_NAME] = busName;
          box.children = [CurrentPlayer(player)];
        },
        "player-changed",
      ],
    ],
  });

export { MprisModule as Mpris };
