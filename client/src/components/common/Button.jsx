import { useRef } from "react";
import { motion } from "framer-motion";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  type = "button",
  onClick,
  className = "",
  ...rest
}) {
  const btnRef = useRef(null);

  const handleClick = (e) => {
    if (disabled || loading) return;
    
    const btn = btnRef.current;
    if (btn) {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const ripple = document.createElement("span");
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      ripple.className = "absolute w-0 h-0 bg-white/40 rounded-full pointer-events-none transform -translate-x-1/2 -translate-y-1/2 animate-[ripple_0.6s_ease-out]";
      
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    }
    
    if (onClick) onClick(e);
  };

  const variants = {
    primary: "bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] animate-shimmer text-white shadow-[0_0_20px_rgba(59,130,246,0.5)] border-transparent",
    secondary: "bg-surface-raised text-text border-white/10 hover:bg-surface-active shadow-xl shadow-black/20",
    ghost: "bg-transparent text-text-secondary hover:text-white border-transparent hover:bg-white/5",
    danger: "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20",
  };

  const sizes = {
    sm: "px-4 py-2 text-[11px] uppercase tracking-widest",
    md: "px-6 py-3 text-sm tracking-wide",
    lg: "px-10 py-4 text-base tracking-wider",
  };

  const isDisabled = disabled || loading;

  return (
    <motion.button
      ref={btnRef}
      type={type}
      onClick={handleClick}
      disabled={isDisabled}
      whileHover={isDisabled ? {} : { 
        y: -3, 
        scale: 1.05, 
        boxShadow: "0 15px 30px -5px rgba(59, 130, 246, 0.6)",
        filter: "brightness(1.1)"
      }}
      whileTap={isDisabled ? {} : { scale: 0.95, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      className={`
        relative overflow-hidden inline-flex items-center justify-center gap-3
        font-black rounded-2xl cursor-pointer select-none transition-all
        ${variants[variant]} ${sizes[size]}
        ${isDisabled ? "opacity-40 cursor-not-allowed grayscale" : ""}
        ${className}
      `}
      {...rest}
    >
      <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity pointer-events-none"></div>
      
      {loading ? (
        <div className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="uppercase text-[10px] font-black">Processing</span>
        </div>
      ) : (
        <span className="relative z-10 flex items-center gap-2">{children}</span>
      )}
    </motion.button>
  );
}
