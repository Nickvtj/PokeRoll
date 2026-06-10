import { cn } from "@/lib/utils";

interface EggIconProps {
  className?: string;
}

export function EggIcon({ className }: EggIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <ellipse
        cx="12"
        cy="13"
        rx="7"
        ry="9"
        className="fill-current opacity-90"
      />
      <ellipse cx="9" cy="10" rx="1.8" ry="2.2" className="fill-black/20" />
      <ellipse cx="14.5" cy="9" rx="1.4" ry="1.8" className="fill-black/15" />
      <ellipse cx="11" cy="15" rx="1.6" ry="2" className="fill-black/15" />
      <ellipse cx="15" cy="14.5" rx="1.2" ry="1.5" className="fill-black/12" />
      <ellipse cx="8.5" cy="14" rx="1.1" ry="1.4" className="fill-black/12" />
    </svg>
  );
}
