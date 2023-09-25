const os = require("os");

const homeDirectory = os.homedir();
const isWin = os.platform() === "win32";
const { normalize } = require("path");

function untildify(path) {
  return homeDirectory ? path.replace(/^~(?=$|\/|\\)/, homeDirectory) : path;
}

function parseArray(value) {
  if (!value) {
    return [];
  }
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof (value) === "string") {
    return value.split("\n").map((line) => line.trim()).filter((line) => line);
  }
  throw new Error("Unsupprted array format");
}

module.exports = {
  boolean: (value) => {
    if (!value || value === "false") {
      return false;
    }
    return true;
  },
  text: (value) => {
    if (value) {
      return value.split("\n");
    }
    return undefined;
  },
  number: (value) => {
    if (!value) {
      return undefined;
    }
    const parsed = parseInt(value, 10);
    if (Number.isNaN(parsed)) {
      throw new Error(`Value ${value} is not a valid number`);
    }
    return parsed;
  },
  autocomplete: (value, getVal) => {
    if (!value) {
      return undefined;
    }
    if (typeof (value) === "object") {
      return (getVal ? value.value : value.id) || value;
    }
    return value;
  },
  autocompleteOrArray: (value) => {
    if (!value) {
      return [];
    }
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof (value) === "object") {
      return [value.id || value];
    }
    return [value];
  },
  string: (value) => {
    if (!value) {
      return undefined;
    }
    if (typeof (value) === "string") {
      return value.trim();
    }
    throw new Error(`Value ${value} is not a valid string`);
  },
  mySqlConStr: (value) => {
    if (!value) {
      return {};
    }
    if (typeof (value) === "object") {
      return value;
    }
    if (typeof (value) !== "string") {
      throw new Error("Bad MySQL connection string format");
    }
    const trimmedValue = value.trim();
    let opts = {};
    const matches = trimmedValue.match(/^mysql:\/\/(\w+):(.+)@([a-zA-Z]\w*|\d{1,3}.\d{1,3}.\d{1,3}.\d{1,3}):?(\d+)?\/?(\w+)?/g);
    if (matches && matches.length) {
      opts = { user: matches[0], password: matches[1], host: matches[2] };
      for (let i = 0; i < matches.length; i += 1) {
        if (matches[i].startswith(":")) {
          opts.port = module.exports.number(matches[i].slice(1));
        }
        if (matches[i].startswith("/")) {
          opts.database = matches[i].slice(1);
        }
      }
    } else {
      const params = value.split(/[;\n]/g);
      const translateKeyMap = { pwd: "password", server: "host", uid: "user" };
      params.forEach((line) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) {
          return;
        }
        const [key, ...val] = trimmedLine.split("=");
        if (!key || val.length === 0) {
          throw new Error("Bad MySQL connection string format.");
        }
        const tlckey = key.trimEnd().toLowerCase(); // key is already trimmed from left

        opts[translateKeyMap[tlckey] || tlckey] = val.join("=").trimStart(); // value is already trimmed from right
      });
    }
    return opts;
  },
  path: (value) => {
    if (!value) {
      return undefined;
    }
    let path = module.exports.string(value);
    if (isWin) {
      path = path.replace(/\//g, "\\");
    } else {
      path = path.replace(/\\/g, "/");
    }
    return normalize(untildify(path));
  },
  array: parseArray,
  arrayOfObjects: (value) => {
    if (!value) {
      return undefined;
    }
    if (Array.isArray(value)) {
      if (!value.every((item) => typeof (item) === "object")) {
        throw new Error("Bad Data Format. All items in array must be objects.");
      }
      return value;
    }
    if (typeof value === "object") {
      return [value];
    }
    throw new Error("Unsupported Data Format");
  },
};
