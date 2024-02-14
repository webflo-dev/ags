// src/config.ts
import App10 from "resource:///com/github/Aylur/ags/app.js";

// src/services/screenshot.ts
import App from "resource:///com/github/Aylur/ags/app.js";
import Service from "resource:///com/github/Aylur/ags/service.js";
import {execAsync} from "resource:///com/github/Aylur/ags/utils.js";
import GLib2 from "gi://GLib";
var timeStamp = function() {
  return GLib2.DateTime.new_now_local().format("%Y-%m-%d__%H-%M-%S");
};
async function notify(file) {
  const res = await execAsync([
    "notify-send",
    "-A",
    "copy-image=Copy image",
    "-A",
    "copy-file=Copy path",
    "-A",
    "view=View",
    "-A",
    "edit=Edit",
    "-A",
    "delete=Delete",
    "-i",
    file,
    "Screenshot",
    file
  ]);
  switch (res) {
    case "copy-image":
      execAsync(`wl-copy --type image/png < ${file}`);
      break;
    case "copy-file":
      execAsync(`wl-copy --type text/plain  ${file}`);
      break;
    case "view":
      execAsync(`imv ${file}`);
      break;
    case "edit":
      execAsync(`swappy -f ${file}`);
      break;
    case "delete":
      execAsync(`rm ${file}`);
      break;
  }
}
var takeScreenshot = function(geometry, file) {
  return execAsync(["grim", "-g", `${geometry}`, file]);
};

class ScreenshotService extends Service {
  constructor() {
    super(...arguments);
  }
  static {
    Service.register(this, {}, {
      busy: ["boolean", "r"]
    });
  }
  busy = false;
  _state(value) {
    this.busy = value;
    this.notify("busy");
  }
  screenshot() {
    if (this.busy === true)
      return;
    this._state(true);
    execAsync(`${App.configDir}/scripts/geometry.sh`).then((geometry) => {
      if (!geometry) {
        this._state(false);
        return;
      }
      const file = `${GLib2.get_home_dir()}/Pictures/Screenshots/screenshot__${timeStamp()}.png`;
      takeScreenshot(geometry, file).then(() => {
        this._state(false);
        notify(file);
      }).catch((err) => {
        this._state(false);
        console.error("screenshot : ", err);
      });
    });
  }
}
var screenshot_default = new ScreenshotService;
// src/services/screenrecord.ts
import App2 from "resource:///com/github/Aylur/ags/app.js";
import {execAsync as execAsync2, interval} from "resource:///com/github/Aylur/ags/utils.js";
import Service2 from "resource:///com/github/Aylur/ags/service.js";
import GLib4 from "gi://GLib";
var timeStamp2 = function() {
  return GLib4.DateTime.new_now_local().format("%Y-%m-%d__%H-%M-%S");
};
async function notify2(file) {
  const result = await execAsync2([
    "notify-send",
    "-A",
    "copy-file=Copy path",
    "-A",
    "view=View",
    "-A",
    "delete=Delete",
    "-i",
    "record-desktop-indicator",
    "Screenrecord",
    file
  ]);
  switch (result) {
    case "copy-file":
      execAsync2(`wl-copy --type text/plain  ${file}`);
      break;
    case "view":
      execAsync2(`mpv ${file}`);
      break;
    case "delete":
      execAsync2(`rm ${file}`);
      break;
  }
}
var startRecording = function(geometry, file) {
  return execAsync2(["wf-recorder", "-g", `${geometry}`, "-f", file]);
};
var stopRecording = function() {
  return execAsync2("killall -INT wf-recorder");
};

