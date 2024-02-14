import Widget from "resource:///com/github/Aylur/ags/widget.js";
import App from "resource:///com/github/Aylur/ags/app.js";
import Applications from "resource:///com/github/Aylur/ags/service/applications.js";
import { PopupWindow } from "~/widgets";
import { icons } from "~/icons";

const AppItem = (app) => {
  const NoDescription = () =>
    Widget.Label({
      class_name: "title",
      label: app.name,
      xalign: 0,
      vpack: "center",
      ellipsize: 3,
    });

  const WithDescription = () =>
    Widget.Box({
      vertical: true,
      vpack: "center",
      children: [
        Widget.Label({
          class_name: "title",
          label: app.name,
          xalign: 0,
          vpack: "center",
          ellipsize: 3,
        }),
        Widget.Label({
          class_name: "description",
          label: app.description,
          wrap: true,
          xalign: 0,
          justification: "left",
          vpack: "center",
        }),
      ],
    });

  return Widget.Button({
    class_name: "app",
    on_clicked: () => {
      launchApp(app);
    },
    child: Widget.Box({
      children: [
        Widget.Icon({
          icon: app.iconName || "application-default-icon",
          size: 48,
        }),
        !app.description ? NoDescription() : WithDescription(),
      ],
    }),
  });
};

const Search = ({ onUpdate }) =>
  Widget.Entry({
    hexpand: true,
    text: "---",
    placeholder_text: "Search",
    on_accept: ({ text }) => {
      const list = Applications.query(text ?? "");
      if (list.length > 0) {
        launchApp(list[0]);
      }
    },
    on_change: ({ text }) => {
      const filteredApps = Applications.query(text ?? "").map(AppItem);
      onUpdate(filteredApps);
    },
  });

const List = () =>
  Widget.Box({
    vertical: true,
  });

const Applauncher = () => {
  const list = List();

  const searchInput = Search({
    onUpdate: (apps) => {
      list.children = apps;
      list.show_all();
    },
  });

  return Widget.Box({
    class_name: "app-launcher",
    properties: [["list", list]],
    vertical: true,
    children: [
      Widget.Box({
        class_name: "search",
        children: [
          Widget.Label({ class_name: "icon", label: icons.search }),
          searchInput,
        ],
      }),
      Widget.Scrollable({
        hscroll: "never",
        child: Widget.Box({
          vertical: true,
          children: [list],
        }),
      }),
    ],

    connections: [
      [
        App,
        (_, name, visible) => {
          if (name !== WINDOW_NAME) return;

          searchInput.set_text("");
          if (visible) searchInput.grab_focus();
        },
      ],
    ],
  });
};

const WINDOW_NAME = "app-launcher";

function launchApp(app) {
  App.closeWindow(WINDOW_NAME);
  app.launch();
  // app.frequency += 1;
}

export const AppLauncher = () =>
  PopupWindow({
    name: WINDOW_NAME,
    child: Applauncher(),
  });
