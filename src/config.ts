import { readFile } from "resource:///com/github/Aylur/ags/utils.js";
import { Config } from "~/types/app";
import GLib from "gi://GLib";

const config: Config = {
  style: App.configDir + "/config.css",

  cacheCoverArt: true,
  cacheNotificationActions: false,
  closeWindowDelay: {},
  maxStreamVolume: 1,
  notificationForceTimeout: true,
  notificationPopupTimeout: 5000,
};

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
    return config;
  }
}

export default checkVersion();
