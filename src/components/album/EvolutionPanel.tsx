"use client";

import { ArrowRight, Candy, Check, Gem, Sparkles } from "lucide-react";
import { getFamilyId } from "@/data/evolution-lines";
import { EVO_ITEM_LABEL } from "@/data/evo-item-labels";
import { useEconomyStore, type EvolutionOption } from "@/stores/economy-store";
import { cn } from "@/lib/utils";
import { playUiSelect, playUiTab } from "@/lib/ui-sounds";

export function useCanSpeciesEvolve(speciesId: number): boolean {
  const getEvolutionOptions = useEconomyStore((s) => s.getEvolutionOptions);
  useEconomyStore((s) => s.pokemonBattleXp);
  useEconomyStore((s) => s.familyCandy);
  useEconomyStore((s) => s.items);
  return getEvolutionOptions(speciesId).some((o) => o.canEvolve);
}

interface EvolutionPanelProps {
  speciesId: number;
  compact?: boolean;
}

export function EvolutionPanel({ speciesId, compact = false }: EvolutionPanelProps) {
  const getEvolutionOptions = useEconomyStore((s) => s.getEvolutionOptions);
  const evolvePokemon = useEconomyStore((s) => s.evolvePokemon);
  const wildCandy = useEconomyStore((s) => s.wildCandy ?? 0);
  const applyWildCandyToFamily = useEconomyStore((s) => s.applyWildCandyToFamily);
  const getFamilyCandy = useEconomyStore((s) => s.getFamilyCandy);
  useEconomyStore((s) => s.pokemonBattleXp);
  useEconomyStore((s) => s.familyCandy);
  useEconomyStore((s) => s.items);

  const options = getEvolutionOptions(speciesId);
  if (options.length === 0) return null;

  const familyId = getFamilyId(speciesId);
  const candyNeeded = options[0]?.step.candyCost ?? 0;
  const currentFamilyCandy = getFamilyCandy(familyId);
  const missingCandy = Math.max(0, candyNeeded - currentFamilyCandy);

  return (
    <div className={cn("space-y-2", compact ? "" : "px-4 py-3 border-b border-white/10")}>
      {!compact && (
        <p className="text-[9px] text-white/50 font-semibold uppercase tracking-wider">
          Evolução
        </p>
      )}
      {wildCandy > 0 && !compact && (
        <div className="rounded-lg bg-violet-500/10 border border-violet-400/25 p-2 flex flex-col gap-1.5">
          <p className="text-[10px] text-violet-200/90 font-semibold">
            Doces Coringa: {wildCandy}
          </p>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => {
                playUiTab();
                const amount = missingCandy > 0 ? Math.min(missingCandy, wildCandy) : Math.min(10, wildCandy);
                if (amount > 0) applyWildCandyToFamily(familyId, amount);
              }}
              disabled={wildCandy <= 0}
              className="flex-1 py-1 rounded-md text-[10px] font-bold bg-violet-500/25 text-violet-100 border border-violet-400/30 hover:bg-violet-500/35 disabled:opacity-40"
            >
              {missingCandy > 0 ? `Usar ${Math.min(missingCandy, wildCandy)}` : "Usar 10"}
            </button>
          </div>
        </div>
      )}
      <div className="flex flex-col gap-2">        {options.map((opt) => (
          <EvolutionRow
            key={opt.toId}
            option={opt}
            compact={compact}
            onEvolve={() => {
              if (evolvePokemon(speciesId, opt.toId)) playUiSelect();
            }}
          />
        ))}
      </div>
    </div>
  );
}

function EvolutionRow({
  option,
  onEvolve,
  compact,
}: {
  option: EvolutionOption;
  onEvolve: () => void;
  compact?: boolean;
}) {
  const { step, toName, hasLevel, hasCandy, hasItem, canEvolve, currentLevel, currentCandy } =
    option;

  return (
    <div className="rounded-lg bg-white/5 border border-white/10 p-2 flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5 text-xs">
        <ArrowRight className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
        <span className="font-semibold truncate">{toName}</span>
      </div>

      <div className="flex flex-wrap gap-1">
        <ReqChip ok={hasLevel} label={`Nv. ${currentLevel}/${step.minLevel}`} />
        <ReqChip
          ok={hasCandy}
          label={`Doce ${currentCandy}/${step.candyCost}`}
          icon={<Candy className="w-3 h-3" />}
        />
        {step.item && (
          <ReqChip
            ok={hasItem}
            label={EVO_ITEM_LABEL[step.item]}
            icon={<Gem className="w-3 h-3" />}
          />
        )}
      </div>

      {!compact && (
        <button
          type="button"
          onClick={onEvolve}
          disabled={!canEvolve}
          className={cn(
            "mt-0.5 w-full py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1",
            canEvolve
              ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:brightness-110 active:scale-[0.98]"
              : "bg-white/5 text-white/30 cursor-not-allowed"
          )}
        >
          {canEvolve ? (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              Evoluir
            </>
          ) : (
            "Requisitos não atendidos"
          )}
        </button>
      )}
    </div>
  );
}

function ReqChip({
  ok,
  label,
  icon,
}: {
  ok: boolean;
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-md border",
        ok
          ? "bg-emerald-500/15 border-emerald-400/40 text-emerald-300"
          : "bg-rose-500/10 border-rose-400/30 text-rose-300/80"
      )}
    >
      {ok ? <Check className="w-3 h-3" /> : icon}
      {label}
    </span>
  );
}
