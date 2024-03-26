import icons from "@icons";

const hyprland = await Service.import("hyprland");

function Indicator(icon: string, className: string) {
  return Widget.Icon({
    classNames: ["indicator", className],
    icon,
  });
}

export function ClientState() {
  const fullscreen = Indicator(icons.ui.fullscreen, "fullscreen");
  const pinned = Indicator(icons.ui.pinned, "pinned");
  const floating = Indicator(icons.ui.floatingWindow, "floating");

  return Widget.Box({
    name: "client-state",
    spacing: 8,
    children: [fullscreen, floating, pinned],
  })
    .hook(hyprland.active.client, (self) => {
      const client = hyprland.getClient(hyprland.active.client.address);
      if (!client) return;

      self.toggleClassName("xwayland", client.xwayland);

      fullscreen.toggleClassName("active", client.fullscreen);
      floating.toggleClassName("active", client.floating);
      pinned.toggleClassName("active", client.pinned);
    })
    .hook(
      hyprland,
      (self, name: string, data: string) => {
        switch (name) {
          case "fullscreen":
            {
              const client = hyprland.getClient(hyprland.active.client.address);
              if (!client) return;
              fullscreen.toggleClassName("active", data === "1");
            }
            break;
          case "changefloatingmode":
            {
              const [address, mode] = data.split(",");
              const client = hyprland.getClient(`0x${address}`);
              if (!client) return;
              floating.toggleClassName("active", mode === "1");
            }
            break;
        }
      },
      "event"
    );
}
