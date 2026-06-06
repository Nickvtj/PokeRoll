"use client";

import { BattleSurrenderModal } from "@/components/battle/BattleSurrenderModal";
import { useBattleSessionStore } from "@/stores/battle-session-store";

export function BattleSurrenderGuard() {
  const modalOpen = useBattleSessionStore((s) => s.modalOpen);
  const closeSurrenderModal = useBattleSessionStore((s) => s.closeSurrenderModal);
  const confirmSurrender = useBattleSessionStore((s) => s.confirmSurrender);

  return (
    <BattleSurrenderModal
      open={modalOpen}
      onStay={closeSurrenderModal}
      onSurrender={confirmSurrender}
    />
  );
}