class ScreenrecordService extends Service2 {
  constructor() {
    super(...arguments);
  }
  static {
    Service2.register(this, {}, {
      timer: ["int", "r"],
      state: ["string", "r"]
    });
  }
  state = "idle";
  timer = 0;
  _file = "";
  _interval = 0;
  _state(value) {
    this.state = value;
    this.notify("state");
  }
  start() {
    if (this.state !== "idle")
      return;
    this._state("selecting_area");
    execAsync2(`${App2.configDir}/scripts/geometry.sh`).then((geometry) => {
      if (!geometry) {
        this._state("idle");
        return;
      }
      this._file = `${GLib4.get_home_dir()}/Videos/Recordings/screenrecord__${timeStamp2()}.mp4`;
      this._state("recording");
      startRecording(geometry, this._file).catch((err) => {
        console.error(err);
        this._state("idle");
      });
      this.timer = 0;
      this._interval = interval(1000, () => {
        this.notify("timer");
        this.timer++;
      });
    });
  }
  stop() {
    if (this.state === "idle")
      return;
    stopRecording().then(() => {
      this._state("idle");
      GLib4.source_remove(this._interval);
      notify2(this._file);
    }).catch((err) => {
      this._state("idle");
      console.error(err);
    });
  }
  toggle() {
    switch (this.state) {
      case "idle":
        this.start();
        break;
      case "recording":
        this.stop();
        break;
      default:
        this._state("idle");
        break;
    }
  }
}
var screenrecord_default = new ScreenrecordService;
// src/services/system-info.ts
import Service3 from "resource:///com/github/Aylur/ags/service.js";
import Variable from "resource:///com/github/Aylur/ags/variable.js";
import App3 from "resource:///com/github/Aylur/ags/app.js";
var readOutputScript = function(input) {
  const firstSeparator = input.indexOf(" ");
  const signalName = input.substring(0, firstSeparator);
  const values = input.substring(firstSeparator + 1);
  const pairs = values.match(regex);
  const info = {};
  if (pairs) {
    pairs.forEach((pair) => {
      const [key, value] = pair.split("=");
      info[key] = value.replace(/"/g, "");
    });
  }
  return [signalName, info];
};
var regex = new RegExp(/(\w+=("[^"]*"|[^ ]*))/g);
var propertyMapping = {
  CPU: "cpu",
  MEMORY: "memory",
  GPU: "gpu"
};
var properties = Object.values(propertyMapping);
var serviceProperties = properties.reduce((accu, prop) => {
  accu[prop] = ["jsobject"];
  return accu;
}, {});

class SystemInfoService extends Service3 {
  static {
    Service3.register(this, {}, serviceProperties);
  }
  _info = {
    cpu: {
      usage: "0"
    },
    memory: {
      total: "0",
      free: "0",
      used: "0"
    },
    gpu: {
      usage: "0"
    }
  };
  _var;
  constructor() {
    super();
    this._var = Variable(["", {}], {
      listen: [App3.configDir + "/scripts/system.sh", readOutputScript]
    });
    this._var.connect("changed", ({ value }) => {
      const [signalName, info] = value;
      const propName = propertyMapping[signalName];
      this._info[propName] = info;
      this.notify(propName);
    });
  }
  get cpu() {
    return this._info.cpu;
  }
  get memory() {
    return this._info.memory;
  }
  get gpu() {
    return this._info.gpu;
  }
  dispose() {
    this._var.dispose();
  }
}
var system_info_default = new SystemInfoService;
// src/modules/bar/index.ts
import Widget14 from "resource:///com/github/Aylur/ags/widget.js";

// src/modules/bar/date-time.ts
import Widget5 from "resource:///com/github/Aylur/ags/widget.js";

// src/icons.ts
var icons = {
  apps: "\uE196",
  calendar: "\uE350",
  clock: "\uF783",
  circle: "\uF111",
  circle1: "\uE0EE",
  circle2: "\uE0EF",
  circle3: "\uE0F0",
  circle4: "\uE0F1",
  circle5: "\uE0F2",
  cpu: "\uF2DB",
  memory: "\uF538",
  gpu: "\uE5A2",
  microphone: {
    normal: "\uF130",
    muted: "\uF131"
  },
  volume: {
    muted: "\uF6A9",
    normal: "\uF6A8"
  },
  mpris: {
    default: "\uF001",
    fallback: "audio-x-generic-symbolic",
    backward: "\uF048",
    play: "\uF04B",
    pause: "\uF04C",
    stop: "\uF04D",
    forward: "\uF051"
  },
  trash: "\uF2ED",
  notifications: {
    indicator: "\uF0F3",
    dnd: "\uF1F6"
  },
  video: "\uF03D",
  camera: "\uF030",
  stop: "\uF04D",
  search: "\uF002",
  powerMenu: {
    shutdown: "\uF011",
    reboot: "\uF021",
    logout: "\uF08B"
  }
};

// src/modules/bar/date-time.ts
import GLib6 from "gi://GLib";

// src/widgets/centered-box.ts
import Widget from "resource:///com/github/Aylur/ags/widget.js";
var CenteredBox = (props) => Widget.Box({
  vertical: true,
  vpack: "center",
  hpack: "center",
  vexpand: true,
  hexpand: true,
  ...props
});
// src/widgets/osd.ts
import Widget2 from "resource:///com/github/Aylur/ags/widget.js";
import * as Utils from "resource:///com/github/Aylur/ags/utils.js";
var OSD_DELAY_MS = 2000;
var OSD = ({ name, anchor = [], connection, child }) => {
  let _count = 0;
  return Widget2.Window({
    name,
    class_name: "osd",
    layer: "overlay",
    anchor,
    child,
    connections: [
      [
        connection[0],
        (self, ...args) => {
          const updateCallback = connection[2];
          const isVisible = updateCallback ? updateCallback(self, ...args) : true;
          if (isVisible) {
            self.visible = true;
            _count++;
            Utils.timeout(OSD_DELAY_MS, () => {
              _count--;
              if (_count === 0) {
                self.visible = false;
              }
            });
          }
        },
        connection[1]
      ]
    ]
  });
};
// src/widgets/window.ts
import Widget3 from "resource:///com/github/Aylur/ags/widget.js";
import App4 from "resource:///com/github/Aylur/ags/app.js";
var PopupWindow = ({
  name,
  popup = true,
  focusable = true,
  anchor = [],
  child
}) => {
  const _window = Widget3.Window({
    name,
    popup,
    focusable,
    anchor,
    visible: false,
    child
  });
  _window.connect("button-release-event", (emitter) => {
    const [x, y] = emitter.get_pointer();
    if (x === 0 && y === 0) {
      App4.closeWindow(name);
    }
  });
  return _window;
};
var BlockingWindow = ({
  name,
  popup = false,
  childProps
}) => Widget3.Window({
  name,
  visible: false,
  popup,
  focusable: true,
  anchor: ["top", "left", "bottom", "right"],
  child: CenteredBox(childProps)
});
// src/widgets/progress-bar.ts
import Widget4 from "resource:///com/github/Aylur/ags/widget.js";
var PROGRESS_OSD_DEFAULTS = {
  width: 50,
  height: 250
};
var Progressbar = ({ anchor, connection }) => {
  const isAnchorRight = anchor === "right";
  const width = isAnchorRight ? PROGRESS_OSD_DEFAULTS.width : PROGRESS_OSD_DEFAULTS.height;
  const height = isAnchorRight ? PROGRESS_OSD_DEFAULTS.height : PROGRESS_OSD_DEFAULTS.width;
  const progressIcon = Widget4.Label({
    class_name: "icon",
    hpack: isAnchorRight ? "center" : "start",
    vpack: isAnchorRight ? "end" : "center"
  });
  const progressBar = Widget4.Box({
    class_name: "progress-bar",
    hexpand: isAnchorRight,
    vexpand: !isAnchorRight,
    hpack: isAnchorRight ? "fill" : "start",
    vpack: isAnchorRight ? "end" : "fill"
  });
  return Widget4.Box({
    vertical: isAnchorRight,
    class_name: `progress ${isAnchorRight ? "vertical" : "horizontal"}`,
    child: Widget4.Overlay({
      child: progressBar,
      overlays: [progressIcon]
    }),
    css: `min-width: ${width}px; min-height: ${height}px;`,
    connections: [
      [
        connection[0],
        (box, ...args) => {
          const updateCallback = connection[2];
          if (!updateCallback)
            return;
          const updateValues = updateCallback(...args);
          if (!updateValues)
            return;
          const progressBarValue = (isAnchorRight ? height : width) * updateValues.value;
          progressBar.setCss(`min-${isAnchorRight ? "height" : "width"}: ${progressBarValue}px`);
          progressIcon.label = updateValues.icon;
          updateValues.classNames?.forEach(([className, condition]) => {
            box.toggleClassName(className, condition);
          });
        },
        connection[1]
      ]
    ]
  });
};
// src/widgets/font-icon.ts
import Gtk2 from "gi://Gtk";
import AgsLabel from "resource:///com/github/Aylur/ags/widgets/label.js";
import GObject2 from "gi://GObject";

class FontIconClass extends AgsLabel {
  static {
    GObject2.registerClass(this);
  }
  constructor({ icon, ...labelProps }) {
    super(labelProps);
    this.toggleClassName("font-icon");
    if (icon) {
      this.icon = icon;
    }
  }
  get icon() {
    return this.label;
  }
  set icon(icon) {
    this.label = icon;
  }
  get size() {
    return this.get_style_context().get_property("font-size", Gtk2.StateFlags.NORMAL);
  }
  vfunc_get_preferred_height() {
    return [this.size, this.size];
  }
  vfunc_get_preferred_width() {
    return [this.size, this.size];
  }
}
var FontIcon = (params) => new FontIconClass(params);
// src/modules/bar/date-time.ts
var Base = ({ name, icon, ...labelProps }) => {
  const label2 = Widget5.Label({
    vpack: "baseline",
    ...labelProps
  });
  const children = icon ? [
    FontIcon({ icon }),
    label2
  ] : [label2];
  return Widget5.Box({
    name,
    class_name: "module",
    spacing: 8,
    vpack: "baseline",
    children
  });
};
var Date = () => Base({
  name: "module-date",
  class_name: "date",
  icon: icons.calendar,
  connections: [
    [
      1000,
      (label2) => label2.label = GLib6.DateTime.new_now_local().format("%H:%M") || ""
    ]
  ]
});
var Time = () => Base({
  name: "module-time",
  class_name: "time",
  icon: icons.clock,
  label: GLib6.DateTime.new_now_local().format("%A %d %B")
});

// src/modules/bar/workspaces.ts
import Widget6 from "resource:///com/github/Aylur/ags/widget.js";
import Hyprland from "resource:///com/github/Aylur/ags/service/hyprland.js";
import {execAsync as execAsync3} from "resource:///com/github/Aylur/ags/utils.js";
var WORKSPACE_LIST = [1, 2, 3, 4, 5];
var dispatch = (arg) => () => execAsync3(`hyprctl dispatch workspace ${arg}`);
var Workspace = (workspaceId) => Widget6.Button({
  class_name: "workspace",
  on_clicked: dispatch(workspaceId),
  child: Widget6.Label({
    label: icons[`circle${workspaceId}`],
    class_name: "indicator icon",
    vpack: "center"
  }),
  connections: [
    [
      Hyprland,
      (btn) => {
        btn.toggleClassName("active", Hyprland.active.workspace.id === workspaceId);
        btn.toggleClassName("occupied", Hyprland.getWorkspace(workspaceId)?.["windows"] > 0);
      }
    ]
  ]
});
var Workspaces = () => Widget6.Box({
  class_name: "workspaces",
  spacing: 12,
  children: WORKSPACE_LIST.map(Workspace)
});

// src/modules/bar/systray.ts
import Widget7 from "resource:///com/github/Aylur/ags/widget.js";
import SystemTray from "resource:///com/github/Aylur/ags/service/systemtray.js";
var SysTrayItem = (item) => Widget7.Button({
  child: Widget7.Icon({
    binds: [["icon", item, "icon"]]
  }),
  binds: [["tooltip-markup", item, "tooltip-markup"]],
  on_primary_click: (_, event) => item.activate(event),
  on_secondary_click: (_, event) => item.openMenu(event)
});
var SysTray = () => Widget7.Box({
  class_name: "systray",
  binds: [
    ["children", SystemTray, "items", (i) => i.map(SysTrayItem)]
  ]
});

// src/modules/bar/audio.ts
import Widget8 from "resource:///com/github/Aylur/ags/widget.js";
import Audio from "resource:///com/github/Aylur/ags/service/audio.js";
var Volume = () => {
  const childIcon = Widget8.Label({
    label: icons.volume.normal,
    class_name: "icon"
  });
  const childLabel = Widget8.Label({
    label: "---",
    class_name: "text monospace"
  });
  return Widget8.Box({
    class_name: "volume",
    spacing: 8,
    children: [childIcon, childLabel],
    connections: [
      [
        Audio,
        (self) => {
          if (!Audio.speaker)
            return;
          const muted = Audio.speaker.stream.is_muted;
          const volume = Math.round(Audio.speaker.volume * 100);
          childLabel.label = `${volume.toString().padStart(3, " ")}%`;
          if (muted === true) {
            self.toggleClassName("muted", true);
            childIcon.label = icons.volume.muted;
          } else {
            self.toggleClassName("muted", false);
            childIcon.label = icons.volume.normal;
          }
        },
        "speaker-changed"
      ]
    ]
  });
};
var Microphone = () => Widget8.Box({
  class_name: "microphone",
  children: [
    Widget8.Label({
      label: icons.microphone.normal,
      class_name: "icon",
      connections: [
        [
          Audio,
          (self) => {
            const muted = Audio.microphone?.stream.is_muted;
            if (muted === true) {
              self.label = icons.microphone.muted;
              self.toggleClassName("muted", true);
            } else {
              self.label = icons.microphone.normal;
              self.toggleClassName("muted", false);
            }
          },
          "microphone-changed"
        ]
      ]
    })
  ]
});
var AudioModule = () => {
  return Widget8.Box({
    class_name: "audio",
    spacing: 12,
    children: [Microphone(), Volume()]
  });
};

// src/modules/bar/system-info.ts
import Widget9 from "resource:///com/github/Aylur/ags/widget.js";
var getLevel = function(value) {
  if (value >= 70 && value < 90)
    return "warning";
  if (value >= 90)
    return "critical";
  return "normal";
};
var System = (signalName, icon, transform) => {
  const childLabel = Widget9.Label({
    label: "---",
    class_name: "text monospace"
  });
  const childIcon = Widget9.Label({
    class_name: "icon",
    label: icon
  });
  return Widget9.Box({
    spacing: 8,
    children: icon ? [childIcon, childLabel] : [childLabel],
    connections: [
      [
        system_info_default,
        (self) => {
          const data = system_info_default[signalName];
          const value = transform(data);
          childLabel.label = `${value.padStart(2, " ")}%`;
          self.class_name = getLevel(Number.parseFloat(value));
        },
        `notify::${signalName}`
      ]
    ]
  });
};
var SystemInfo = () => Widget9.Box({
  class_name: "system-info",
  spacing: 24,
  children: [
    System("cpu", icons.cpu, ({ usage }) => usage),
    System("memory", icons.memory, ({ total, used }) => Math.floor(used / total * 100).toString()),
    System("gpu", icons.gpu, ({ usage }) => usage)
  ]
});

// src/modules/bar/screenshot.ts
import Widget10 from "resource:///com/github/Aylur/ags/widget.js";
var ScreenshotIndicator = () => Widget10.Box({
  name: "screenshot",
  spacing: 8,
  children: [
    Widget10.Label({
      class_name: "icon",
      label: icons.camera
    }),
    Widget10.Label({
      label: "taking screenshot..."
    })
  ],
  binds: [["visible", screenshot_default, "busy"]]
});

// src/modules/bar/screenrecord.ts
import Widget11 from "resource:///com/github/Aylur/ags/widget.js";
var getDuration = function(elapsed_time) {
  const hours = Math.floor(elapsed_time / 3600);
  const minutes = Math.floor((elapsed_time - hours * 3600) / 60);
  const seconds = Math.floor(elapsed_time - hours * 3600 - minutes * 60);
  return hours === 0 ? `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}` : `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};
var SelectingArea = () => Widget11.Box({
  name: "screenrecord",
  class_name: "selecting",
  spacing: 8,
  children: [
    Widget11.Label({
      class_name: "icon",
      label: icons.video
    }),
    Widget11.Label({
      label: "selecting area..."
    })
  ]
});
var Recording = () => Widget11.Button({
  name: "screenrecord",
  class_name: "recording",
  on_clicked: () => {
    screenrecord_default.stop();
  },
  child: Widget11.Box({
    spacing: 8,
    children: [
      Widget11.Label({
        class_name: "icon",
        label: icons.video
      }),
      Widget11.Label({
        binds: [["label", screenrecord_default, "timer", getDuration]]
      })
    ]
  })
});
var ScreenrecordIndicator = () => Widget11.Stack({
  items: [
    ["selecting_area", SelectingArea()],
    ["recording", Recording()]
  ],
  binds: [["shown", screenrecord_default, "state"]]
});

// src/modules/bar/notification.ts
import App5 from "resource:///com/github/Aylur/ags/app.js";
import Widget12 from "resource:///com/github/Aylur/ags/widget.js";
import Notifications from "resource:///com/github/Aylur/ags/service/notifications.js";
import * as Utils2 from "resource:///com/github/Aylur/ags/utils.js";
var Summary = () => Widget12.Label({
  class_name: "summary",
  connections: [
    [
      Notifications,
      (label2) => {
        label2.label = Notifications.notifications[0]?.summary ?? " ".repeat(label2.label.length);
      },
      "notify::popups"
    ]
  ]
});
var ListIcon = () => Widget12.Label({
  label: Notifications.dnd ? icons.notifications.dnd : icons.notifications.indicator
});
var AppIcon = ({ app_icon, app_entry }) => {
  if (Utils2.lookUpIcon(app_icon)) {
    return Widget12.Icon({ class_name: "app-icon", icon: app_icon });
  }
  if (app_entry && Utils2.lookUpIcon(app_entry)) {
    return Widget12.Icon({ class_name: "app-icon", icon: app_entry });
  }
};
var Indicator = () => Widget12.Box({
  connections: [
    [
      Notifications,
      (box) => {
        if (Notifications.popups.length > 0) {
          const lastPopup = Notifications.popups[0];
          const child = AppIcon(lastPopup) || ListIcon();
          box.children = [child];
        } else {
          box.children = [ListIcon()];
        }
      }
    ]
  ]
});
var NotificationIndicator = () => Widget12.Button({
  on_clicked: () => {
    App5.toggleWindow("notification-center");
  },
  name: "notification-indicator",
  child: Widget12.Box({
    children: [
      Indicator(),
      Widget12.Revealer({
        reveal_child: false,
        transition_duration: 250,
        transition: "slide_right",
        child: Summary(),
        binds: [
          ["revealChild", Notifications, "popups", (p) => p.length > 0]
        ]
      })
    ]
  }),
  connections: [
    [
      Notifications,
      (btn) => btn.toggleClassName("full", Notifications.notifications.length > 0),
      "notify::notifications"
    ]
  ]
});

// src/modules/bar/mpris.ts
import Widget13 from "resource:///com/github/Aylur/ags/widget.js";
import Mpris from "resource:///com/github/Aylur/ags/service/mpris.js";

// src/utils.ts
import Applications from "resource:///com/github/Aylur/ags/service/applications.js";
function getIconName(name) {
  const searchableName = name.toLowerCase();
  const app6 = Applications.list.find((app7) => {
    if (!app7.name)
      return false;
    const appName = app7.name.toLowerCase();
    if (appName === searchableName)
      return true;
    return appName.includes(searchableName);
  });
  return app6?.icon_name;
}

// src/modules/bar/mpris.ts
var PROPERTY_PLAYER_NAME = "_playerName";
var PROPERTY_BUS_NAME = "_busName";
var CurrentPlayer = (player) => {
  const childIcon = Widget13.Icon({ class_name: "icon", size: 24 });
  const childThumbnail = Widget13.Icon({ class_name: "thumbnail", size: 24 });
  const childArtist = Widget13.Label({ class_name: "artist" });
  const childTitle = Widget13.Label({ class_name: "title" });
  return Widget13.Box({
    spacing: 8,
    class_name: "active-player",
    children: [childIcon, childThumbnail, childArtist, childTitle],
    connections: [
      [
        player,
        (box) => {
          if (box[PROPERTY_PLAYER_NAME] !== player.name) {
            const iconName = getIconName(player.name);
            childIcon.icon = iconName ?? icons.mpris.fallback;
          }
          box[PROPERTY_PLAYER_NAME] = player.name;
          if (childThumbnail.icon !== player.coverPath && !!player.coverPath) {
            childThumbnail.icon = player.coverPath;
          }
          childThumbnail.visible = !!player.coverPath;
          childArtist.label = player.trackArtists.join(", ");
          childTitle.label = player.trackTitle;
        }
      ]
    ]
  });
};
var MprisModule = () => Widget13.Box({
  class_name: "mpris",
  connections: [
    [
      Mpris,
      (box, busName) => {
        const player = Mpris.getPlayer(busName);
        box.visible = !!player;
        if (!player) {
          box[PROPERTY_BUS_NAME] = null;
          return;
        }
        if (box[PROPERTY_BUS_NAME] === busName)
          return;
        box[PROPERTY_BUS_NAME] = busName;
        box.children = [CurrentPlayer(player)];
      },
      "player-changed"
    ]
  ]
});

// src/modules/bar/index.ts
var Left = () => Widget14.Box({
  class_name: "left",
  spacing: 8,
  children: [Workspaces(), MprisModule()]
});
var Center = () => Widget14.Box({
  spacing: 8,
  class_name: "middle",
  children: [
    Date(),
    Time(),
    ScreenrecordIndicator(),
    ScreenshotIndicator(),
    NotificationIndicator()
  ]
});
var Right = () => Widget14.Box({
  class_name: "right",
  spacing: 8,
  children: [Widget14.Box({ hexpand: true }), AudioModule(), SysTray(), SystemInfo()]
});
var Bar = ({ monitor = 0 } = {}) => Widget14.Window({
  name: `bar-${monitor}`,
  class_name: "bar",
  exclusive: true,
  monitor,
  anchor: ["top", "left", "right"],
  child: Widget14.CenterBox({
    class_name: "bar",
    start_widget: Left(),
    center_widget: Center(),
    end_widget: Right()
  })
});

// src/modules/osd/audio.ts
import Audio2 from "resource:///com/github/Aylur/ags/service/audio.js";
var VolumeOSD = ({ anchor } = { anchor: "right" }) => OSD({
  name: "osd-volume",
  anchor: anchor === "center" ? [] : [anchor],
  connection: [Audio2, "speaker-changed"],
  child: Progressbar({
    anchor,
    connection: [
      Audio2,
      "speaker-changed",
      () => {
        if (!Audio2.speaker)
          return;
        const volume = Audio2.speaker.volume;
        const isMuted = Audio2.speaker.stream.is_muted;
        return {
          value: volume,
          icon: isMuted ? icons.volume.muted : icons.volume.normal,
          classNames: [["muted", isMuted]]
        };
      }
    ]
  })
});
var MicrophoneOSD = ({ anchor } = { anchor: "right" }) => OSD({
  name: "osd-microphone",
  anchor: anchor === "center" ? [] : [anchor],
  connection: [Audio2, "microphone-changed"],
  child: Progressbar({
    anchor,
    connection: [
      Audio2,
      "microphone-changed",
      () => {
        if (!Audio2.microphone)
          return;
        const volume = Audio2.microphone.volume;
        const isMuted = Audio2.microphone.stream.is_muted;
        return {
          value: volume,
          icon: isMuted ? icons.microphone.muted : icons.microphone.normal,
          classNames: [["muted", isMuted]]
        };
      }
    ]
  })
});
// src/modules/app-launcher/index.ts
import Widget15 from "resource:///com/github/Aylur/ags/widget.js";
import App6 from "resource:///com/github/Aylur/ags/app.js";
import Applications2 from "resource:///com/github/Aylur/ags/service/applications.js";
var launchApp = function(app7) {
  App6.closeWindow(WINDOW_NAME);
  app7.launch();
};
var AppItem = (app7) => {
  const NoDescription = () => Widget15.Label({
    class_name: "title",
    label: app7.name,
    xalign: 0,
    vpack: "center",
    ellipsize: 3
  });
  const WithDescription = () => Widget15.Box({
    vertical: true,
    vpack: "center",
    children: [
      Widget15.Label({
        class_name: "title",
        label: app7.name,
        xalign: 0,
        vpack: "center",
        ellipsize: 3
      }),
      Widget15.Label({
        class_name: "description",
        label: app7.description,
        wrap: true,
        xalign: 0,
        justification: "left",
        vpack: "center"
      })
    ]
  });
  return Widget15.Button({
    class_name: "app",
    on_clicked: () => {
      launchApp(app7);
    },
    child: Widget15.Box({
      children: [
        Widget15.Icon({
          icon: app7.iconName || "application-default-icon",
          size: 48
        }),
        !app7.description ? NoDescription() : WithDescription()
      ]
    })
  });
};
var Search = ({ onUpdate }) => Widget15.Entry({
  hexpand: true,
  text: "---",
  placeholder_text: "Search",
  on_accept: ({ text }) => {
    const list = Applications2.query(text ?? "");
    if (list.length > 0) {
      launchApp(list[0]);
    }
  },
  on_change: ({ text }) => {
    const filteredApps = Applications2.query(text ?? "").map(AppItem);
    onUpdate(filteredApps);
  }
});
var List = () => Widget15.Box({
  vertical: true
});
var Applauncher = () => {
  const list = List();
  const searchInput = Search({
    onUpdate: (apps) => {
      list.children = apps;
      list.show_all();
    }
  });
  return Widget15.Box({
    class_name: "app-launcher",
    properties: [["list", list]],
    vertical: true,
    children: [
      Widget15.Box({
        class_name: "search",
        children: [
          Widget15.Label({ class_name: "icon", label: icons.search }),
          searchInput
        ]
      }),
      Widget15.Scrollable({
        hscroll: "never",
        child: Widget15.Box({
          vertical: true,
          children: [list]
        })
      })
    ],
    connections: [
      [
        App6,
        (_, name, visible) => {
          if (name !== WINDOW_NAME)
            return;
          searchInput.set_text("");
          if (visible)
            searchInput.grab_focus();
        }
      ]
    ]
  });
};
var WINDOW_NAME = "app-launcher";
var AppLauncher = () => PopupWindow({
  name: WINDOW_NAME,
  child: Applauncher()
});

// src/modules/notifications/notification-center.ts
import App7 from "resource:///com/github/Aylur/ags/app.js";
import Widget17 from "resource:///com/github/Aylur/ags/widget.js";
import Notifications2 from "resource:///com/github/Aylur/ags/service/notifications.js";

// src/modules/notifications/notification.ts
import Widget16 from "resource:///com/github/Aylur/ags/widget.js";
import * as Utils3 from "resource:///com/github/Aylur/ags/utils.js";
import GLib8 from "gi://GLib";
var NotificationIcon = ({ app_entry, app_icon, image }) => {
  if (image) {
    return Widget16.Box({
      vpack: "start",
      hexpand: false,
      class_name: "image",
      css: `background-image: url("${image}");`
    });
  }
  let icon = "dialog-information-symbolic";
  if (app_icon && Utils3.lookUpIcon(app_icon))
    icon = app_icon;
  if (app_entry && Utils3.lookUpIcon(app_entry))
    icon = app_entry;
  return Widget16.Box({
    vpack: "start",
    hexpand: false,
    class_name: "image",
    children: [
      Widget16.Icon({
        icon,
        size: 58,
        hpack: "center",
        hexpand: true,
        vpack: "center",
        vexpand: true
      })
    ]
  });
};
var Content = (notification2) => Widget16.EventBox({
  child: Widget16.Box({
    class_name: "content",
    vexpand: false,
    children: [
      NotificationIcon(notification2),
      Widget16.Box({
        hexpand: true,
        vertical: true,
        children: [
          Widget16.Box({
            spacing: 8,
            children: [
              Widget16.Label({
                class_name: "title",
                vpack: "center",
                xalign: 0,
                justification: "left",
                hexpand: true,
                max_width_chars: 24,
                truncate: "end",
                wrap: true,
                label: notification2.summary,
                use_markup: true
              }),
              Widget16.Label({
                class_name: "time",
                vpack: "center",
                label: GLib8.DateTime.new_from_unix_local(notification2.time).format("%H:%M")
              }),
              Widget16.Button({
                class_name: "close-button",
                vpack: "center",
                child: Widget16.Icon("window-close-symbolic"),
                on_clicked: () => notification2.close()
              })
            ]
          }),
          Widget16.Label({
            class_name: "description",
            hexpand: true,
            use_markup: true,
            xalign: 0,
            justification: "left",
            label: notification2.body,
            wrap: true
          })
        ]
      })
    ]
  })
});
var Actions = (notification2) => Widget16.Box({
  class_name: "actions",
  children: notification2.actions.map((action) => Widget16.Button({
    class_name: "action-button",
    on_clicked: () => notification2.invoke(action.id),
    hexpand: true,
    child: Widget16.Label(action.label)
  })),
  binds: [
    ["visible", notification2, "actions", (actions) => actions.length > 0]
  ]
});
var NotificationItem = (notification2) => Widget16.Box({
  class_name: `notification ${notification2.urgency}`,
  vertical: true,
  children: [Content(notification2), Actions(notification2)]
});

// src/modules/notifications/notification-center.ts
var List2 = () => Widget17.Box({
  vertical: true,
  vexpand: true,
  class_name: "list",
  binds: [
    [
      "children",
      Notifications2,
      "notifications",
      (n) => n.reverse().map((n2) => NotificationItem(n2))
    ]
  ]
});
var EmptyList = () => CenteredBox({
  class_name: "empty-list",
  children: [Widget17.Label("No notifications")]
});
var NotificationList = () => Widget17.Scrollable({
  class_name: "notifications-scrollable",
  vexpand: true,
  hscroll: "never",
  vscroll: "automatic",
  child: Widget17.Stack({
    items: [
      ["empty", EmptyList()],
      ["list", List2()]
    ],
    binds: [
      [
        "shown",
        Notifications2,
        "notifications",
        (n) => n.length > 0 ? "list" : "empty"
      ]
    ]
  })
});
var ClearButton = () => Widget17.Button({
  on_clicked: (btn) => {
    if (btn.sensitive) {
      Notifications2.clear();
      App7.closeWindow("notification-center");
    }
  },
  class_name: "clear-button",
  child: Widget17.Box({
    spacing: 5,
    children: [
      Widget17.Label({
        label: "Clear",
        vpack: "center"
      }),
      Widget17.Label({ class_name: "icon", label: icons.trash })
    ]
  })
});
var DoNotDisturbSwitch = () => Widget17.Switch({
  class_name: "dnd",
  vpack: "center",
  connections: [
    [
      "notify::active",
      ({ active }) => {
        Notifications2.dnd = active;
      }
    ]
  ]
});
var Header = () => Widget17.Box({
  class_name: "header",
  spacing: 8,
  vpack: "center",
  children: [
    Widget17.Label({
      label: "Do Not Disturb",
      vpack: "center"
    }),
    DoNotDisturbSwitch(),
    Widget17.Box({ hexpand: true }),
    ClearButton()
  ],
  connections: [
    [
      Notifications2,
      (box) => box.children[3].visible = Notifications2.notifications.length > 0,
      "notify::notifications"
    ]
  ]
});
var NotificationCenter = () => PopupWindow({
  name: "notification-center",
  anchor: ["top"],
  child: Widget17.Box({
    vertical: true,
    class_name: "notifications",
    children: [Header(), NotificationList()]
  })
});
// src/modules/power-menu/index.ts
import App9 from "resource:///com/github/Aylur/ags/app.js";

// src/modules/power-menu/power-menu.ts
import App8 from "resource:///com/github/Aylur/ags/app.js";
import Widget18 from "resource:///com/github/Aylur/ags/widget.js";
import Variable2 from "resource:///com/github/Aylur/ags/variable.js";
import * as Utils4 from "resource:///com/github/Aylur/ags/utils.js";
var confirm = function(action) {
  confirmInfo.value = action;
  App8.openWindow(WINDOW_NAME_CONFIRM);
};
var WINDOW_NAME_POWERMENU = "power-menu";
var WINDOW_NAME_CONFIRM = "power-menu-confirm";
var Actions2 = [
  {
    cmd: "loginctl terminate-session self",
    label: "Log Out",
    key: "logout",
    icon: icons.powerMenu.logout
  },
  {
    cmd: "systemctl reboot",
    label: "Reboot",
    key: "reboot",
    icon: icons.powerMenu.reboot
  },
  {
    cmd: "systemctl poweroff",
    label: "Shutdown",
    key: "shutdown",
    icon: icons.powerMenu.shutdown
  }
];
var confirmInfo = Variable2({
  label: "",
  cmd: "",
  icon: "",
  key: ""
});
var ConfirmWindow = () => Widget18.Window({
  name: WINDOW_NAME_CONFIRM,
  expand: true,
  visible: false,
  anchor: [],
  focusable: true,
  popup: true,
  child: Widget18.Box({
    class_name: "confirmation",
    vertical: true,
    homogeneous: true,
    binds: [
      ["className", confirmInfo, "value", ({ key }) => `confirmation ${key}`]
    ],
    children: [
      Widget18.Box({
        class_name: "title",
        vertical: false,
        vexpand: true,
        hpack: "center",
        children: [
          Widget18.Label({
            class_name: "icon",
            binds: [["label", confirmInfo, "value", ({ icon }) => icon]]
          }),
          Widget18.Label({
            binds: [["label", confirmInfo, "value", ({ label: label2 }) => label2]]
          })
        ]
      }),
      Widget18.Box({
        class_name: "buttons",
        vexpand: true,
        vpack: "end",
        homogeneous: true,
        children: [
          Widget18.Button({
            class_name: "no",
            child: Widget18.Label("No"),
            on_clicked: () => App8.closeWindow(WINDOW_NAME_CONFIRM)
          }),
          Widget18.Button({
            class_name: "yes",
            child: Widget18.Label("Yes"),
            on_clicked: () => {
              Utils4.exec(confirmInfo.value.cmd);
            }
          })
        ]
      })
    ]
  })
});
var Button = (action) => Widget18.Button({
  on_clicked: () => {
    confirm(action);
  },
  vpack: "center",
  class_name: action.key,
  child: Widget18.Box({
    spacing: 8,
    vertical: true,
    children: [
      Widget18.Label({ class_name: "icon", label: action.icon }),
      Widget18.Label(action.label)
    ]
  })
});
var PowerMenuWindow = () => BlockingWindow({
  name: WINDOW_NAME_POWERMENU,
  popup: true,
  childProps: {
    vertical: false,
    homogeneous: true,
    class_name: "power-menu",
    children: Actions2.map(Button)
  }
});

// src/modules/power-menu/index.ts
function togglePowerMenu() {
  App9.closeWindow(WINDOW_NAME_CONFIRM);
  App9.toggleWindow(WINDOW_NAME_POWERMENU);
}
var PowerMenu = () => [PowerMenuWindow(), ConfirmWindow()];

// src/config.ts
globalThis.ags = { App: App10 };
globalThis.powermenu = { toggle: togglePowerMenu };
globalThis.screenshot = screenshot_default;
globalThis.screenrecord = screenrecord_default;
var config = {
  style: App10.configDir + "/style.css",
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
    MicrophoneOSD()
  ].flat()
};
var config_default = config;
export {
  config_default as default
};
