const { simpleServer } = require ("../index");
const { server, router } = simpleServer({ port: 8080 }, () => console.log("Server listening at :8080")); // Create simple server

router.get("/", (req, res) => res.sendStatus(200)); // / (GET)
router.get("/test", (req, res) => res.send("Test")); // /test (GET)
router.get("/test2/*", (req, res) => res.sendHtml("<h1>Hello</h1>")); // /test2/w/h/a/t/e/v/e/r (GET)
router.get("/test3/*/", (req, res) => res.sendHtml("<h1>World</h2>")); //test3/whatever (GET)
router.get("/test4/:param/:param2", (req, res) => res.send(req.params)); // test4/what/ever (GET)
router.use("/test5", (req, res) => res.sendHtml("<h1>Works for any method</h1>")); // /test5 (ANY)
router.get("*", (req, res) => res.sendHtml("<h1>Not Found</h1>")); // whatever (GET)
router.use((req, res) => res.sendStatus(404)); // whatever (ANY)