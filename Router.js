const listeners = [ ];

/**
 * Creates router
 */
module.exports = class {
    constructor(server) {
        if (typeof server?.on == "function") server.on("request", route);
    }
    
    listeners = listeners;
    parseUrl = parseUrl;
    route = route;
    routeMethods = [ "USE", "GET", "POST", "PUT", "DELETE" ];
    
    use = createListenerMethod();
    get = createListenerMethod("get");
    post = createListenerMethod("post");
    put = createListenerMethod("put");
    delete = createListenerMethod("delete");
}

/**
 * Parses URLs
 * @param {string} url URL
 * @returns {object} Parsed URL
 */
function parseUrl(url = "/") {
    let path = url.split("?")[0];
    if (path.length > 1 && path.endsWith("/")) path = path.substring(0, path.length - 1); // Remove trailing slash
    const query = { };

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
function route(req, res) {
    const parsedUrl = { path, paths, query } = parseUrl(req.url); // Parse URL

    // Modify request object
    req.path = parsedUrl.path;
    req.paths = parsedUrl.paths;
    req.query = parsedUrl.query;
    req.params = { };
    
    const listenersMethod = listeners.filter(i => i.method == req.method || !i.method); // Get listeners
    if (!listenersMethod[0]) return; // Return if no listeners
    
    (function checkListener(listener, index) {
        if (!listener) return; // Return if no more listeners

        function next() {
            // Next function on callback
            index++;
            checkListener(listenersMethod[index], index);
        }

        
        if (!listener.method) return listener.callback(req, res, next); // Callback if listener was use instead of a method
        if (listener.path == "*") return listener.callback(req, res, next) // Callback if path is *
        if (listener.path == path) return listener.callback(req, res, next); // Callback if path matches
        if (listener.paths.length != paths.length) return next(); // Try next listener if path length does not match

        // Look for params or anys
        let match = true;
        listener.paths.forEach((listenerPath, index) => {
            if (listenerPath == "*") return; // If any
            if (listenerPath.startsWith(":")) return req.params[listenerPath.substring(1)] = paths[index]; // if parameter
            if (listenerPath == paths[index]) return; // If path matches
            return match = false; // If no match found
        });

        if (match) return listener.callback(req, res, next); // Callback if match

        return next(); // Try next listener if no match
    })(listenersMethod[0], 0);
}

/**
 * Creates function for route method
 * @param {string} method HTTP method
 * @returns {object} Route function
 */
function createListenerMethod(method) {
    return function(path, callback) {
        if (!callback) {
            // Set callback to path
            callback = path;
            path = undefined;
        }

        // Add to listeners
        listeners.push({
            method: method?.toUpperCase(),
            path,
            paths: path?.substring(1)?.split("/"),
            callback: callback || path
        });
    }
}