import { Config } from "types/app";
import App from "resource:///com/github/Aylur/ags/app.js";
import { ScreenrecordService, ScreenshotService } from "~/services";
import { Bar } from "~/modules/bar";
import { MicrophoneOSD, VolumeOSD } from "~/modules/osd";
import { AppLauncher } from "~/modules/app-launcher";
import { NotificationCenter } from "~/modules/notifications";
import { togglePowerMenu, PowerMenu } from "~/modules/power-menu";

// Use for CLI calls
globalThis.ags = { App };
globalThis.powermenu = { toggle: togglePowerMenu };
globalThis.screenshot = ScreenshotService;
globalThis.screenrecord = ScreenrecordService;

const config: Config = {
  style: App.configDir + "/style.css",
  maxStreamVolume: 1,
  cacheNotificationActions: true,
  notificationPopupTimeout: 3000,
  closeWindowDelay: {},
  windows: [
    Bar(),
    AppLauncher(),
    NotificationCenter(),
    PowerMenu(),
    VolumeOSD(),
    MicrophoneOSD(),
  ].flat(),
};

export default config;
