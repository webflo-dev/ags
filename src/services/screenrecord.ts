import App from "resource:///com/github/Aylur/ags/app.js";
import { execAsync, interval } from "resource:///com/github/Aylur/ags/utils.js";
import Service from "resource:///com/github/Aylur/ags/service.js";
import GLib from "gi://GLib";

type State = "idle" | "selecting_area" | "recording";

function timeStamp() {
  return GLib.DateTime.new_now_local().format("%Y-%m-%d__%H-%M-%S");
}

async function notify(file: string) {
  const result = await execAsync([
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
    file,
  ]);
  switch (result) {
    case "copy-file":
      execAsync(`wl-copy --type text/plain  ${file}`);
      break;
    case "view":
      execAsync(`mpv ${file}`);
      break;
    case "delete":
      execAsync(`rm ${file}`);
      break;
  }
}

function startRecording(geometry: string, file: string) {
  return execAsync(["wf-recorder", "-g", `${geometry}`, "-f", file]);
}

function stopRecording() {
  return execAsync("killall -INT wf-recorder");
}

class ScreenrecordService extends Service {
  static {
    Service.register(
      this,
      {},
      {
        timer: ["int", "r"],
        state: ["string", "r"],
      }
    );
  }

  state: State = "idle";
  timer = 0;

  _file = "";
  _interval = 0;

  _state(value) {
    this.state = value;
    this.notify("state");
  }

  start() {
    if (this.state !== "idle") return;
    this._state("selecting_area");

    execAsync(`${App.configDir}/scripts/geometry.sh`).then((geometry) => {
      if (!geometry) {
        this._state("idle");
        return;
      }

      this._file = `${GLib.get_home_dir()}/Videos/Recordings/screenrecord__${timeStamp()}.mp4`;

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
    if (this.state === "idle") return;

    stopRecording()
      .then(() => {
        this._state("idle");
        GLib.source_remove(this._interval);
        notify(this._file);
      })
      .catch((err) => {
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

export default new ScreenrecordService();
