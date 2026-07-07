"use client";

import { TeamSelectionPreview } from "@/components/battle/TeamSelectionPreview";
import { BATTLE_CLASSIC_THEME, BATTLE_TEAM_SIZE } from "@/data/battle-theme";
import { cn } from "@/lib/utils";

interface BattleTeamPrepLayoutProps {
  children: React.ReactNode;
  action: React.ReactNode;
  maxTeam?: number;
  /** @deprecated Mantido por compatibilidade, layout usa dock flutuante em todos os modos */
  previewLayout?: "responsive" | "bar-only";
}

/** Montagem de time, grid em tela cheia + dock flutuante do time */
export function BattleTeamPrepLayout({
  children,
  action,
  maxTeam = BATTLE_TEAM_SIZE,
}: BattleTeamPrepLayoutProps) {
  return (
    <div className="relative flex flex-1 min-h-0 h-full gap-3">
      {/* Grade de seleção, dock flutuante só aparece no mobile */}
      <div className="relative flex flex-col flex-1 min-w-0 min-h-0 h-full">
        <div
          className={cn(
            "battle-prep-shell min-w-0 flex flex-col flex-1 min-h-0 h-full",
            BATTLE_CLASSIC_THEME && "battle-classic-arena p-3 sm:p-4"
          )}
        >
          <div className="flex flex-col flex-1 min-h-0 gap-3">{children}</div>
        </div>

        <div className="lg:hidden">
          <TeamSelectionPreview variant="floating" maxTeam={maxTeam} action={action} />
        </div>
      </div>

      {/* Painel vertical fixo do time (desktop), não sobrepõe a grade */}
      <aside className="hidden lg:block w-60 shrink-0 h-full">
        <TeamSelectionPreview variant="sidebar" maxTeam={maxTeam} action={action} />
      </aside>
    </div>
  );
}
