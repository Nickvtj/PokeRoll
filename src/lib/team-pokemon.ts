import { POKEMON_MAP } from "@/data/pokemon";
import { resolveTeamPokemon } from "@/lib/pokemon-display";
import { useGameStore } from "@/stores/game-store";

/** Monta time com sprites normal/shiny conforme preferência do álbum */
export function getTeamPokemonForBattle(teamIds: number[]) {
  const collection = useGameStore.getState().collection;
  return resolveTeamPokemon(teamIds, collection);
}

export { POKEMON_MAP };
