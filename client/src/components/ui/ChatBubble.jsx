import { motion } from "framer-motion";

function formatTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export default function ChatBubble({ message, currentRole = "customer", index = 0 }) {
  const role = message.senderRole;
  const isCustomer = role === "customer";
  const isAi = role === "ai";
  const isAgentSide = role === "agent" || role === "admin";

  const isSelf =
    (currentRole === "customer" && isCustomer) ||
    (currentRole === "agent" && isAgentSide) ||
    (currentRole === "admin" && isAgentSide);

  const senderName = message.senderId?.name || (isAi ? "Kora Intelligence" : role);
  const time = formatTime(message.createdAt);
  const initials = isAi ? "AI" : getInitials(senderName);

  const bubbleVariants = {
    initial: { opacity: 0, x: isSelf ? 40 : -40, y: 20, scale: 0.9, rotate: isSelf ? 2 : -2 },
    animate: { 
      opacity: 1, 
      x: 0, 
      y: 0, 
      scale: 1, 
      rotate: 0,
      transition: { 
        type: "spring", 
        stiffness: 260, 
        damping: 20,
        delay: index * 0.05 
      } 
    }
  };

  return (
    <motion.div 
      variants={bubbleVariants}
      initial="initial"
      animate="animate"
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={`flex w-full gap-4 py-2 group ${isSelf ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar Wrapper */}
      <div className="relative self-end mb-1">
        <motion.div 
          whileHover={{ scale: 1.1, rotate: 5 }}
          className={`
            flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-[12px] font-black shadow-2xl border
            ${isAi 
              ? "brand-gradient text-white border-white/20 shadow-brand/40 ring-4 ring-brand/10" 
              : isSelf 
                ? "bg-surface-active text-brand border-brand/30" 
                : "bg-bg-darker text-text-muted border-white/5"
            }
          `}
        >
          {initials}
        </motion.div>
        {isAi && (
          <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-500 border-2 border-bg shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
        )}
      </div>

      {/* Message Content Area */}
      <div className={`max-w-[85%] flex flex-col gap-2 ${isSelf ? "items-end" : "items-start"}`}>
        {/* Header Info */}
        <div className="flex items-center gap-3 px-2">
          <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${isAi ? "text-brand" : "text-text-muted"}`}>
            {senderName}
          </span>
          {isAi && (
             <motion.div 
               animate={{ opacity: [0.5, 1, 0.5] }}
               transition={{ duration: 2, repeat: Infinity }}
               className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand/5 border border-brand/20 backdrop-blur-md"
             >
                <div className="h-1 w-1 rounded-full bg-brand shadow-[0_0_5px_var(--brand)]"></div>
                <span className="text-[9px] font-black text-brand uppercase tracking-tighter">Neural Response</span>
             </motion.div>
          )}
        </div>

        {/* The Bubble */}
        <div className={`
          relative group transition-all duration-500
          ${isSelf 
            ? "rounded-[24px] rounded-br-none bg-brand text-white shadow-2xl shadow-brand/20 p-5" 
            : isAi 
              ? "rounded-[24px] rounded-bl-none glass border border-brand/20 shadow-2xl shadow-brand/5 p-6 overflow-hidden" 
              : "rounded-[24px] rounded-bl-none bg-surface-raised border border-white/10 shadow-xl p-5"
          }
        `}>
          {isAi && (
            <div className="absolute inset-0 bg-gradient-to-tr from-brand/5 via-transparent to-transparent pointer-events-none"></div>
          )}
          
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap relative z-10 font-medium selection:bg-white/20">
            {message.content}
          </p>

          {isAi && (
            <motion.div 
              className="absolute -right-10 -bottom-10 h-32 w-32 brand-gradient opacity-[0.03] blur-3xl pointer-events-none"
              animate={{ scale: [1, 1.2, 1], opacity: [0.03, 0.05, 0.03] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
          )}
        </div>

        {/* Footer Meta */}
        <div className="flex items-center gap-4 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-[10px] font-bold text-text-muted/50 uppercase tracking-widest">{time}</span>
          {message.aiConfidence != null && isAi && (
            <div className="flex items-center gap-2">
              <div className="h-1 w-20 bg-bg-darker rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.round(Number(message.aiConfidence) * 100)}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full brand-gradient"
                />
              </div>
              <span className="text-[9px] font-black text-brand uppercase tracking-tighter">{Math.round(Number(message.aiConfidence) * 100)}% Match</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
