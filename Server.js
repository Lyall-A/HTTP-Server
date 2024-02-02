const http = require("http");
const https = require("https");
const fs = require("fs");

const defaultOptions = {
    port: 80,
    secure: false,
    keyPath: null,
    certPath: null,
    key: null,
    cert: null,
    listen: false,
    router: null,
    serverOptions: null
}

/**
 * Creates server
 */
module.exports = class {
    constructor(options = defaultOptions || { }) {
        // Apply default options
        Object.entries(defaultOptions).forEach(([defaultKey, defaultValue]) => {
            if (options[defaultKey] == undefined) options[defaultKey] = defaultValue;
        });

        this.options = options;

        if (options.keyPath) options.key = fs.readFileSync(options.keyPath);
        if (options.certPath) options.cert = fs.readFileSync(options.certPath);

        // Create server
        this.server = (options.secure ? https : http).createServer({ key: options.key, cert: options.cert, ...options.serverOptions });

        if (options.router) this.server.on("request", options.router.route);

        if (options.listen) this.server.listen(options.port);
    }

    on(event, callback) {
        this.server.on(event, callback);
    }

    once(event, callback) {
        this.server.once(event, callback);
    }

    listen(...args) {
        if (typeof args[0] != "number" && this.options.port) args = [ this.options.port, ...args ]; // Set port if not in args
        this.server.listen(...args)
    }
}