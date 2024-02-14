//import { Utils, Widget, Hyprland } from "../../ags.js";
import Widget from "resource:///com/github/Aylur/ags/widget.js";
import Hyprland from "resource:///com/github/Aylur/ags/service/hyprland.js";
import { execAsync } from "resource:///com/github/Aylur/ags/utils.js";
import { icons } from "~/icons";

const WORKSPACE_LIST = <const>[1, 2, 3, 4, 5];

const dispatch = (arg: number) => () =>
  execAsync(`hyprctl dispatch workspace ${arg}`);

const Workspace = (workspaceId: number) =>
  Widget.Button({
    class_name: "workspace",
    on_clicked: dispatch(workspaceId),
    child: Widget.Label({
      label: icons[`circle${workspaceId}`],
      class_name: "indicator icon",
      vpack: "center",
    }),
    connections: [
      [
        Hyprland,
        (btn) => {
          btn.toggleClassName(
            "active",
            Hyprland.active.workspace.id === workspaceId
          );
          btn.toggleClassName(
            "occupied",
            Hyprland.getWorkspace(workspaceId)?.["windows"] > 0
          );
        },
      ],
    ],
  });

export const Workspaces = () =>
  Widget.Box({
    class_name: "workspaces",
    spacing: 12,
    children: WORKSPACE_LIST.map(Workspace),
  });
