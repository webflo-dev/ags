import { type Variable as TVariable } from "types/variable";

type ScriptDatum = Record<string, string>;
type ScriptOutput = { signal: string; datum: ScriptDatum };

const regex = new RegExp(/(\w+=("[^"]*"|[^ ]*))/g);
function parseScriptOutput(input: string): ScriptOutput {
  const firstSeparator = input.indexOf(" ");

  const signal = input.substring(0, firstSeparator);

  const values = input.substring(firstSeparator + 1);
  const pairs = values.match(regex);

  const datum: ScriptDatum = {};

  if (pairs) {
    pairs.forEach((pair) => {
      const [key, value] = pair.split("=");
      datum[key] = value.replace(/"/g, "");
    });
  }

  return { signal, datum };
}

class CpuService extends Service {
  static {
    Service.register(
      this,
      {},
      {
        usage: ["string", "rw"],
      }
    );
  }

  private _usage = "";

  get usage() {
    return this._usage;
  }
}

class GpuService extends Service {
  static {
    Service.register(
      this,
      {},
      {
        usage: ["string"],
      }
    );
  }

  private _usage = "";

  get usage() {
    return this._usage;
  }
}

class MemoryService extends Service {
  static {
    Service.register(
      this,
      {},
      {
        total: ["string"],
        free: ["string"],
        used: ["string"],
      }
    );
  }

  private _total = "";
  private _free = "";
  private _used = "";

  get total() {
    return this._total;
  }
  get free() {
    return this._free;
  }
  get used() {
    return this._used;
  }
}

type SystemService = CpuService | GpuService | MemoryService;

class SystemInfoService extends Service {
  static {
    Service.register(
      this,
      {},
      {
        cpu: ["jsobject"],
        gpu: ["jsobject"],
        memory: ["jsobject"],
      }
    );
  }

  #var: TVariable<void>;

  private _cpu = new CpuService();
  private _gpu = new GpuService();
  private _memory = new MemoryService();

  #getService(signal: string): [SystemService, string] | undefined {
    switch (signal) {
      case "CPU":
        return [this._cpu, "cpu"];
      case "GPU":
        return [this._gpu, "gpu"];
      case "MEMORY":
        return [this._memory, "memory"];
    }
  }

  constructor() {
    super();

    this.#var = Variable(undefined, {
      listen: [
        `${App.configDir}/scripts/system.sh`,
        (output) => {
          const scriptOutput = parseScriptOutput(output);

          const info = this.#getService(scriptOutput.signal);
          if (!info) return;

          const [service, notifyProp] = info;
          if (!service) return;

          Object.entries(scriptOutput.datum).forEach(([prop, value]) => {
            service.updateProperty(prop, value);
            service.notify(prop);
          });

          service.emit("changed");
          this.emit("changed");
          this.notify(notifyProp);
        },
      ],
    });
  }

  dispose() {
    this.#var.dispose();
  }

  get cpu() {
    return this._cpu;
  }

  get gpu() {
    return this._gpu;
  }

  get memory() {
    return this._memory;
  }
}

export const SystemInfo = new SystemInfoService();
