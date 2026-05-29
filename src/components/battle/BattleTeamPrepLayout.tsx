"use client";

import { TeamSelectionPreview } from "@/components/battle/TeamSelectionPreview";
import { BATTLE_CLASSIC_THEME } from "@/data/battle-theme";
import { cn } from "@/lib/utils";

interface BattleTeamPrepLayoutProps {
  children: React.ReactNode;
  action: React.ReactNode;
  maxTeam?: number;
  /** Ginásio usa card estreito — só barra horizontal no preview */
  previewLayout?: "responsive" | "bar-only";
}

/** Montagem de time — grid rolável + preview lateral + botão ao lado (desktop) */
export function BattleTeamPrepLayout({
  children,
  action,
  maxTeam = 3,
  previewLayout = "responsive",
}: BattleTeamPrepLayoutProps) {
  const showSidebar = previewLayout === "responsive";

  return (
    <div
      className={cn(
        showSidebar && "battle-prep-with-preview lg:grid lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-4 lg:items-start"
      )}
    >
      <div
        className={cn(
          "battle-prep-shell min-w-0",
          BATTLE_CLASSIC_THEME && "battle-classic-arena p-3 sm:p-4",
          showSidebar && "lg:!max-h-[calc(100dvh-14rem)]"
        )}
      >
        <TeamSelectionPreview
          variant="bar"
          className={cn("mb-1 shrink-0", showSidebar && "lg:hidden")}
          maxTeam={maxTeam}
        />

        <div className="flex flex-col flex-1 min-h-0 gap-3 overflow-hidden">{children}</div>

        <div
          className={cn(
            "battle-prep-footer shrink-0",
            showSidebar && "lg:hidden",
            BATTLE_CLASSIC_THEME && "-mx-3 sm:-mx-4 px-3 sm:px-4 pb-0.5"
          )}
        >
          {action}
        </div>
      </div>

      {showSidebar && (
        <div className="hidden lg:flex flex-col gap-3 sticky top-20 self-start w-full min-w-0 max-h-[calc(100dvh-8rem)]">
          <TeamSelectionPreview variant="sidebar" maxTeam={maxTeam} className="min-h-0 flex-1" />
          <div className="shrink-0 w-full pt-1">{action}</div>
        </div>
      )}
    </div>
  );
}
