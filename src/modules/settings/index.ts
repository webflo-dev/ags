import Gtk from "gi://Gtk?version=3.0";

const RegularWindow = Widget.subclass<
  typeof Gtk.Window,
  Gtk.Window.ConstructorProperties
>(Gtk.Window);

export function Settings() {
  const btn1 = Widget.Button({
    child: Widget.Icon("view-refresh-symbolic"),
  });
  const btn2 = Widget.Button({
    child: Widget.Icon("mail-send-receive-symbolic"),
  });

  const stack = Widget.Stack({
    transition: "slide_left_right",
    // transitionDuration: 1000,
  });

  stack.add_titled(
    Widget.Box({
      child: new Gtk.CheckButton({ label: "Click me" }),
    }),
    "check",
    "Check Button"
  );

  stack.add_titled(
    Widget.Box({
      children: [
        Widget.Label({
          useMarkup: true,
          label: "<big>A fancy label</big>",
        }),
        Widget.Button({ label: "click here!" }),
      ],
    }),
    "label",
    "A label"
  );

  const stackSwitcher = new Gtk.StackSwitcher({
    stack,
  });

  const toolbar = new Gtk.HeaderBar({
    show_close_button: true,
    customTitle: stackSwitcher,
  });
  toolbar.pack_start(btn1);
  toolbar.pack_end(btn2);

  return RegularWindow({
    name: "settings-dialog",
    className: "settings-dialog",
    title: "Settings",
    setup: (win) => {
      win.on("delete-event", () => {
        win.hide();
        return true;
      });
      win.set_default_size(500, 600);
    },
    child: Widget.Box({
      vertical: true,
      children: [
        toolbar,
        Widget.Box({
          vertical: true,
          children: [stack],
        }),
      ],
    }),
  });
}
