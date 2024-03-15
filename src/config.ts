import { readFile } from "resource:///com/github/Aylur/ags/utils.js";
import GLib from "gi://GLib?version=2.0";

import { TopBar } from "@modules/bar";
import { AppLauncher } from "@modules/app-launcher";
import { PowerMenu, togglePowerMenu } from "@modules/power-menu";
import { VolumeOSD } from "@modules/osd";
import { NotificationCenter } from "@modules/notification-center";
import { Screenshot as ScreenshotService } from "@services";

async function start() {
  // const notifications = await Service.import("notifications");
  // notifications.forceTimeout = true;
  // notifications.popupTimeout = 5000;
  // notifications.cacheActions = false;

  // const audio = await Service.import("audio");
  // audio.maxStreamVolume = 1;

  // const mpris = await Service.import("mpris");
  // mpris.cacheCoverArt = true;

  App.addIcons(App.configDir + "/icons");
  App.applyCss(App.configDir + "/config.css");

  App.config({
    windows: [
      TopBar(),
      AppLauncher(),
      PowerMenu(),
      VolumeOSD(),
      NotificationCenter(),
    ],
  });
  // Use for CLI calls
  globalThis.ags = { App };
  globalThis.powermenu = { toggle: togglePowerMenu };
  globalThis.screenshot = ScreenshotService;
  // globalThis.screenrecord = ScreenrecordService;
}

const agsVersion = readFile(App.configDir + "/ags-version.txt");
const pkgVersion = pkg.version;
const skipCheck = GLib.getenv("SKIP_CHECK") === "true";

print(`expected AGS version: [${agsVersion}]`);
print(`current AGS version: [${pkgVersion}]`);
print(`skip check: ${skipCheck}`);

function checkVersion() {
  print("checking version...");
  if (pkgVersion !== agsVersion && !skipCheck) {
    print("Error: AGS version mismatch!");
    print(`To skip the check run "SKIP_CHECK=true ags"`);
    App.connect("config-parsed", (app) => app.Quit());
    return {};
  } else {
    print("version OK");
    start();
  }
}

await checkVersion();
