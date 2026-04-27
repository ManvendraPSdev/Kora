const router = require("express").Router();

router.use("/auth", require("./auth.routes"));
router.use("/tickets", require("./ticket.routes"));
router.use("/chat", require("./chat.routes"));
router.use("/ai", require("./ai.routes"));
router.use("/users", require("./user.routes"));
router.use("/tenant", require("./tenant.routes"));
router.use("/kb", require("./kb.routes"));
router.use("/analytics", require("./analytics.routes"));

module.exports = router;
