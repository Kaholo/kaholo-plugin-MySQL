const { ConnectionString } = require("connection-string");

function createConnectionDetails({ connectionString, password }) {
    const connectionDetails = new ConnectionString(connectionString);

    if (password) {
        connectionDetails.password = password;
    }
    return connectionDetails;
}

function removeUndefinedAndEmpty(obj, removeSpecial) {
    Object.entries(obj).forEach(([key, value]) => {
        if (key === "auth") return;
        if (value === undefined) delete obj[key];
        else if (removeSpecial && value === "*") delete obj[key];
        else if (Array.isArray(value) && value.length === 0) delete obj[key];
        else if (typeof (value) === 'object' && !Array.isArray(value)) {
            removeUndefinedAndEmpty(value);
            if (Object.keys(value).length === 0) delete obj[key];
        };
    });
    return obj;
}

module.exports = {
    createConnectionDetails,
    removeUndefinedAndEmpty,
};
