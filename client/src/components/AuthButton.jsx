export default function AuthButton({ text, onClick, type = "button", disabled, fullWidth = true }) {
  return (
    <button
      className={`${fullWidth ? "w-full " : ""}button-primary rounded-xl font-medium px-4 py-2.5 mt-2 active:scale-[0.98] transition-all duration-200`}
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </button>
  );
}
