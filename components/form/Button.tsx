interface ButtonProps {
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  label: string;
  className?: string;
  disabled?: boolean;
}

export default function Button({
  type = "button",
  onClick,
  label,
  className = "",
  disabled = false,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={` ${className}`}
    >
      {label}
    </button>
  );
}
