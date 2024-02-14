import App from "resource:///com/github/Aylur/ags/app.js";
import Service from "resource:///com/github/Aylur/ags/service.js";
import { execAsync } from "resource:///com/github/Aylur/ags/utils.js";
import GLib from "gi://GLib";

function timeStamp() {
  return GLib.DateTime.new_now_local().format("%Y-%m-%d__%H-%M-%S");
}

async function notify(file: string) {
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
    file,
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

function takeScreenshot(geometry: string, file: string) {
  return execAsync(["grim", "-g", `${geometry}`, file]);
}

class ScreenshotService extends Service {
  static {
    Service.register(
      this,
      {},
      {
        busy: ["boolean", "r"],
      }
    );
  }

  busy = false;

  _state(value: boolean) {
    this.busy = value;
    this.notify("busy");
  }

  screenshot() {
    if (this.busy === true) return;

    this._state(true);

    execAsync(`${App.configDir}/scripts/geometry.sh`).then((geometry) => {
      if (!geometry) {
        this._state(false);
        return;
      }

      const file = `${GLib.get_home_dir()}/Pictures/Screenshots/screenshot__${timeStamp()}.png`;
      takeScreenshot(geometry, file)
        .then(() => {
          this._state(false);
          notify(file);
        })
        .catch((err) => {
          this._state(false);
          console.error("screenshot : ", err);
        });
    });
  }
}

export default new ScreenshotService();
