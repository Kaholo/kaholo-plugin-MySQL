const os = require('os');
const homeDirectory = os.homedir();
const isWin = os.platform()=='win32';
const normalize = require('path').normalize;

function untildify(path){
    return homeDirectory ? path.replace(/^~(?=$|\/|\\)/, homeDirectory) : path;
}

function parseArray(value){
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof(value) === "string") return value.split("\n").map(line=>line.trim()).filter(line=>line);
    throw "Unsupprted array format";
}

module.exports = {
    boolean : (value) =>{
        if (!value || value === "false") return false;
        return true;
    },
    text : (value) =>{
        if (value)
            return value.split('\n');
        return undefined;
    },
    number: (value)=>{
        if (!value) return undefined;
        const parsed = parseInt(value);
        if (parsed === NaN) {
            throw `Value ${value} is not a valid number`
        }
        return parsed;
    },
    autocomplete: (value, getVal)=>{
        if (!value) return undefined;
        if (typeof(value) == "object") return (getVal ? value.value : value.id) || value;
        return value;
    },
    autocompleteOrArray: (value)=>{
        if (!value) return [];
        if (Array.isArray(value)) return value;
        if (typeof(value) == "object") return [value.id || value];
        return [value];
    },
    object: (value)=>{
        if (!value) return undefined;
        if (typeof(value) === "object") return value;
        if (typeof(value) == "string") {
            try {
                return JSON.parse(value);
            }
            catch (e) {}
            return value.split("\n").reduce((prev, cur) => {
                let [key, ...val] = cur.trim().split("=");
                if (!key || !val) throw "bad object format";
                if (Array.isArray(val)) val = val.join("=");
                prev[key] = val;
            }, {});
        }
        throw `Value ${value} is not an object`;
    },
    string: (value)=>{
        if (!value) return undefined;
        if (typeof(value) === "string") return value.trim();
        throw `Value ${value} is not a valid string`;
    },
    mySqlConStr: (value)=>{
        if (!value) return {};
        if (typeof(value) === "object") return value;
        if (!typeof(value) === "string") throw "Bad MySQL connection string format";
        value = value.trim();
        var opts = {};
        const matches = value.match(/^mysql:\/\/(\w+):(.+)@([a-zA-Z]\w*|\d{1,3}.\d{1,3}.\d{1,3}.\d{1,3}):?(\d+)?\/?(\w+)?/g);
        if (matches && matches.length){
            opts = { user: matches[0], password: matches[1], host: matches[2] };
            for (let i = 0; i < matches.length; i++) {
                if (matches[i].startswith(":")) opts.port = module.exports.number(matches[i].slice(1));
                if (matches[i].startswith("/")) opts.database = matches[i].slice(1);
            }
        }
        else {
            const params = value.split(/[;\n]/g);
            const translateKeyMap = {pwd: "password", server: "host", uid: "user"};
            params.forEach(line => {
                line = line.trim();
                if (!line) return;
                let [key, ...val] = line.split("=");
                if (!key || val.length === 0) throw "Bad MySQL connection string format.";
                key = key.trimEnd().toLowerCase(); // key is already trimmed from left
                
                opts[translateKeyMap[key] || key] = val.join("=").trimStart(); // value is already trimmed from right
            });
        }
        return opts;
    },
    path: (value)=>{
        if (!value) return undefined;
        let path = module.exports.string(value);
        if (isWin) path = path.replace(/\//g, '\\');
        else path = path.replace(/\\/g, '/');
        return normalize(untildify(path));
    },
    array: parseArray
}