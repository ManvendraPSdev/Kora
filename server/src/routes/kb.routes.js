const router = require("express").Router();
const controller = require("../controllers/kb.controller");
const authenticate = require("../middlewares/auth.middleware");
const resolveTenant = require("../middlewares/tenant.middleware");
const authorize = require("../middlewares/role.middleware");

router.use(authenticate, resolveTenant);
router.get("/", controller.getAllArticles);
router.post("/", authorize("admin", "super_admin"), controller.createArticle);

module.exports = router;
