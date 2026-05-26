"use client";

import Image from "next/image";
import { Lock } from "lucide-react";
import {
  buildPokemonAvatarId,
  buildTrainerAvatarId,
  canUsePokemonAvatar,
  getUnlockedTrainerAvatars,
  TRAINER_AVATARS,
} from "@/data/trainer-avatars";
import { POKEMON_LIST } from "@/data/pokemon";
import { useGameStore } from "@/stores/game-store";
import { useEconomyStore } from "@/stores/economy-store";
import { cn } from "@/lib/utils";

export function AvatarPicker() {
  const level = useEconomyStore((s) => s.level);
  const selectedAvatarId = useEconomyStore((s) => s.selectedAvatarId ?? "default");
  const setSelectedAvatar = useEconomyStore((s) => s.setSelectedAvatar);
  const collection = useGameStore((s) => s.collection);

  const unlockedTrainers = getUnlockedTrainerAvatars(level);
  const pokemonAvatarsEnabled = canUsePokemonAvatar(level);
  const collectedPokemon = POKEMON_LIST.filter((p) => collection[p.id]);

  return (
    <div className="glass-card p-5 space-y-5">
      <div>
        <h3 className="font-bold text-sm">Galeria de avatares</h3>
        <p className="text-[11px] text-white/40 mt-1">
          Novo treinador a cada 5 níveis · Pokémon da coleção a partir do Nv. 5
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-white/50 font-semibold">Treinadores</p>
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
          {TRAINER_AVATARS.map((avatar) => {
            const unlocked = level >= avatar.unlockLevel;
            const id = buildTrainerAvatarId(avatar.id);
            const selected = selectedAvatarId === id;

            return (
              <button
                key={avatar.id}
                type="button"
                disabled={!unlocked}
                onClick={() => unlocked && setSelectedAvatar(id)}
                title={unlocked ? avatar.label : `Desbloqueia no Nv. ${avatar.unlockLevel}`}
                className={cn(
                  "relative aspect-square rounded-xl border p-1 transition-all",
                  selected
                    ? "border-indigo-400 bg-indigo-500/20 ring-2 ring-indigo-400/50"
                    : "border-white/10 bg-white/5 hover:bg-white/10",
                  !unlocked && "opacity-40 cursor-not-allowed"
                )}
              >
                {!unlocked && (
                  <Lock className="absolute top-1 right-1 w-3 h-3 text-white/40 z-10" />
                )}
                {avatar.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatar.image}
                    alt={avatar.label}
                    className="object-contain w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lg font-bold text-indigo-300">
                    ?
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-white/50 font-semibold">Seus Pokémon</p>
        {!pokemonAvatarsEnabled ? (
          <p className="text-[10px] text-white/35">
            Disponível a partir do Nv. 5 da conta
          </p>
        ) : collectedPokemon.length === 0 ? (
          <p className="text-[10px] text-white/35">Colete Pokémon no álbum para usar como avatar</p>
        ) : (
          <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 max-h-40 overflow-y-auto">
            {collectedPokemon.map((pokemon) => {
              const id = buildPokemonAvatarId(pokemon.id);
              const selected = selectedAvatarId === id;
              return (
                <button
                  key={pokemon.id}
                  type="button"
                  onClick={() => setSelectedAvatar(id)}
                  title={pokemon.name}
                  className={cn(
                    "aspect-square rounded-xl border p-0.5 transition-all",
                    selected
                      ? "border-cyan-400 bg-cyan-500/20 ring-2 ring-cyan-400/40"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  )}
                >
                  <Image
                    src={pokemon.image}
                    alt={pokemon.name}
                    width={48}
                    height={48}
                    className="object-contain w-full h-full"
                    loading="lazy"
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-[10px] text-indigo-300/80">
        Desbloqueados: {unlockedTrainers.length}/{TRAINER_AVATARS.length} treinadores
      </p>
    </div>
  );
}
