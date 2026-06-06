"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { AnimatedButton } from "@/components/ui/AnimatedButton";

interface BattleSurrenderModalProps {
  open: boolean;
  onStay: () => void;
  onSurrender: () => void;
}

export function BattleSurrenderModal({ open, onStay, onSurrender }: BattleSurrenderModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.92, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, y: 12 }}
            className="w-full max-w-sm rounded-2xl bg-slate-900 ring-1 ring-inset ring-red-500/20 p-5 shadow-2xl"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-bold text-base">Desistir da batalha?</h3>
                <p className="text-xs text-white/50 mt-1 leading-relaxed">
                  Você perderá o progresso desta luta. Fique na batalha ou confirme para sair.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <AnimatedButton variant="secondary" size="sm" className="flex-1" onClick={onStay}>
                Continuar
              </AnimatedButton>
              <AnimatedButton variant="primary" size="sm" className="flex-1" onClick={onSurrender}>
                Desistir
              </AnimatedButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
