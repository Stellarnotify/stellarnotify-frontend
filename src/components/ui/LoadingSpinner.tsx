import { Loader2 } from "lucide-react";

interface Props {
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}

const sizeClass = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

export function LoadingSpinner({
  size = "md",
  label = "Loading…",
  className = "",
}: Props) {
  return (
    <div
      role="status"
      aria-label={label}
      className={`flex items-center justify-center gap-2 text-gray-400 ${className}`}
    >
      <Loader2 className={`animate-spin ${sizeClass[size]}`} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
