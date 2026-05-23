"use client";

import { useState } from "react";
import { Bookmark, Trash2 } from "lucide-react";
import { useEconomyStore } from "@/stores/economy-store";
import { useGymStore } from "@/stores/gym-store";
import { AnimatedButton } from "@/components/ui/AnimatedButton";

export function SavedTeamsPanel() {
  const team = useEconomyStore((s) => s.team);
  const setTeam = useEconomyStore((s) => s.setTeam);
  const savedTeams = useGymStore((s) => s.savedTeams);
  const saveTeam = useGymStore((s) => s.saveTeam);
  const deleteSavedTeam = useGymStore((s) => s.deleteSavedTeam);
  const [name, setName] = useState("");

  return (
    <div className="glass-card p-3 space-y-2">
      <p className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Times salvos</p>
      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome do preset..."
          className="flex-1 text-xs px-2 py-1.5 rounded-lg bg-white/5 border border-white/10"
        />
        <AnimatedButton
          variant="secondary"
          size="sm"
          disabled={!name.trim() || team.length < 3}
          onClick={() => {
            saveTeam(name.trim(), team);
            setName("");
          }}
          icon={<Bookmark className="w-3 h-3" />}
        >
          Salvar
        </AnimatedButton>
      </div>
      {savedTeams.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {savedTeams.map((t) => (
            <div key={t.id} className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setTeam(t.pokemonIds)}
                className="text-[10px] px-2 py-1 rounded-lg bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 hover:bg-indigo-500/30"
              >
                {t.name}
              </button>
              <button type="button" onClick={() => deleteSavedTeam(t.id)} className="text-white/30 hover:text-red-400">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
