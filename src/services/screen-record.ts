import GLib from "gi://GLib";
import { type Variable as TVariable } from "types/variable";

function sendNotification(fileName: string) {
  Utils.notify({
    iconName: fileName,
    summary: "Screen record",
    body: fileName,
    actions: {
      "Copy path": () => {
        Utils.execAsync(`wl-copy --type text/plain ${fileName}`);
      },
      View: () => {
        Utils.execAsync(`mpv ${fileName}`);
      },
      Delete: () => {
        Utils.execAsync(`rm ${fileName}`);
      },
    },
  });
}

class ScreenrecordService extends Service {
  static {
    Service.register(
      this,
      {
        recording: ["boolean", "int", "string", "string"],
      },
      {}
    );
  }

  #watcher: TVariable<void> | undefined;
  #timerInterval: number | undefined;

  start() {
    this.#watcher = Variable(undefined, {
      listen: [
        `${App.configDir}/scripts/screen-record.sh start`,
        (output) => {
          const [action, data] = output.split(" ");
          switch (action) {
            case "selection":
              {
                this.emit("recording", true, -1, action, data);

                if (data === "cancelled") {
                  this.emit("recording", false, -1, action, data);
                  this.#watcher?.stopListen();
                }
              }
              break;
            case "recording":
              {
                this.emit("recording", true, 0, action, data);

                let timer = 0;
                this.#timerInterval = Utils.interval(1000, () => {
                  this.emit("recording", true, timer, action, data);
                  timer++;
                });
              }
              break;
            case "done":
              {
                this.#watcher?.stopListen();

                if (this.#timerInterval) {
                  GLib.source_remove(this.#timerInterval);
                }

                this.emit("recording", false, -1, action, data);
                sendNotification(data);
              }
              break;
          }
        },
      ],
    });
  }

  async stop() {
    await Utils.execAsync(`${App.configDir}/scripts/screen-record.sh stop`);
  }

  toggle() {
    if (this.#watcher?.is_listening) {
      this.stop();
    } else {
      this.start();
    }
  }
}

export const Screenrecord = new ScreenrecordService();
