import { PokeballIcon } from "@/components/ui/PokeballIcon";
import { cn } from "@/lib/utils";

interface CardBackFaceProps {
  className?: string;
  iconSize?: number;
}

/** Verso de carta, mesmo visual do Poké Memory */
export function CardBackFace({ className, iconSize = 38 }: CardBackFaceProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 rounded-xl border flex items-center justify-center",
        "bg-gradient-to-br from-indigo-950/80 to-purple-950/60 border-white/15 shadow-inner",
        className
      )}
    >
      <PokeballIcon size={iconSize} className="opacity-55" />
    </div>
  );
}
