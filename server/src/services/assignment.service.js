const User = require("../models/User.model");
const Ticket = require("../models/Ticket.model");

async function assignFreeAgent(tenantId) {
  const agents = await User.find({
    tenantId,
    role: "agent",
    isActive: true,
  });

  if (!agents.length) return null;

  const agentLoads = await Promise.all(
    agents.map(async (agent) => {
      const activeCount = await Ticket.countDocuments({
        tenantId,
        assignedAgentId: agent._id,
        status: { $in: ["open", "in_progress", "escalated"] },
      });
      return { agent, activeCount };
    })
  );

  const minLoad = Math.min(...agentLoads.map((a) => a.activeCount));

  const freeAgents = agentLoads.filter((a) => a.activeCount === minLoad);

  const randomIndex = Math.floor(Math.random() * freeAgents.length);
  return freeAgents[randomIndex].agent;
}

module.exports = { assignFreeAgent };
