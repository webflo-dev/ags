type ScreenshotStatus = {
  busy: boolean;
  fileName: string;
  error: string;
};

function notify(fileName: string) {
  Utils.notify({
    iconName: fileName,
    summary: "Screenshot",
    body: fileName,
    actions: {
      "Copy image": () => {
        Utils.execAsync(`bash -c "wl-copy --type image/png < ${fileName}"`);
      },
      "Copy path": () => {
        Utils.execAsync(`wl-copy --type text/plain ${fileName}`);
      },
      View: () => {
        Utils.execAsync(`imv ${fileName}`);
      },
      Edit: () => {
        Utils.execAsync(`swappy -f ${fileName}`);
      },
      Delete: () => {
        Utils.execAsync(`rm ${fileName}`);
      },
    },
  });
}

async function takeScreenshot() {
  try {
    screenshot.value = { busy: true, fileName: "", error: "" };

    const fileName = await Utils.execAsync(
      `${App.configDir}/scripts/screenshot.sh`
    );
    screenshot.value = fileName
      ? { busy: false, fileName, error: "" }
      : { busy: false, fileName, error: "" };
    notify(fileName);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : JSON.stringify(error, null, 2);
    console.error(`screenshot: ${errorMessage}`);
    screenshot.value = { busy: false, fileName: "", error: errorMessage };
  }
}

const screenshot = Variable<ScreenshotStatus>({
  busy: false,
  fileName: "",
  error: "",
});

export const Screenshot = Object.assign(screenshot, {
  screenshot: takeScreenshot, // alias for legacy hyprland shortcut
  takeScreenshot,
});
