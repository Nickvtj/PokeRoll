/**
 * Modelo de dados v2 (reset): coleção baseada em instâncias.
 *
 * Uma instância é um Pokémon individual que o jogador possui, com XP/nível
 * próprios. Ao evoluir, o `speciesId` muda mas a instância (e seu XP) é
 * preservada. Regra A: 1 instância por espécie possuída, repetido vira doce.
 */

/** Um bicho individual que o jogador possui. */
export interface PokemonInstance {
  instanceId: string;
  /** Espécie atual (1..151). Muda ao evoluir. */
  speciesId: number;
  /** XP total acumulado; o nível é derivado da curva de XP. */
  xp: number;
  isShiny: boolean;
  caughtAt: string;
  /** Golpes equipados (máx. 2). Migrado de pokemonMoveLoadouts. */
  moves?: string[];
  /** Usar sprite shiny na UI/batalha. */
  useShiny?: boolean;
}

/** Conhecimento permanente do jogador. Nunca perde, mesmo evoluindo/soltando. */
export interface PokedexState {
  /** Espécies já vistas alguma vez → meta 151. */
  seen: number[];
  /** Espécies que o jogador já possuiu ao menos 1x. */
  caughtSpecies: number[];
  /** Espécies já vistas em shiny. */
  shinySeen: number[];
}

/** Itens de evolução (pedras + cabo de ligação). */
export type EvoItemId =
  | "fire-stone"
  | "water-stone"
  | "thunder-stone"
  | "leaf-stone"
  | "moon-stone"
  | "linking-cord";

/** Todos os itens do inventário (evolução + consumíveis existentes). */
export type ItemId = EvoItemId | "lucky-egg" | "rare-candy";

export type ItemInventory = Partial<Record<ItemId, number>>;

/** familyId (= id da forma base) → quantidade de doces daquela família. */
export type FamilyCandy = Record<number, number>;

export function getDefaultPokedex(): PokedexState {
  return { seen: [], caughtSpecies: [], shinySeen: [] };
}
