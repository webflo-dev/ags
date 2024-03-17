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

type Screenrecord = {
  recording: boolean;
  timer: number;
  action?: string;
  data?: string;
};

const DEFAULT_VALUES: Screenrecord = {
  recording: false,
  timer: -1,
};

const screenRecord = Variable(DEFAULT_VALUES);

function update(values: Partial<Screenrecord>) {
  screenRecord.setValue({
    ...screenRecord.value,
    ...values,
  });
}

let watcher: TVariable<void> | undefined;

function toggle() {
  if (watcher?.is_listening) {
    stop();
  } else {
    start();
  }
}

async function stop() {
  await Utils.execAsync(`${App.configDir}/scripts/screen-record.sh stop`);
}

function start() {
  let timerInterval: number | undefined;

  if (watcher) {
    watcher.dispose();
    screenRecord.setValue(DEFAULT_VALUES);
  }

  watcher = Variable(undefined, {
    listen: [
      `${App.configDir}/scripts/screen-record.sh start`,
      (output) => {
        const [action, data] = output.split(" ");
        switch (action) {
          case "selection":
            {
              screenRecord.setValue({
                recording: true,
                timer: -1,
                action,
                data,
              });

              if (data === "cancelled") {
                watcher?.stopListen();
                screenRecord.setValue({
                  recording: false,
                  timer: -1,
                  action,
                  data,
                });
              }
            }
            break;
          case "recording":
            {
              screenRecord.setValue({
                recording: true,
                timer: 0,
                action,
                data,
              });

              let timer = 0;
              timerInterval = Utils.interval(1000, () => {
                update({ timer });
                timer++;
              });
            }
            break;
          case "done":
            {
              watcher?.dispose();
              watcher = undefined;

              if (timerInterval) {
                GLib.source_remove(timerInterval);
              }

              update({ recording: false, timer: -1, action, data });
              sendNotification(data);
            }
            break;
        }
      },
    ],
  });
}

export const Screenrecord = Object.assign(screenRecord, {
  stop,
  start,
  toggle,
});
