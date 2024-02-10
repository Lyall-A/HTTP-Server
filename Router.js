/**
 * Creates router
 */
module.exports = class {
    constructor(server) {
        if (typeof server?.on == "function") server.on("request", (req, res) => this.route(req, res));
    }

    listeners = [];
    routeMethods = ["USE", "GET", "POST", "PUT", "DELETE"];

    /**
     * Parses URLs
     * @param {string} url URL
     * @returns {object} Parsed URL
     */
    parseUrl(url = "/") {
        let path = url.split("?")[0];
        path = path.replace(/\/*$/, "") // Remove trailing slash(es)
        const query = {};

        // Parse query
        const queriesString = url.split("?")[1];
        queriesString?.split("&")?.forEach(queryString => {
            const [key, value] = queryString.split("=");
            query[key] = value || null;
        });

        return {
            url,
            path,
            paths: path.substring(1).split("/"),
            query
        }
    }

    /**
     * Routes a requesst
     * @param {object} req Request object
     * @param {object} res Response object
     */
    route(req, res) {
        const parsedUrl = { path, paths, query } = this.parseUrl(req.url); // Parse URL

        // Modify request object
        req.path = parsedUrl.path;
        req.paths = parsedUrl.paths;
        req.query = parsedUrl.query;
        req.params = {};

        const listenersMethod = this.listeners.filter(i => i.method == req.method || !i.method); // Get listeners
        if (!listenersMethod[0]) return; // Return if no listeners

        const checkListener = (listener, index) => {
            if (!listener) return; // Return if no more listeners
            
            function next() {
                // Next function on callback
                index++;
                checkListener(listenersMethod[index], index);
            }
            
            if (!listener.path) return listener.callback(req, res, next); // Callback if no path
            if (listener.path == "*") return listener.callback(req, res, next) // Callback if path is *
            if (listener.path == (path || "/")) return listener.callback(req, res, next); // Callback if path matches
            if (!listener.paths[0]) return next(); // Try next listener if no paths
            if (listener.paths.length > paths.length) return next(); // Try next listener if router path is longer than request path
            
            // Look for params or anys
            let match = true;
            listener.paths.forEach((listenerPath, index) => {
                if (listenerPath == "*") return; // If any
                if (listenerPath.startsWith(":")) return req.params[listenerPath.substring(1)] = paths[index]; // if parameter
                if (listenerPath == paths[index]) return; // If path matches
                return match = false; // If no match found
            });
            
            if (match && listener.paths.length != paths.length) return listener.path.endsWith("*") ? listener.callback(req, res, next) : next();
            if (match) return listener.callback(req, res, next); // Callback if match
            
            return next(); // Try next listener if no match
        };
        checkListener(listenersMethod[0], 0);
    }
    
    /**
     * Creates function for route method
     * @param {string} method HTTP method
     * @returns {object} Route function
     */
    createListenerMethod(method) {
        return (path, callback) => {
            if (!callback) {
                // Set callback to path
                callback = path;
                path = undefined;
            }

            // Add to listeners
            this.listeners.push({
                method: method?.toUpperCase(),
                path,
                paths: path?.substring(1)?.split("/")?.filter(i => i),
                callback: callback || path
            });
        }
    }

    use = this.createListenerMethod();
    get = this.createListenerMethod("get");
    post = this.createListenerMethod("post");
    put = this.createListenerMethod("put");
    delete = this.createListenerMethod("delete");
}