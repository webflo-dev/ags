import { ScriptOutput, watchScript } from "./script-service";

type Cpu = {
  usage: number;
};

type Gpu = {
  usage: number;
};

type Memory = {
  total: number;
  free: number;
  used: number;
};

type Info<K extends string, T extends Cpu | Gpu | Memory> = {
  notifyProp: K;
  value: T;
};

const cpu = Variable<Cpu>({ usage: 0 });
const gpu = Variable<Gpu>({ usage: 0 });
const memory = Variable<Memory>({ total: 0, free: 0, used: 0 });

function parse(
  output: ScriptOutput
): Info<"cpu", Cpu> | Info<"gpu", Gpu> | Info<"memory", Memory> | undefined {
  switch (output.signal) {
    case "CPU":
      return {
        notifyProp: "cpu",
        value: { usage: Number(output.datum.usage) },
      };
    case "GPU":
      return {
        notifyProp: "gpu",
        value: { usage: Number(output.datum.usage) },
      };
    case "MEMORY":
      return {
        notifyProp: "memory",
        value: {
          total: Number(output.datum.total),
          free: Number(output.datum.free),
          used: Number(output.datum.used),
        },
      };
    default:
      return undefined;
  }
}

watchScript("system.sh", parse, (signal, values) => {
  if (!values) return;
  const { notifyProp, value } = values;

  switch (notifyProp) {
    case "cpu":
      cpu.setValue(value);
      break;
    case "gpu":
      gpu.setValue(value);
      break;
    case "memory":
      memory.setValue(value);
      break;
  }
});

export const SystemInfo = {
  cpu,
  gpu,
  memory,
};
