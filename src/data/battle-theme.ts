/** Visual de batalha estilo GBA FireRed/LeafGreen */
export const BATTLE_CLASSIC_THEME = true;

/** Pokémon ativos por lado no campo — combate clássico 2v2 */
export const BATTLE_TEAM_SIZE = 2;

/** Total de Pokémon que o jogador escolhe (2 ativos + reservas no banco) */
export const BATTLE_ROSTER_SIZE = 4;

/** Reservas no banco por lado (entram quando um ativo desmaia) */
export const BATTLE_BENCH_SIZE = BATTLE_ROSTER_SIZE - BATTLE_TEAM_SIZE;
