import { useFormContext } from "react-hook-form";
import { ReactNode } from "react";

interface SelectProps {
  name: string;
  label: string;
  children: ReactNode;
  className?: string;
}

export default function Select({
  name,
  label,
  children,
  className = "",
}: SelectProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors[name];

  return (
    <div>
      <label className="block text-sm font-medium text-[var(--text-body)] mb-2">
        {label}
      </label>
      <select
        {...register(name)}
        className={`w-full p-3 rounded-md
          bg-[var(--input)] text-[var(--text-body)]
          focus:outline-none focus:ring-2 focus:ring-[var(--accent)] ${className}`}
      >
        {children}
      </select>
      {error && (
        <p className="text-red-500 text-sm mt-1">{error.message as string}</p>
      )}
    </div>
  );
}
