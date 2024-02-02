const { simpleServer } = require ("../index");
const { server, router } = simpleServer(() => console.log("Server listening at :80"));

router.get("/", (req, res) => res.sendStatus(200));
router.use((req, res) => res.sendStatus(404));

// const Server = require("../Server");
// const Router = require("../Router");
// const simpleReq = require("../simpleReq");

// const server = new Server(); // Create server
// const router = new Router(server); // Create router for server

// router.use(simpleReq); // Applies simpleReq

// router.get("/", (req, res) => {
//     // Send main page
//     res.sendHtml("<h1>Main page</h1>");
// });

// router.get("/page/:page", (req, res) => {
//     // Send any page
//     res.sendHtml(`<h1>Page ${req.params.page}</h1>`)
// });

// router.use((req, res) => {
//     // Send 404 page
//     res.sendStatus(404);
// });

// server.listen(80, () => console.log("Server listening at :80")); // Listen at port 80