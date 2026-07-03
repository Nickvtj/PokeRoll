"use client";

import { TeamSelectionPreview } from "@/components/battle/TeamSelectionPreview";
import { BATTLE_CLASSIC_THEME, BATTLE_TEAM_SIZE } from "@/data/battle-theme";
import { cn } from "@/lib/utils";

interface BattleTeamPrepLayoutProps {
  children: React.ReactNode;
  action: React.ReactNode;
  maxTeam?: number;
  /** @deprecated Mantido por compatibilidade — layout usa dock flutuante em todos os modos */
  previewLayout?: "responsive" | "bar-only";
}

/** Montagem de time — grid em tela cheia + dock flutuante do time */
export function BattleTeamPrepLayout({
  children,
  action,
  maxTeam = BATTLE_TEAM_SIZE,
}: BattleTeamPrepLayoutProps) {
  return (
    <div className="relative flex flex-col flex-1 min-h-0 h-full">
      <div
        className={cn(
          "battle-prep-shell min-w-0 flex flex-col flex-1 min-h-0 h-full",
          BATTLE_CLASSIC_THEME && "battle-classic-arena p-3 sm:p-4"
        )}
      >
        <div className="flex flex-col flex-1 min-h-0 gap-3">{children}</div>
      </div>

      <TeamSelectionPreview variant="floating" maxTeam={maxTeam} action={action} />
    </div>
  );
}
