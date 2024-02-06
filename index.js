const Router = require("./Router");
const Server = require("./Server");
const simpleReq = require("./simpleReq");

module.exports = { Router, Server, simpleReq, simpleServer(options, callback) {
    if (typeof options == "function") {
        callback = options;
        options = undefined;
    }
    
    const server = new Server({ ...options, listen: true });
    const router = new Router(server);
    server.on("listening", callback);

    router.use(simpleReq);

    return { server, router };
} };