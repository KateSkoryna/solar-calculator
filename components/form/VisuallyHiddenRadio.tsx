interface VisuallyHiddenRadioProps {
  name: string;
  value: string;
  checked: boolean;
  disabled?: boolean;
  onSelect: () => void;
}

export default function VisuallyHiddenRadio({
  name,
  value,
  checked,
  disabled = false,
  onSelect,
}: VisuallyHiddenRadioProps) {
  return (
    <input
      type="radio"
      name={name}
      value={value}
      checked={checked}
      disabled={disabled}
      onChange={onSelect}
      className="sr-only"
    />
  );
}
