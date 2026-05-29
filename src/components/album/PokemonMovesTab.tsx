"use client";

import { Lock, Swords, Zap } from "lucide-react";
import {
  getPokemonMoveEntries,
  isMoveSlotUnlocked,
  MOVE_UNLOCK_LEVELS,
} from "@/data/pokemon-moves";
import { getTypeColor } from "@/data/pokedex";
import { TYPE_LABELS_PT } from "@/data/type-chart";
import { useEconomyStore } from "@/stores/economy-store";
import { cn } from "@/lib/utils";

interface PokemonMovesTabProps {
  pokemonId: number;
  level: number;
}

export function PokemonMovesTab({ pokemonId, level }: PokemonMovesTabProps) {
  const loadouts = useEconomyStore((s) => s.pokemonMoveLoadouts);
  const toggleMoveEquip = useEconomyStore((s) => s.toggleMoveEquip);

  const entries = getPokemonMoveEntries(pokemonId);
  const saved = loadouts[String(pokemonId)] ?? [];
  const unlockedIds = new Set(
    entries.filter((e) => isMoveSlotUnlocked(e.slotIndex, level)).map((e) => e.moveId)
  );
  const equipped = saved.filter((id) => unlockedIds.has(id)).slice(0, 2);
  const equippedCount = equipped.length;

  return (
    <div className="px-5 py-4 space-y-4">
      <div>
        <p className="text-xs font-bold text-white/80">Build de batalha</p>
        <p className="text-[10px] text-white/45 mt-1 leading-relaxed">
          Escolha até 2 golpes para levar à batalha. Novos golpes desbloqueiam conforme o
          nível do Pokémon (Nv. {MOVE_UNLOCK_LEVELS.join(" · Nv. ")}).
        </p>
        <p className="text-[10px] text-indigo-300/80 mt-2 font-semibold">
          Equipados: {equippedCount}/2
        </p>
      </div>

      <div className="space-y-2">
        {entries.map((entry) => {
          const unlocked = isMoveSlotUnlocked(entry.slotIndex, level);
          const isEquipped = equipped.includes(entry.moveId);
          const typeLabel = TYPE_LABELS_PT[entry.move.type] ?? entry.move.type;
          const typeColor = getTypeColor(entry.move.type);

          return (
            <button
              key={entry.moveId}
              type="button"
              disabled={!unlocked}
              onClick={() => unlocked && toggleMoveEquip(pokemonId, entry.moveId)}
              className={cn(
                "w-full text-left rounded-xl border p-3 transition-all",
                !unlocked && "opacity-45 cursor-not-allowed border-white/5 bg-white/[0.02]",
                unlocked &&
                  isEquipped &&
                  "border-emerald-400/50 bg-emerald-500/10 ring-1 ring-emerald-400/30",
                unlocked &&
                  !isEquipped &&
                  "border-white/10 bg-white/5 hover:border-indigo-400/40 hover:bg-indigo-500/5"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-white">{entry.move.name}</p>
                    {isEquipped && (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-emerald-500/25 text-emerald-200 border border-emerald-400/30">
                        Equipado
                      </span>
                    )}
                    {!unlocked && (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-white/5 text-white/40 border border-white/10 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" />
                        Nv. {entry.unlockLevel}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span
                      className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: `${typeColor}CC` }}
                    >
                      {typeLabel}
                    </span>
                    {entry.move.category === "damage" ? (
                      <span className="text-[10px] text-white/45 flex items-center gap-1">
                        <Swords className="w-3 h-3" />
                        Poder {entry.move.power}
                      </span>
                    ) : (
                      <span className="text-[10px] text-white/45 flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        Status
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-white/35 mt-1.5 leading-relaxed">
                    {entry.move.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {equippedCount < 2 && (
        <p className="text-[10px] text-amber-300/70 leading-relaxed">
          {equippedCount === 0
            ? "Nenhum golpe escolhido — na batalha usaremos os melhores disponíveis automaticamente."
            : "Escolha mais 1 golpe para completar sua build."}
        </p>
      )}
    </div>
  );
}
