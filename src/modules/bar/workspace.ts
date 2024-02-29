import { FontIcon } from "@widgets";
import { clsx } from "clsx";

const hyprland = await Service.import("hyprland");

const WorkspaceList = <const>[1, 2, 3, 4, 5];

export function Workspaces() {
  const activeId = hyprland.active.workspace.bind("id");
  return Widget.Box({
    name: "workspaces",
    spacing: 8,
    children: WorkspaceList.map((id) =>
      Widget.Button({
        className: activeId.as((i) =>
          clsx("workspace", {
            active: i === id,
            occupied: (hyprland.getWorkspace(id)?.windows || 0) > 0,
          })
        ),
        child: FontIcon(`circle-${id}`),
        onClicked: () => hyprland.messageAsync(`dispatch workspace ${id}`),
      })
    ),
  });
}
