const router = require("express").Router();
const controller = require("../controllers/user.controller");
const authenticate = require("../middlewares/auth.middleware");
const resolveTenant = require("../middlewares/tenant.middleware");
const authorize = require("../middlewares/role.middleware");

router.use(authenticate, resolveTenant);
router.get("/", authorize("admin", "super_admin"), controller.getAllUsers);
router.post("/", authorize("admin", "super_admin"), controller.createUser);

module.exports = router;
