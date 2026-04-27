const router = require("express").Router();
const controller = require("../controllers/tenant.controller");
const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

router.get("/", authenticate, authorize("super_admin"), controller.getAllTenants);

module.exports = router;
