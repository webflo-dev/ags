import { type ScriptOutput, ScriptService } from "../script-service";
import { Microphones } from "./microphones";
import { Speakers } from "./speakers";
import type { DeviceValues } from "./types";

const BooleanValues = {
  "1": true,
  "0": false,
  true: true,
  false: false,
  on: true,
  off: false,
};

class AudioService extends ScriptService<DeviceValues> {
  static {
    Service.register(
      this,
      {},
      {
        speakers: ["jsobject", "r"],
        microphones: ["jsobject", "r"],
      }
    );
  }

  private _speakers = new Speakers();
  private _microphones = new Microphones();

  get speakers() {
    return this._speakers;
  }

  get microphones() {
    return this._microphones;
  }

  convertOutput({ datum }: ScriptOutput): DeviceValues {
    return {
      id: Number(datum.id),
      name: datum.name,
      muted: BooleanValues[datum.muted] || false,
      volume: Number(datum.volume),
      type: datum.type,
      default: BooleanValues[datum.default] || false,
    };
  }

  processSignal(signal: string, value: DeviceValues) {
    switch (signal) {
      case "AUDIO::sink":
        this._speakers.process(value);
        break;
      case "AUDIO::source":
        this._microphones.process(value);
        break;
    }
  }
}

export const Audio = new AudioService("audio.sh");
