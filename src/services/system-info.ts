import Service from "resource:///com/github/Aylur/ags/service.js";
import Variable from "resource:///com/github/Aylur/ags/variable.js";
import App from "resource:///com/github/Aylur/ags/app.js";

const regex = new RegExp(/(\w+=("[^"]*"|[^ ]*))/g);

function readOutputScript(input: string) {
  const firstSeparator = input.indexOf(" ");

  const signalName = input.substring(0, firstSeparator);

  const values = input.substring(firstSeparator + 1);
  const pairs = values.match(regex);
  const info = {};
  if (pairs) {
    pairs.forEach((pair) => {
      const [key, value] = pair.split("=");
      info[key] = value.replace(/"/g, "");
    });
  }

  return [signalName, info];
}

const propertyMapping = {
  CPU: "cpu",
  MEMORY: "memory",
  GPU: "gpu",
};

const properties = Object.values(propertyMapping);

// service properties
const serviceProperties = properties.reduce((accu, prop) => {
  accu[prop] = ["jsobject"];
  return accu;
}, {});

class SystemInfoService extends Service {
  static {
    Service.register(this, {}, serviceProperties);
  }

  _info = {
    cpu: {
      usage: "0",
    },
    memory: {
      total: "0",
      free: "0",
      used: "0",
    },
    gpu: {
      usage: "0",
    },
  };
  _var;

  constructor() {
    super();

    this._var = Variable(["", {}], {
      listen: [App.configDir + "/scripts/system.sh", readOutputScript],
    });

    this._var.connect("changed", ({ value }) => {
      const [signalName, info] = value;
      const propName = propertyMapping[signalName];
      this._info[propName] = info;
      this.notify(propName);
    });
  }

  get cpu() {
    return this._info.cpu;
  }

  get memory() {
    return this._info.memory;
  }

  get gpu() {
    return this._info.gpu;
  }

  dispose() {
    this._var.dispose();
  }
}

export default new SystemInfoService();
