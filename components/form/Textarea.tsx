import { useFormContext } from "react-hook-form";

interface TextareaProps {
  name: string;
  label: string;
  rows?: number;
  placeholder?: string;
  className?: string;
}

export default function Textarea({
  name,
  label,
  rows = 6,
  placeholder,
  className = "",
}: TextareaProps) {
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
      <textarea
        {...register(name)}
        rows={rows}
        className={`w-full p-3 rounded-md border-2 border-white/20
          bg-white/10 backdrop-blur-md text-[var(--text-white)] placeholder:text-white/60
          focus:outline-none focus:border-[var(--accent)] transition-colors
          resize-none ${className}`}
        placeholder={placeholder}
      />
      {error && (
        <p className="text-red-500 text-sm mt-1">
          {error.message as string}
        </p>
      )}
    </div>
  );
}
