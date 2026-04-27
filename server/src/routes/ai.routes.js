const router = require("express").Router();
const controller = require("../controllers/ai.controller");
const authenticate = require("../middlewares/auth.middleware");
const resolveTenant = require("../middlewares/tenant.middleware");

router.use(authenticate, resolveTenant);
router.post("/query", controller.queryAI);
router.get("/suggest-reply/:ticketId", controller.getSuggestedReplies);
router.post("/categorize", controller.categorize);

module.exports = router;
