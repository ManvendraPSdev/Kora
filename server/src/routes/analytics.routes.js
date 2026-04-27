const router = require("express").Router();
const controller = require("../controllers/analytics.controller");
const authenticate = require("../middlewares/auth.middleware");
const resolveTenant = require("../middlewares/tenant.middleware");
const authorize = require("../middlewares/role.middleware");

router.get("/overview", authenticate, resolveTenant, authorize("admin", "super_admin"), controller.getOverview);

module.exports = router;
