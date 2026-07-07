"use client";

import { useMemo } from "react";
import { Sparkles, Gem, Cable, Candy, Star } from "lucide-react";
import { POKEMON_MAP } from "@/data/pokemon";
import { EVO_ITEM_LABEL } from "@/data/evo-item-labels";
import { useEconomyStore } from "@/stores/economy-store";
import type { EvoItemId } from "@/types/instance";

const ALL_EVO_ITEMS: EvoItemId[] = [
  "fire-stone",
  "water-stone",
  "thunder-stone",
  "leaf-stone",
  "moon-stone",
  "linking-cord",
];

export function MochilaView() {
  const familyCandy = useEconomyStore((s) => s.familyCandy);
  const items = useEconomyStore((s) => s.items);
  const wildCandy = useEconomyStore((s) => s.wildCandy ?? 0);
  const rareCandyCount = useEconomyStore((s) => s.rareCandyCount ?? 0);
  const luckyEggCount = useEconomyStore((s) => s.luckyEggCount ?? 0);

  const candyEntries = useMemo(() => {
    return Object.entries(familyCandy ?? {})
      .map(([familyId, amount]) => ({
        familyId: Number(familyId),
        amount: amount as number,
        name: POKEMON_MAP[Number(familyId)]?.name ?? `#${familyId}`,
      }))
      .filter((e) => e.amount > 0)
      .sort((a, b) => a.familyId - b.familyId);
  }, [familyCandy]);

  return (
    <div className="space-y-5">
      <section className="space-y-2">
        <h3 className="text-sm font-bold text-white/80 flex items-center gap-1.5">
          <Candy className="w-4 h-4 text-pink-300" />
          Doces
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <ItemTile
            icon={<Star className="w-5 h-5 text-violet-300" />}
            label="Doce Coringa"
            value={wildCandy}
            hint="Aplicar no Pokédex"
            dim={wildCandy === 0}
          />
          <ItemTile
            icon={<Candy className="w-5 h-5 text-sky-300" />}
            label="Rare Candy"
            value={rareCandyCount}
            hint="Sobe nível"
          />
          {candyEntries.map((e) => (
            <ItemTile
              key={e.familyId}
              icon={<Candy className="w-5 h-5 text-pink-300" />}
              label={`Doce de ${e.name}`}
              value={e.amount}
              hint="Evolução"
            />
          ))}
          {candyEntries.length === 0 && (
            <p className="col-span-full text-[11px] text-white/35 italic">
              Duplicatas de Pokémon que evoluem viram Doces da Família.
            </p>
          )}
        </div>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-bold text-white/80 flex items-center gap-1.5">
          <Gem className="w-4 h-4 text-violet-300" />
          Itens de evolução
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {ALL_EVO_ITEMS.map((id) => (
            <ItemTile
              key={id}
              icon={
                id === "linking-cord" ? (
                  <Cable className="w-5 h-5 text-amber-300" />
                ) : (
                  <Gem className="w-5 h-5 text-violet-300" />
                )
              }
              label={EVO_ITEM_LABEL[id]}
              value={items?.[id] ?? 0}
              dim={(items?.[id] ?? 0) === 0}
            />
          ))}
          <ItemTile
            icon={<Sparkles className="w-5 h-5 text-amber-300" />}
            label="Lucky Egg"
            value={luckyEggCount}
            dim={luckyEggCount === 0}
          />
        </div>
      </section>
    </div>
  );
}

function ItemTile({
  icon,
  label,
  value,
  hint,
  dim,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  hint?: string;
  dim?: boolean;
}) {
  return (
    <div className={`glass-card p-3 flex items-center gap-2.5${dim ? " opacity-45" : ""}`}>
      <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold truncate">{label}</p>
        <p className="text-[10px] text-white/45">
          <span className="tabular-nums font-bold text-white/80">{value}</span>
          {hint ? ` · ${hint}` : ""}
        </p>
      </div>
    </div>
  );
}
