const colorMap = {
    // ── Brand / semantic colors (defined in @theme) ──────────────────
    primary: {
        bg: "bg-primary/10",
        hover: "hover:bg-primary/30",
    },
    secondary: {
        bg: "bg-secondary/10",
        hover: "hover:bg-secondary/30",
    },
    accent: {
        bg: "bg-accent/10",
        hover: "hover:bg-accent/30",
    },
    success: {
        bg: "bg-success/10",
        hover: "hover:bg-success/30",
    },
    warning: {
        bg: "bg-warning/10",
        hover: "hover:bg-warning/30",
    },
    error: {
        bg: "bg-error/10",
        hover: "hover:bg-error/30",
    },
    info: {
        bg: "bg-info/10",
        hover: "hover:bg-info/30",
    },

    // ── Theme-aware structural colors (defined in :root / .dark) ─────
    background: {
        bg: "bg-background/10",
        hover: "hover:bg-background/30",
    },
    surface: {
        bg: "bg-surface/10",
        hover: "hover:bg-surface/30",
    },
    "surface-elevated": {
        bg: "bg-surface-elevated/10",
        hover: "hover:bg-surface-elevated/30",
    },
    "text-primary": {
        bg: "bg-text-primary/10",
        hover: "hover:bg-text-primary/30",
    },
    "text-secondary": {
        bg: "bg-text-secondary/10",
        hover: "hover:bg-text-secondary/30",
    },
    border: {
        bg: "bg-border/10",
        hover: "hover:bg-border/30",
    },

    // ══════════════════════════════════════════════════════════════════
    //  TAILWIND DEFAULT COLOR PALETTE
    // ══════════════════════════════════════════════════════════════════

    // Neutrals
    slate: {
        bg: "bg-slate-200/10",
        hover: "hover:bg-slate-500/30",
    },
    gray: {
        bg: "bg-gray-200/10",
        hover: "hover:bg-gray-500/30",
    },
    zinc: {
        bg: "bg-zinc-200/10",
        hover: "hover:bg-zinc-500/30",
    },
    neutral: {
        bg: "bg-neutral-200/10",
        hover: "hover:bg-neutral-500/30",
    },
    stone: {
        bg: "bg-stone-200/10",
        hover: "hover:bg-stone-500/30",
    },

    // Reds / Oranges / Yellows
    red: {
        bg: "bg-red-200/10",
        hover: "hover:bg-red-500/30",
    },
    orange: {
        bg: "bg-orange-200/10",
        hover: "hover:bg-orange-500/30",
    },
    amber: {
        bg: "bg-amber-200/10",
        hover: "hover:bg-amber-500/30",
    },
    yellow: {
        bg: "bg-yellow-200/10",
        hover: "hover:bg-yellow-500/30",
    },

    // Greens
    lime: {
        bg: "bg-lime-200/10",
        hover: "hover:bg-lime-500/30",
    },
    green: {
        bg: "bg-green-200/10",
        hover: "hover:bg-green-500/30",
    },
    emerald: {
        bg: "bg-emerald-200/10",
        hover: "hover:bg-emerald-500/30",
    },
    teal: {
        bg: "bg-teal-200/10",
        hover: "hover:bg-teal-500/30",
    },

    // Blues / Cyans
    cyan: {
        bg: "bg-cyan-200/10",
        hover: "hover:bg-cyan-500/30",
    },
    sky: {
        bg: "bg-sky-200/10",
        hover: "hover:bg-sky-500/30",
    },
    blue: {
        bg: "bg-blue-200/10",
        hover: "hover:bg-blue-500/30",
    },
    indigo: {
        bg: "bg-indigo-200/10",
        hover: "hover:bg-indigo-500/30",
    },

    // Purples / Pinks
    violet: {
        bg: "bg-violet-200/10",
        hover: "hover:bg-violet-500/30",
    },
    purple: {
        bg: "bg-purple-200/10",
        hover: "hover:bg-purple-500/30",
    },
    fuchsia: {
        bg: "bg-fuchsia-200/10",
        hover: "hover:bg-fuchsia-500/30",
    },
    pink: {
        bg: "bg-pink-200/10",
        hover: "hover:bg-pink-500/30",
    },
    rose: {
        bg: "bg-rose-200/10",
        hover: "hover:bg-rose-500/30",
    },
};

export default colorMap;