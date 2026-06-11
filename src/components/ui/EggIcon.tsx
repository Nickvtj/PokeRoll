import Image from "next/image";
import { EGG_SPRITES, type PokemonGoEggType } from "@/data/egg-styles";
import { cn } from "@/lib/utils";

interface EggIconProps {
  className?: string;
  /** Sprite oficial do GO (mesmos da tela de ovos) */
  variant?: PokemonGoEggType;
}

/** Silhueta de ovo no estilo dos icones do header (lucide-like) */
export function EggOutlineIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <path
        d="M12 22c4.5 0 8-5.5 8-11S15.5 2 12 2 4 5.5 4 11s3.5 11 8 11z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function EggIcon({ className, variant = "5km" }: EggIconProps) {
  return (
    <Image
      src={EGG_SPRITES[variant]}
      alt=""
      width={24}
      height={24}
      className={cn("shrink-0 object-contain", className)}
      aria-hidden
    />
  );
}
