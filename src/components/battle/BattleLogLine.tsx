"use client";

import type { BattleLogEntry } from "@/types/battle";

function cleanMessage(message: string): string {
  return message.replace(/→/g, " em ").replace(/\[Dano convencional\]/gi, "").trim();
}

export function BattleLogLine({ entry }: { entry: BattleLogEntry }) {
  const raw = cleanMessage(entry.message);

  if (entry.type === "attack") {
    const used = raw.match(/^(.+?) usou (.+?)!$/);
    if (used) {
      return (
        <span>
          <span className="text-white/50">{used[1]} usou </span>
          <span className="text-amber-300">{used[2]}</span>
          <span className="text-white/50">!</span>
        </span>
      );
    }

    const missed = raw.match(/^(.+?) errou (.+?)!$/);
    if (missed) {
      return (
        <span>
          <span className="text-white/50">{missed[1]} errou </span>
          <span className="text-amber-300/70">{missed[2]}</span>
          <span className="text-white/50">!</span>
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
          <span className="text-amber-300">{move}</span>
          <span className="text-white/50">
            {" "}
            em {target} (
          </span>
          <span className="text-red-400">-{damage}</span>
          <span className="text-white/50">
            {extras}){tail}
          </span>
        </span>
      );
    }
  }

  return <span className="text-white/50">{raw}</span>;
}
