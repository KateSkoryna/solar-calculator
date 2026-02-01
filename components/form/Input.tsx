import { useFormContext } from "react-hook-form";

interface InputProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  className?: string;
}

export default function Input({
  name,
  label,
  type = "text",
  placeholder,
  className = "",
}: InputProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors[name];

  return (
    <div>
      <label className="block text-sm font-medium text-[var(--text-white)] mb-2">
        {label}
      </label>
      <input
        type={type}
        {...register(name, { valueAsNumber: type === "number" })}
        className={`w-full p-3 rounded-md border-2 border-white/20
            bg-white/10 backdrop-blur-md text-[var(--text-white)] placeholder:text-white/60
            focus:outline-none focus:border-[var(--accent)] ${className}`}
        placeholder={placeholder}
      />
      {error && (
        <p className="text-red-500 text-sm mt-1">{error.message as string}</p>
      )}
    </div>
  );
}
