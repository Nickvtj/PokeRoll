/**
 * Versionamento do storage local.
 *
 * Quando o formato dos dados salvos muda de forma incompatível (ex.: migração
 * da coleção por espécie para o modelo de instâncias na v2), incrementamos a
 * SCHEMA_VERSION. No próximo boot, os saves de gameplay antigos são limpos
 * automaticamente, evitando estados corrompidos sem precisar de migração.
 *
 * Preferências (som, qualidade) e a identidade do usuário são preservadas.
 */

export const SCHEMA_VERSION = 2;

const VERSION_KEY = "pokeroll_schema_version";

/** Chaves de dados de gameplay que são resetadas ao trocar de versão. */
const GAMEPLAY_KEYS = [
  "pokeroll_collection",
  "pokeroll_profile",
  "pokeroll_spins",
  "pokeroll_gym",
  "pokeroll_economy",
] as const;

let ensured = false;

/**
 * Garante que o storage está na versão atual. Se a versão salva for diferente
 * (ou ausente), limpa os dados de gameplay e grava a nova versão.
 *
 * É idempotente por sessão (só executa a checagem uma vez), então pode ser
 * chamado com segurança no início de qualquer inicialização de store.
 */
export function ensureStorageVersion(): void {
  if (ensured) return;
  ensured = true;

  if (typeof window === "undefined") return;

  try {
    const stored = Number(localStorage.getItem(VERSION_KEY) ?? "0");
    if (stored === SCHEMA_VERSION) return;

    for (const key of GAMEPLAY_KEYS) {
      localStorage.removeItem(key);
    }
    localStorage.setItem(VERSION_KEY, String(SCHEMA_VERSION));
  } catch {
    /* storage indisponível: segue com defaults em memória */
  }
}
