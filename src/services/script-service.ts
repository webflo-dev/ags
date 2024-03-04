import { type Variable as TVariable } from "types/variable";

export type ScriptDatum = Record<string, string>;
export type ScriptOutput = { signal: string; datum: ScriptDatum };

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

export abstract class ScriptService<T> extends Service {
  #var: TVariable<void>;

  constructor(scriptName: string) {
    super();

    this.#var = Variable(undefined, {
      listen: [
        `${App.configDir}/scripts/${scriptName}`,
        (output) => {
          const scriptOutput = parseScriptOutput(output);
          const value = this.convertOutput(scriptOutput);
          this.processSignal(scriptOutput.signal, value);
        },
      ],
    });
  }

  abstract convertOutput(output: ScriptOutput): T;

  abstract processSignal(signal: string, value: T);

  dispose() {
    this.#var.dispose();
  }
}

type OutputParser<T> = (output: ScriptOutput) => T;
type SignalProcessor<T> = (signal: string, value: T) => void;
export function watchScript<T>(
  scriptName: string,
  convertOutput: OutputParser<T>,
  processSignal: SignalProcessor<T>
) {
  const variable = Variable<void>(undefined, {
    listen: [
      `${App.configDir}/scripts/${scriptName}`,
      (output) => {
        const values = parseScriptOutput(output);
        const value = convertOutput(values);
        processSignal(values.signal, value);
      },
    ],
  });
  return variable;
}
