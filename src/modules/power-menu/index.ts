import App from "resource:///com/github/Aylur/ags/app.js";

import {
  PowerMenuWindow,
  ConfirmWindow,
  WINDOW_NAME_CONFIRM,
  WINDOW_NAME_POWERMENU,
} from "./power-menu";

export function togglePowerMenu() {
  App.closeWindow(WINDOW_NAME_CONFIRM);
  App.toggleWindow(WINDOW_NAME_POWERMENU);
}

export const PowerMenu = () => [PowerMenuWindow(), ConfirmWindow()];
