import type { DeviceValues } from "./types";

class Microhpone extends Service {
  static {
    Service.register(
      this,
      {},
      {
        id: ["int"],
        name: ["string"],
        muted: ["boolean"],
        volume: ["int"],
        type: ["string"],
        default: ["boolean"],
      }
    );
  }

  private _id: number = -1;
  private _name: string = "";
  private _muted: boolean = false;
  private _volume: number = -1;
  private _type: string = "";
  private _default: boolean = false;

  get id() {
    return this._id;
  }
  get name() {
    return this._name;
  }
  get muted() {
    return this._muted;
  }
  get volume() {
    return this._volume;
  }
  get type() {
    return this._type;
  }
  get default() {
    return this._default;
  }

  update(values: DeviceValues) {
    ["id", "name", "muted", "volume", "type", "default"].forEach((prop) => {
      this.updateProperty(prop, values[prop]);
    });
    this.emit("changed");
  }
}

export class Microphones extends Service {
  static {
    Service.register(
      this,
      {
        "default-microphone-changed": ["jsobject"],
        "microphone-added": ["jsobject"],
      },
      {
        microphone: ["jsobject", "r"],
        microphones: ["jsobject", "r"],
      }
    );
  }

  private _defaultMicrophone = new Microhpone();
  private _microphones = new Map<number, Microhpone>();

  get defaultMicrophone() {
    return this._defaultMicrophone;
  }

  get microphones() {
    return this._microphones;
  }

  process(value: DeviceValues) {
    const newDefault = value.id !== this._defaultMicrophone.id;
    let microphoneAdded = false;

    if (!this._microphones.has(value.id)) {
      this._microphones.set(value.id, new Microhpone());
      microphoneAdded = true;
    }

    const microphone = this._microphones.get(value.id);
    if (microphone) {
      microphone.update(value);
    }

    if (value.default) {
      this._defaultMicrophone.update(value);
    }

    if (newDefault) {
      this.emit("default-microphone-changed", this._defaultMicrophone);
    }

    if (microphoneAdded) {
      this.emit("microphone-added", microphone);
    }

    this.emit("changed");
  }
}
