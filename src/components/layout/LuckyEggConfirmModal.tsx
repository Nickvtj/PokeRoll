"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { LUCKY_EGG_SPRITE } from "@/data/item-sprites";
import { LUCKY_EGG_DURATION_MS } from "@/data/economy-balance";
import { ItemSprite } from "@/components/ui/ItemSprite";
import { AnimatedButton } from "@/components/ui/AnimatedButton";

interface LuckyEggConfirmModalProps {
  open: boolean;
  count: number;
  onConfirm: () => void;
  onClose: () => void;
}

const DURATION_MIN = Math.round(LUCKY_EGG_DURATION_MS / 60000);

export function LuckyEggConfirmModal({
  open,
  count,
  onConfirm,
  onClose,
}: LuckyEggConfirmModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!mounted) return null;

  const modal = (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ width: "100vw", height: "100dvh" }}
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/75 backdrop-blur-md" />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-[min(92vw,380px)] rounded-2xl overflow-hidden border border-amber-400/30 bg-gradient-to-br from-slate-900 via-amber-950/30 to-slate-900 p-5 shadow-2xl shadow-amber-500/10"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-white/50" />
            </button>

            <div className="flex flex-col items-center text-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-amber-400/20 blur-xl rounded-full" />
                <ItemSprite src={LUCKY_EGG_SPRITE} alt="Lucky Egg" size={56} className="relative" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  Ativar Lucky Egg?
                </h3>
                <p className="text-sm text-white/55 leading-relaxed">
                  Você tem <span className="text-amber-300 font-semibold">{count}</span> no
                  inventário. Ao ativar, ganha{" "}
                  <span className="text-amber-300 font-semibold">2× XP</span> em batalhas e
                  minigames por{" "}
                  <span className="text-amber-300 font-semibold">{DURATION_MIN} minutos</span>.
                  Consome 1 unidade.
                </p>
              </div>

              <div className="flex gap-2 w-full pt-1">
                <AnimatedButton variant="ghost" size="md" className="flex-1" onClick={onClose}>
                  Cancelar
                </AnimatedButton>
                <AnimatedButton
                  variant="gold"
                  size="md"
                  className="flex-1"
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                >
                  Ativar
                </AnimatedButton>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modal, document.body);
}
