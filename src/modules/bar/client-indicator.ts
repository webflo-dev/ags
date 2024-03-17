import icons from "@icons";

const hyprland = await Service.import("hyprland");

function Indicator(icon: string, className: string) {
  return Widget.Icon({
    classNames: ["indicator", className],
    icon,
  });
}

export function ClientIndicator() {
  const fullscreen = Indicator(icons.ui.fullscreen, "fullscreen");
  const pinned = Indicator(icons.ui.pinned, "pinned");
  const floating = Indicator(icons.ui.floatingWindow, "floating");
  const xwayland = Indicator(icons.ui.wayland, "xwayland");

  return Widget.Box({
    name: "client-indicator",
    spacing: 8,
    children: [fullscreen, floating, pinned, xwayland],
  })
    .hook(hyprland.active.client, () => {
      const client = hyprland.clients.find((client) =>
        client.address.endsWith(hyprland.active.client.address)
      );
      if (!client) return;
      fullscreen.toggleClassName("active", client.fullscreen);
      floating.toggleClassName("active", client.floating);
      pinned.toggleClassName("active", client.pinned);
      xwayland.visible = client.xwayland;
    })
    .hook(
      hyprland,
      (_, name: string, data: string) => {
        // console.log(`IPC => ${name} => ${JSON.stringify(data, null, 2)}`);
        switch (name) {
          case "fullscreen":
            {
              const client = hyprland.clients.find((client) =>
                client.address.endsWith(hyprland.active.client.address)
              );
              if (!client) return;
              fullscreen.toggleClassName("active", data === "1");
            }
            break;
          case "changefloatingmode":
            {
              const [address, mode] = data.split(",");
              const client = hyprland.clients.find((client) =>
                client.address.endsWith(address)
              );
              if (!client) return;
              floating.toggleClassName("active", mode === "1");
            }
            break;
        }
      },
      "event"
    );
}
