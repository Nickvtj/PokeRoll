import { cn } from "@/lib/utils";

interface BallIconProps {
  className?: string;
  size?: number;
}

/** Great Ball — topo azul, base branca, faixa azul */
export function GreatBallIcon({ className, size = 40 }: BallIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 drop-shadow-md", className)}
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" fill="white" stroke="#1e293b" strokeWidth="1.5" />
      <path d="M12 2C6.477 2 2 6.477 2 12h20C22 6.477 17.523 2 12 2Z" fill="#3b82f6" />
      <path d="M2 12a10 10 0 0 0 20 0" fill="white" />
      <line x1="2" y1="12" x2="22" y2="12" stroke="#1e293b" strokeWidth="1.5" />
      <line x1="2" y1="14.5" x2="22" y2="14.5" stroke="#2563eb" strokeWidth="2" />
      <circle cx="12" cy="12" r="3.5" fill="white" stroke="#1e293b" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="1.5" fill="#dbeafe" />
    </svg>
  );
}

/** Ultra Ball — topo amarelo/preto, base branca */
export function UltraBallIcon({ className, size = 40 }: BallIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 drop-shadow-md", className)}
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" fill="white" stroke="#1e293b" strokeWidth="1.5" />
      <path d="M12 2C6.477 2 2 6.477 2 12h20C22 6.477 17.523 2 12 2Z" fill="#eab308" />
      <path d="M12 2 L12 12 L2 12 A10 10 0 0 1 12 2Z" fill="#1e293b" opacity="0.85" />
      <path d="M12 2 L22 12 L12 12 A10 10 0 0 0 12 2Z" fill="#1e293b" opacity="0.85" />
      <line x1="2" y1="12" x2="22" y2="12" stroke="#1e293b" strokeWidth="1.5" />
      <line x1="2" y1="14" x2="22" y2="14" stroke="#ca8a04" strokeWidth="2" />
      <circle cx="12" cy="12" r="3.5" fill="white" stroke="#1e293b" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="1.5" fill="#fef9c3" />
    </svg>
  );
}

/** Master Ball — roxo/rosa com detalhes */
export function MasterBallIcon({ className, size = 40 }: BallIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 drop-shadow-lg", className)}
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" fill="white" stroke="#1e293b" strokeWidth="1.5" />
      <path d="M12 2C6.477 2 2 6.477 2 12h20C22 6.477 17.523 2 12 2Z" fill="#9333ea" />
      <ellipse cx="8" cy="7" rx="2.2" ry="2.8" fill="#ec4899" opacity="0.9" />
      <ellipse cx="16" cy="7" rx="2.2" ry="2.8" fill="#ec4899" opacity="0.9" />
      <path d="M12 7 Q10 9 12 11 Q14 9 12 7Z" fill="#ec4899" opacity="0.85" />
      <line x1="2" y1="12" x2="22" y2="12" stroke="#1e293b" strokeWidth="1.5" />
      <line x1="2" y1="14" x2="22" y2="14" stroke="#7e22ce" strokeWidth="2" />
      <circle cx="12" cy="12" r="3.5" fill="white" stroke="#1e293b" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="1.5" fill="#f3e8ff" />
    </svg>
  );
}

export function PokeBallByType({
  type,
  size = 40,
}: {
  type: "poke" | "great" | "ultra" | "master";
  size?: number;
}) {
  switch (type) {
    case "great":
      return <GreatBallIcon size={size} />;
    case "ultra":
      return <UltraBallIcon size={size} />;
    case "master":
      return <MasterBallIcon size={size} />;
    default:
      return null;
  }
}
