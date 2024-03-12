import type { DeviceValues } from "./types";

class Speaker extends Service {
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

export class Speakers extends Service {
  static {
    Service.register(
      this,
      {
        "default-speaker-changed": ["jsobject"],
        "speaker-added": ["jsobject"],
      },
      {
        speaker: ["jsobject", "r"],
        speakers: ["jsobject", "r"],
      }
    );
  }

  private _defaultSpeaker = new Speaker();
  private _speakers = new Map<number, Speaker>();

  get defaultSpeaker() {
    return this._defaultSpeaker;
  }

  get speakers() {
    return this._speakers;
  }

  process(value: DeviceValues) {
    const newDefault = value.id !== this._defaultSpeaker.id;
    let speakerAdded = false;

    if (!this._speakers.has(value.id)) {
      this._speakers.set(value.id, new Speaker());
      speakerAdded = true;
    }

    const speaker = this._speakers.get(value.id);
    if (speaker) {
      speaker.update(value);
    }

    if (value.default) {
      this._defaultSpeaker.update(value);
    }

    if (newDefault) {
      this.emit("default-speaker-changed", this._defaultSpeaker);
    }

    if (speakerAdded) {
      this.emit("speaker-added", speaker);
    }

    this.emit("changed");
  }
}
