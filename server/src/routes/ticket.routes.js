const router = require("express").Router();
const controller = require("../controllers/ticket.controller");
const authenticate = require("../middlewares/auth.middleware");
const resolveTenant = require("../middlewares/tenant.middleware");

router.use(authenticate, resolveTenant);
router.get("/", controller.getAllTickets);
router.post("/", controller.createTicket);
router.get("/:id", controller.getTicket);
router.put("/:id/status", controller.changeTicketStatus);
router.get("/:id/messages", controller.getTicketMessages);
router.post("/:id/messages", controller.addTicketMessage);

module.exports = router;
