"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { BookOpen, Calendar, Copy, Sparkles, Swords, X } from "lucide-react";
import { getPokedexInfo, getTypeColor } from "@/data/pokedex";
import { getEvolutionLabel } from "@/data/pokemon-evolution";
import { RarityBadge } from "@/components/ui/RarityBadge";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { RARITY_CONFIG } from "@/data/rarity";
import { getXpProgressFromTotal } from "@/data/pokemon-battle-level";
import { getPokemonDisplayImage } from "@/lib/pokemon-display";
import { useEconomyStore } from "@/stores/economy-store";
import { useGameStore } from "@/stores/game-store";
import { useGymStore } from "@/stores/gym-store";
import { PokemonGymBadges } from "@/components/gym/GymBadge";
import { PokemonMovesTab } from "@/components/album/PokemonMovesTab";
import { EvolutionPanel } from "@/components/album/EvolutionPanel";
import { isLocalAsset } from "@/lib/image-utils";
import { cn } from "@/lib/utils";
import type { CollectedPokemon, Pokemon } from "@/types";

interface PokedexModalProps {
  pokemon: Pokemon | null;
  collection: CollectedPokemon | null;
  show: boolean;
  onClose: () => void;
}

export function PokedexModal({
  pokemon,
  collection,
  show,
  onClose,
}: PokedexModalProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "moves">("profile");
  const pokemonBattleXp = useEconomyStore((s) => s.pokemonBattleXp);
  const isOwned = useEconomyStore((s) => s.isOwned);
  const toggleUseShiny = useGameStore((s) => s.toggleUseShiny);
  const getHallOfFameBorder = useGymStore((s) => s.getHallOfFameBorder);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!show) return;
    setActiveTab("profile");
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [show]);

  if (!pokemon || !collection || !mounted) return null;

  const info = getPokedexInfo(pokemon.id, pokemon.name);
  const config = RARITY_CONFIG[pokemon.rarity];
  const xpData = pokemonBattleXp[String(pokemon.id)] ?? { level: 1, xp: 0 };
  const xpProgress = getXpProgressFromTotal(xpData.xp);
  const gymBadges = getHallOfFameBorder(pokemon.id);
  const displayImage = getPokemonDisplayImage(pokemon.id, collection);
  const usingShiny = Boolean(collection.hasShiny && collection.useShiny);
  const evolutionLabel = getEvolutionLabel(pokemon.id);
  const owned = isOwned(pokemon.id);

  const modal = (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ width: "100vw", height: "100dvh" }}
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md" />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-[380px]"
          >
            <div
              className="glass-card overflow-hidden"
              style={{
                borderColor: `${config.color}40`,
                boxShadow: `0 0 40px ${config.glowColor}, 0 20px 60px rgba(0,0,0,0.5)`,
              }}
            >
              {/* Header, padrão PokéRoll */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <BookOpen className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-indigo-300/80 leading-none">
                      Pokédex
                    </p>
                    <p className="text-white font-bold text-xs leading-tight mt-0.5">
                      #{String(pokemon.id).padStart(3, "0")}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-lg glass flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Abas */}
              <div className="flex border-b border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveTab("profile")}
                  className={cn(
                    "flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5",
                    activeTab === "profile"
                      ? "text-indigo-300 border-b-2 border-indigo-400 bg-indigo-500/5"
                      : "text-white/40 hover:text-white/60"
                  )}
                >
                  <BookOpen className="w-3 h-3" />
                  Perfil
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("moves")}
                  className={cn(
                    "flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5",
                    activeTab === "moves"
                      ? "text-amber-300 border-b-2 border-amber-400 bg-amber-500/5"
                      : "text-white/40 hover:text-white/60"
                  )}
                >
                  <Swords className="w-3 h-3" />
                  Ataques
                </button>
              </div>

              {activeTab === "profile" ? (
                <>
              {/* Nome + tipos */}
              <div className="px-4 pt-2 pb-2 border-b border-white/10">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2
                      className="text-lg font-bold tracking-tight"
                      style={{ color: config.color }}
                    >
                      {pokemon.name}
                    </h2>
                    <p className="text-[9px] text-white/50">{info.category}</p>
                  </div>
                  <RarityBadge rarity={pokemon.rarity} size="sm" />
                </div>
                <div className="flex gap-1 mt-1.5">
                  {info.types.map((type) => (
                    <span
                      key={type}
                      className="px-2 py-0.5 rounded-full text-[8px] font-bold text-white uppercase tracking-wide"
                      style={{
                        backgroundColor: `${getTypeColor(type)}CC`,
                        boxShadow: `0 0 8px ${getTypeColor(type)}40`,
                      }}
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>

              {/* Imagem + stats */}
              <div className="flex gap-0 border-b border-white/10">
                <div
                  className="flex-shrink-0 w-28 flex flex-col items-center justify-center p-2"
                  style={{
                    background: `radial-gradient(circle at center, ${config.color}15 0%, transparent 70%)`,
                  }}
                >
                  <div className="relative w-20 h-20">
                    <div
                      className="absolute inset-0 rounded-full opacity-30 blur-xl"
                      style={{ backgroundColor: config.color }}
                    />
                    <Image
                      src={displayImage}
                      alt={pokemon.name}
                      width={80}
                      height={80}
                      className="relative z-10 object-contain drop-shadow-2xl"
                      unoptimized={!isLocalAsset(displayImage)}
                    />
                    {pokemon.rarity === "legendary" && (
                      <Sparkles className="absolute -top-1 -right-1 w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    )}
                  </div>
                </div>

                <div className="flex-1 p-2.5 space-y-0.5">
                  <StatRow label="Altura" value={`${info.height.toFixed(1)} m`} />
                  <StatRow label="Peso" value={`${info.weight.toFixed(1)} kg`} />
                  <StatRow label="Geração" value={`${pokemon.generation}ª`} />
                  {evolutionLabel && (
                    <StatRow label="Evolução" value={evolutionLabel} />
                  )}
                  <StatRow
                    label="Cópias"
                    value={`${collection.count}x`}
                    icon={<Copy className="w-2.5 h-2.5 text-cyan-400" />}
                  />
                  <StatRow
                    label="Coletado"
                    value={new Date(collection.collectedAt).toLocaleDateString("pt-BR")}
                    icon={<Calendar className="w-2.5 h-2.5 text-indigo-400" />}
                  />
                </div>
              </div>

              {/* Shiny toggle */}
              {collection.hasShiny && (
                <div className="px-4 py-2 border-b border-white/10">
                  <p className="text-[9px] text-white/50 font-semibold uppercase tracking-wider mb-2">
                    Aparência na batalha
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => collection.useShiny && toggleUseShiny(pokemon.id)}
                      className={cn(
                        "flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all",
                        !usingShiny
                          ? "border-indigo-400/50 bg-indigo-500/20 text-indigo-200"
                          : "border-white/10 bg-white/5 text-white/50 hover:border-white/20"
                      )}
                    >
                      Normal
                    </button>
                    <button
                      type="button"
                      onClick={() => !collection.useShiny && toggleUseShiny(pokemon.id)}
                      className={cn(
                        "flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all",
                        usingShiny
                          ? "border-amber-400/50 bg-amber-500/20 text-amber-200"
                          : "border-white/10 bg-white/5 text-white/50 hover:border-white/20"
                      )}
                    >
                      <Sparkles className="w-3 h-3 inline mr-0.5" />
                      Shiny
                    </button>
                  </div>
                </div>
              )}

              {/* XP de batalha + insígnias */}
              <div className="px-4 py-3 border-b border-white/10 space-y-2">
                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-white/50 font-semibold">Nível de Batalha</span>
                    <span className="text-indigo-300 font-bold">Nv. {xpProgress.level}</span>
                  </div>
                  <div className="progress-bar h-1.5">
                    <div
                      className="progress-fill bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all"
                      style={{ width: `${xpProgress.pct}%` }}
                    />
                  </div>
                </div>

                <div>
                  <p className="text-[9px] text-white/50 font-semibold uppercase tracking-wider mb-1.5">
                    Insígnias conquistadas
                  </p>
                  {gymBadges.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <PokemonGymBadges gymIds={gymBadges} size="xs" max={8} />
                    </div>
                  ) : (
                    <p className="text-[9px] text-white/30">
                      Nenhuma insígnia ainda.
                    </p>
                  )}
                </div>
              </div>

              {owned && <EvolutionPanel speciesId={pokemon.id} />}

              {/* Descrição */}
              <div className="px-4 py-3">
                <p className="text-[11px] leading-relaxed text-white/60 line-clamp-3">
                  {info.description}
                </p>
              </div>
                </>
              ) : (
                <PokemonMovesTab pokemonId={pokemon.id} level={xpProgress.level} />
              )}

              {/* Footer + botão */}
              <div className="px-4 pb-4 space-y-2">
                <p className="text-center text-[9px] font-medium uppercase tracking-wider text-white/30">
                  Região de Kanto, PokéRoll
                </p>
                <AnimatedButton variant="secondary" size="sm" onClick={onClose} className="w-full">
                  Fechar
                </AnimatedButton>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modal, document.body);
}

function StatRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2 py-1.5 border-b border-white/5 last:border-0">
      <span className="text-white/50 text-xs font-medium flex items-center gap-1.5">
        {icon}
        {label}
      </span>
      <span className="font-bold text-white text-xs">{value}</span>
    </div>
  );
}
