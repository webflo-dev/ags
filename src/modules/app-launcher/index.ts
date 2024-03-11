import { PopupWindow } from "@widgets";
import { Application } from "types/service/applications";

const { query } = await Service.import("applications");

const WINDOW_NAME = "app-launcher";

const AppItem = (app: Application) =>
  Widget.Button({
    onClicked: () => {
      App.closeWindow(WINDOW_NAME);
      app.launch();
    },
    attribute: { app },
    className: "app-item",
    child: Widget.Box({
      children: [
        Widget.Icon({
          className: "icon",
          icon: app.icon_name || "application-default-icon",
          // size: 42,
        }),
        Widget.Label({
          className: "title",
          label: app.name,
          xalign: 0,
          vpack: "center",
          truncate: "end",
        }),
      ],
    }),
  });

const _Applauncher = () => {
  let applications = query("").map(AppItem);

  const list = Widget.Box({
    vertical: true,
    children: applications,
  });

  function repopulate() {
    applications = query("").map(AppItem);
    list.children = applications;
  }

  const entry = Widget.Entry({
    hexpand: true,
    className: "entry",
    onAccept: () => {
      if (applications[0]) {
        App.toggleWindow(WINDOW_NAME);
        applications[0].attribute.app.launch();
      }
    },
    onChange: ({ text }) =>
      applications.forEach((item) => {
        item.visible = item.attribute.app.match(text ?? "");
      }),
  });

  return Widget.Box({
    vertical: true,
    className: "app-launcher",
    children: [
      entry,
      Widget.Scrollable({
        hscroll: "never",
        className: "list-container",
        child: list,
      }),
    ],
    setup: (self) =>
      self.hook(App, (_, windowName, visible) => {
        if (windowName !== WINDOW_NAME) return;

        if (visible) {
          repopulate();
          entry.text = "";
          entry.grab_focus();
        }
      }),
  });
};

export const AppLauncher = () => {
  return PopupWindow({
    name: WINDOW_NAME,
    layout: "center",
    child: _Applauncher(),
  });
};
