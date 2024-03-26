import GLib from "gi://GLib";
import Gio from "gi://Gio";

type Proxy = InstanceType<typeof Gio.DBusProxy> & {
  ListNamesAsync: () => Promise<string[][]>;
};

const DBusIFace = Utils.loadInterfaceXML("org.freedesktop.DBus")!;
const DBusProxy = Gio.DBusProxy.makeProxyWrapper(DBusIFace);

const DBUS_PREFIX = "org.mpris.MediaPlayer2.";

class Player extends Service {
  #id: string;
  #name: string;

  constructor(id: string) {
    super();

    this.#id = id;
    this.#name = id.substring(DBUS_PREFIX.length);
  }
}

export class Mpris extends Service {
  #proxy: Gio.DBusProxy;
  #players = new Map<string, Player>();

  constructor() {
    super();

    this.#proxy = DBusProxy(
      Gio.DBus.session,
      "org.freedesktop.DBus",
      "/org/freedesktop/DBus",
      (proxy, error) => {
        if (error) {
          logError(error);
          return;
        }
        if (!proxy) {
          return;
        }

        this.#onProxyReady(proxy as Proxy);
      },
      null,
      Gio.DBusProxyFlags.NONE
    );
  }

  async #onProxyReady(proxy: Proxy) {
    const [names] = await proxy.ListNamesAsync();
    names.forEach((name) => {
      if (name.startsWith(DBUS_PREFIX)) {
        const player = new Player(name);

        this.#players.set(name, player);
      }
    });

    proxy.connectSignal(
      "NameOwnerChanged",
      (proxy, senderName, [name, oldOwner, newOwner]) => {
        if (!senderName.startsWith(DBUS_PREFIX)) {
          return;
        }

        // proxy.call("org.freedesktop.DBus.NameHasOwner",)

        if (newOwner && !oldOwner) {
          const player = new Player(senderName);
          this.#players.set(senderName, player);
        }
      }
    );
  }
}
