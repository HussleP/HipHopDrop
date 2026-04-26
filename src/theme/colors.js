/**
 * Hot Drop — Blade Runner 2049 color system
 *
 * Warm near-black backgrounds, amber primary accent (Joi's glow / desert dust),
 * electric cyan secondary (holographic displays), warm off-white text.
 */
export const colors = {
  // ── Backgrounds ────────────────────────────────────────────────────────────
  background:   '#0A0907',   // near-black with warm amber undertone
  surface:      '#151210',   // dark warm charcoal for cards / inputs
  surfaceHigh:  '#1F1B16',   // slightly raised surface (modals, highlights)

  // ── Borders ────────────────────────────────────────────────────────────────
  border:       '#2D2520',   // warm dark border

  // ── Primary accent — BR2049 amber/orange (desert dust, Joi hologram) ──────
  accentTeal:   '#E07B0A',   // key kept for compatibility; value is now AMBER

  // ── Text ───────────────────────────────────────────────────────────────────
  textPrimary:  '#EDE8DF',   // warm off-white — not pure white
  textMuted:    '#7A7060',   // warm muted stone

  // ── Tab bar ────────────────────────────────────────────────────────────────
  tabBar:       '#0A0806',
  tabInactive:  '#4A4035',
  tabActive:    '#E07B0A',

  // ── Extended palette ───────────────────────────────────────────────────────
  neon:         '#00C4D4',   // holographic cyan — used for secondary highlights
  neonPink:     '#E8305A',   // neon sign pink — error states, coral
  amber:        '#E07B0A',   // alias for accentTeal
  green:        '#4ade80',   // live / success badges
  purple:       '#a855f7',   // Slayr underground accent (kept)
  teal:         '#00C4D4',   // alias for neon
  coral:        '#E8305A',   // alias for neonPink
  grey:         '#3A3530',
  greyLight:    '#5A5548',
};
