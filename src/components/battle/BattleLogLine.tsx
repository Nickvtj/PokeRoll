"use client";

import { BATTLE_CLASSIC_THEME } from "@/data/battle-theme";
import type { BattleLogEntry } from "@/types/battle";

function cleanMessage(message: string): string {
  return message.replace(/→/g, " em ").replace(/\[Dano convencional\]/gi, "").trim();
}

/* Paleta do log sobre a caixa de diálogo clássica (modo dark) */
const C = BATTLE_CLASSIC_THEME
  ? {
      base: "text-[#9aa6b8]",
      move: "text-[#f8c860] font-bold",
      moveMiss: "text-[#f8c860]/70",
      damage: "text-[#f87868] font-bold",
    }
  : {
      base: "text-white/50",
      move: "text-amber-300",
      moveMiss: "text-amber-300/70",
      damage: "text-red-400",
    };

export function BattleLogLine({ entry }: { entry: BattleLogEntry }) {
  const raw = cleanMessage(entry.message);

  if (entry.type === "attack") {
    const used = raw.match(/^(.+?) usou (.+?)!$/);
    if (used) {
      return (
        <span>
          <span className={C.base}>{used[1]} usou </span>
          <span className={C.move}>{used[2]}</span>
          <span className={C.base}>!</span>
        </span>
      );
    }

    const missed = raw.match(/^(.+?) errou (.+?)!$/);
    if (missed) {
      return (
        <span>
          <span className={C.base}>{missed[1]} errou </span>
          <span className={C.moveMiss}>{missed[2]}</span>
          <span className={C.base}>!</span>
        </span>
      );
    }
  }

  if (entry.type === "damage") {
    const hit = raw.match(/^(.+?) em (.+?) \(-(\d+)(.*?)\)(?:\s*\[(.+?)\])?$/);
    if (hit) {
      const [, move, target, damage, extras, effBracket] = hit;
      const tail = effBracket ? ` [${effBracket}]` : "";

      return (
        <span>
          <span className={C.move}>{move}</span>
          <span className={C.base}>
            {" "}
            em {target} (
          </span>
          <span className={C.damage}>-{damage}</span>
          <span className={C.base}>
            {extras}){tail}
          </span>
        </span>
      );
    }
  }

  return <span className={C.base}>{raw}</span>;
}
