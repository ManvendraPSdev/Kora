import { motion } from "framer-motion";

export default function MetricCard({ label, value, icon, color = "brand", sub = "" }) {
  const colorMap = {
    brand:   "from-blue-500/20 to-blue-600/5 text-blue-400",
    rose:    "from-rose-500/20 to-rose-600/5 text-rose-400",
    amber:   "from-amber-500/20 to-amber-600/5 text-amber-400",
    emerald: "from-emerald-500/20 to-emerald-600/5 text-emerald-400",
  };
  
  const colorClass = colorMap[color] ?? colorMap.brand;

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      className="relative overflow-hidden p-5 rounded-2xl bg-surface border border-border group transition-all duration-300 hover:border-border-strong hover:shadow-2xl hover:shadow-brand/5"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorClass} opacity-5 blur-3xl -mr-10 -mt-10 group-hover:opacity-10 transition-opacity`}></div>
      
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-bold text-text-muted uppercase tracking-widest">{label}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-extrabold text-text tracking-tight">{value ?? "—"}</h3>
            {sub && <span className="text-xs font-medium text-text-muted">{sub}</span>}
          </div>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${colorClass} text-2xl shadow-inner`}>
          {icon}
        </div>
      </div>
      
      <div className="mt-4 h-1 w-full bg-surface-raised rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 1, delay: 0.5 }}
          className={`h-full bg-gradient-to-r ${colorClass}`}
        ></motion.div>
      </div>
    </motion.div>
  );
}
