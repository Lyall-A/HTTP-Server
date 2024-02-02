const http = require("http");
const https = require("https");

const defaultOptions = {
    port: 80,
    secure: false,
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
        this.server.listen(...args)
    }
}