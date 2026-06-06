import { create } from "zustand";

interface BattleSessionStore {
  isActive: boolean;
  surrender: (() => void) | null;
  modalOpen: boolean;
  pendingAction: (() => void) | null;
  setSession: (active: boolean, surrender?: () => void) => void;
  openSurrenderModal: (afterSurrender?: () => void) => void;
  closeSurrenderModal: () => void;
  confirmSurrender: () => void;
}

export const useBattleSessionStore = create<BattleSessionStore>((set, get) => ({
  isActive: false,
  surrender: null,
  modalOpen: false,
  pendingAction: null,
  setSession: (active, surrender) => {
    set({
      isActive: active,
      surrender: active ? (surrender ?? null) : null,
      ...(!active ? { modalOpen: false, pendingAction: null } : {}),
    });
  },
  openSurrenderModal: (afterSurrender) => {
    set({ modalOpen: true, pendingAction: afterSurrender ?? null });
  },
  closeSurrenderModal: () => {
    set({ modalOpen: false, pendingAction: null });
  },
  confirmSurrender: () => {
    const { surrender, pendingAction } = get();
    if (surrender) surrender();
    set({ isActive: false, surrender: null, modalOpen: false, pendingAction: null });
    pendingAction?.();
  },
}));
