"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { BookOpen, Calendar, Copy, Sparkles, X } from "lucide-react";
import { getPokedexInfo, getTypeColor } from "@/data/pokedex";
import { RarityBadge } from "@/components/ui/RarityBadge";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { RARITY_CONFIG } from "@/data/rarity";
import { getXpProgressFromTotal } from "@/data/pokemon-battle-level";
import { getPokemonDisplayImage } from "@/lib/pokemon-display";
import { useEconomyStore } from "@/stores/economy-store";
import { useGameStore } from "@/stores/game-store";
import { useGymStore } from "@/stores/gym-store";
import { PokemonGymBadges } from "@/components/gym/GymBadge";
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
  const pokemonBattleXp = useEconomyStore((s) => s.pokemonBattleXp);
  const toggleUseShiny = useGameStore((s) => s.toggleUseShiny);
  const getHallOfFameBorder = useGymStore((s) => s.getHallOfFameBorder);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!show) return;
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
            className="relative z-10 w-full max-w-md"
          >
            <div
              className="glass-card overflow-hidden"
              style={{
                borderColor: `${config.color}40`,
                boxShadow: `0 0 40px ${config.glowColor}, 0 20px 60px rgba(0,0,0,0.5)`,
              }}
            >
              {/* Header — padrão PokéRoll */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-300/80 leading-none">
                      Pokédex
                    </p>
                    <p className="text-white font-bold text-sm leading-tight mt-0.5">
                      #{String(pokemon.id).padStart(3, "0")}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-xl glass flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Nome + tipos */}
              <div className="px-5 pt-4 pb-3 border-b border-white/10">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2
                      className="text-2xl font-bold tracking-tight"
                      style={{ color: config.color }}
                    >
                      {pokemon.name}
                    </h2>
                    <p className="text-xs text-white/50 mt-0.5">{info.category}</p>
                  </div>
                  <RarityBadge rarity={pokemon.rarity} size="sm" />
                </div>
                <div className="flex gap-1.5 mt-3">
                  {info.types.map((type) => (
                    <span
                      key={type}
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wide"
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
                  className="flex-shrink-0 w-40 flex flex-col items-center justify-center p-4"
                  style={{
                    background: `radial-gradient(circle at center, ${config.color}15 0%, transparent 70%)`,
                  }}
                >
                  <div className="relative w-28 h-28">
                    <div
                      className="absolute inset-0 rounded-full opacity-30 blur-xl"
                      style={{ backgroundColor: config.color }}
                    />
                    <Image
                      src={displayImage}
                      alt={pokemon.name}
                      width={112}
                      height={112}
                      className="relative z-10 object-contain drop-shadow-2xl"
                      unoptimized
                    />
                    {pokemon.rarity === "legendary" && (
                      <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-amber-400 animate-pulse" />
                    )}
                  </div>
                </div>

                <div className="flex-1 p-4 space-y-1">
                  <StatRow label="Altura" value={`${info.height.toFixed(1)} m`} />
                  <StatRow label="Peso" value={`${info.weight.toFixed(1)} kg`} />
                  <StatRow label="Geração" value={`${pokemon.generation}ª`} />
                  <StatRow
                    label="Cópias"
                    value={`${collection.count}x`}
                    icon={<Copy className="w-3 h-3 text-cyan-400" />}
                  />
                  <StatRow
                    label="Coletado"
                    value={new Date(collection.collectedAt).toLocaleDateString("pt-BR")}
                    icon={<Calendar className="w-3 h-3 text-indigo-400" />}
                  />
                </div>
              </div>

              {/* Shiny toggle */}
              {collection.hasShiny && (
                <div className="px-5 py-3 border-b border-white/10">
                  <p className="text-[10px] text-white/50 font-semibold uppercase tracking-wider mb-2">
                    Aparência na batalha
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => collection.useShiny && toggleUseShiny(pokemon.id)}
                      className={cn(
                        "flex-1 py-2 rounded-xl text-xs font-bold border transition-all",
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
                        "flex-1 py-2 rounded-xl text-xs font-bold border transition-all",
                        usingShiny
                          ? "border-amber-400/50 bg-amber-500/20 text-amber-200"
                          : "border-white/10 bg-white/5 text-white/50 hover:border-white/20"
                      )}
                    >
                      ✨ Shiny
                    </button>
                  </div>
                </div>
              )}

              {/* XP de batalha + insígnias */}
              <div className="px-5 py-4 border-b border-white/10 space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/50 font-semibold">Nível de Batalha</span>
                    <span className="text-indigo-300 font-bold">Nv. {xpProgress.level}</span>
                  </div>
                  <div className="progress-bar h-2">
                    <div
                      className="progress-fill bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all"
                      style={{ width: `${xpProgress.pct}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-white/40 mt-1">
                    {xpProgress.xpInLevel}/{xpProgress.xpNeeded} XP · Total {xpData.xp} XP
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-white/50 font-semibold uppercase tracking-wider mb-2">
                    Insígnias conquistadas
                  </p>
                  {gymBadges.length > 0 ? (
                    <div className="flex flex-wrap gap-2 items-center">
                      <PokemonGymBadges gymIds={gymBadges} size="sm" max={8} />
                    </div>
                  ) : (
                    <p className="text-[10px] text-white/30">
                      Nenhuma insígnia ainda. Vença líderes de ginásio com este Pokémon!
                    </p>
                  )}
                </div>
              </div>

              {/* Descrição */}
              <div className="px-5 py-4">
                <p className="text-xs leading-relaxed text-white/60">
                  {info.description}
                </p>
              </div>

              {/* Footer + botão */}
              <div className="px-5 pb-5 space-y-3">
                <p className="text-center text-[10px] font-medium uppercase tracking-wider text-white/30">
                  Região de Kanto · PokéRoll
                </p>
                <AnimatedButton variant="secondary" onClick={onClose} className="w-full">
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
