const router = require("express").Router();
const controller = require("../controllers/chat.controller");
const authenticate = require("../middlewares/auth.middleware");
const resolveTenant = require("../middlewares/tenant.middleware");

router.use(authenticate, resolveTenant);
router.post("/session", controller.startSession);
router.post("/session/:id/message", controller.sendMessage);

module.exports = router;
