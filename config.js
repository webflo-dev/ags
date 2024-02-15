// src/config.ts
import {readFile} from "resource:///com/github/Aylur/ags/utils.js";
import GLib2 from "gi://GLib";
var checkVersion = function() {
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
};
var config = {
  style: App.configDir + "/config.css",
  cacheCoverArt: true,
  cacheNotificationActions: false,
  closeWindowDelay: {},
  maxStreamVolume: 1,
  notificationForceTimeout: true,
  notificationPopupTimeout: 5000
};
var agsVersion = readFile(App.configDir + "/ags-version.txt");
var pkgVersion = pkg.version;
var skipCheck = GLib2.getenv("SKIP_CHECK") === "true";
print(`expected AGS version: [${agsVersion}]`);
print(`current AGS version: [${pkgVersion}]`);
print(`skip check: ${skipCheck}`);
var config_default = checkVersion();
export {
  config_default as default
};
