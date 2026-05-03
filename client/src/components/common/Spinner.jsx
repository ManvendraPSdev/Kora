const sizes = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

export default function Spinner({ size = "md", className = "" }) {
  return (
    <div className={`relative ${sizes[size]} ${className}`}>
      <div className="absolute inset-0 rounded-full border-2 border-brand/20"></div>
      <div className="absolute inset-0 rounded-full border-2 border-brand border-t-transparent animate-spin"></div>
    </div>
  );
}
