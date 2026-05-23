import { cn } from "@/lib/utils";

interface PokeballIconProps {
  className?: string;
  size?: number;
}

export function PokeballIcon({ className, size = 20 }: PokeballIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" fill="white" stroke="#1e293b" strokeWidth="1.5" />
      <path
        d="M12 2C6.477 2 2 6.477 2 12h20C22 6.477 17.523 2 12 2Z"
        fill="#ef4444"
      />
      <line x1="2" y1="12" x2="22" y2="12" stroke="#1e293b" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="3.5" fill="white" stroke="#1e293b" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="1.5" fill="#f8fafc" />
    </svg>
  );
}
