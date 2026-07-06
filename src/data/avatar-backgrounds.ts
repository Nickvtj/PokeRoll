export interface AvatarBackgroundOption {
  id: string;
  label: string;
  /** Classe de fundo aplicada ao container do avatar */
  bgClass: string;
  /** Cor sólida para o swatch de sele\u00e7\u00e3o */
  swatch: string;
  transparent?: boolean;
}

export const DEFAULT_AVATAR_BG = "purple";

export const AVATAR_BG_OPTIONS: AvatarBackgroundOption[] = [
  {
    id: "purple",
    label: "Roxo",
    bgClass: "bg-gradient-to-br from-indigo-500 to-purple-600",
    swatch: "linear-gradient(135deg, #6366f1, #9333ea)",
  },
  {
    id: "blue",
    label: "Azul",
    bgClass: "bg-gradient-to-br from-sky-500 to-blue-600",
    swatch: "linear-gradient(135deg, #0ea5e9, #2563eb)",
  },
  {
    id: "green",
    label: "Verde",
    bgClass: "bg-gradient-to-br from-emerald-500 to-green-600",
    swatch: "linear-gradient(135deg, #10b981, #16a34a)",
  },
  {
    id: "red",
    label: "Vermelho",
    bgClass: "bg-gradient-to-br from-rose-500 to-red-600",
    swatch: "linear-gradient(135deg, #f43f5e, #dc2626)",
  },
  {
    id: "gold",
    label: "Dourado",
    bgClass: "bg-gradient-to-br from-amber-400 to-yellow-600",
    swatch: "linear-gradient(135deg, #fbbf24, #ca8a04)",
  },
  {
    id: "gray",
    label: "Cinza",
    bgClass: "bg-gradient-to-br from-slate-500 to-slate-700",
    swatch: "linear-gradient(135deg, #64748b, #334155)",
  },
  {
    id: "transparent",
    label: "Transparente",
    bgClass: "bg-transparent",
    swatch:
      "repeating-conic-gradient(#94a3b8 0% 25%, #475569 0% 50%) 50% / 10px 10px",
    transparent: true,
  },
];

export function getAvatarBgOption(id: string | undefined): AvatarBackgroundOption {
  return (
    AVATAR_BG_OPTIONS.find((o) => o.id === id) ??
    AVATAR_BG_OPTIONS[0]
  );
}
