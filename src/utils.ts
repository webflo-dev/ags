import Applications from "resource:///com/github/Aylur/ags/service/applications.js";

export function getIconName(name: string): string | undefined | null {
  const searchableName = name.toLowerCase();
  const app = Applications.list.find((app) => {
    if (!app.name) return false;
    const appName = app.name.toLowerCase();
    if (appName === searchableName) return true;
    return appName.includes(searchableName);
  });
  return app?.icon_name;
}

