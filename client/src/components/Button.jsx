function Button({
  children,
  onClick,
  type = "button",
  variant = "primary", // primary | secondary | danger | outline
  size = "md", // sm | md | lg
  disabled = false,
  loading = false,
  className = "",
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3.5 text-base",
  };

  const variantStyles = {
    primary:
      "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow-indigo-500/25 active:scale-98",
    secondary:
      "bg-slate-800 text-white hover:bg-slate-900 shadow-sm active:scale-98",
    danger:
      "bg-rose-600 text-white hover:bg-rose-700 shadow-sm hover:shadow-rose-500/25 active:scale-98",
    outline:
      "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 active:scale-98",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${
        variantStyles[variant] || variantStyles.primary
      } ${className}`}
      {...props}
    >
      {loading && (
        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}

export default Button;

