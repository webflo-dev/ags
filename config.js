// src/config.ts
var config = {
  style: App.configDir + "/config.css",
  cacheCoverArt: true,
  cacheNotificationActions: false,
  closeWindowDelay: {},
  maxStreamVolume: 1,
  notificationForceTimeout: true,
  notificationPopupTimeout: 5000
};
var config_default = config;
export {
  config_default as default
};
