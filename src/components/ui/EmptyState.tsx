import type { LucideIcon } from "lucide-react";

interface Props {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = "",
}: Props) {
  return (
    <div
      className={`card flex flex-col items-center justify-center gap-3 py-16 text-center ${className}`}
    >
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-800">
          <Icon className="h-6 w-6 text-gray-500" aria-hidden="true" />
        </div>
      )}
      <div className="space-y-1">
        <p className="font-semibold text-gray-300">{title}</p>
        {description && (
          <p className="text-sm text-gray-500 max-w-xs">{description}</p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
