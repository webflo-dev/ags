import { Config } from "~/types/app";

const config: Config = {
style: App.configDir + "/config.css",

cacheCoverArt: true,
cacheNotificationActions: false,
closeWindowDelay: {},
maxStreamVolume: 1,
notificationForceTimeout: true,
notificationPopupTimeout: 5000,
}

export default config;
