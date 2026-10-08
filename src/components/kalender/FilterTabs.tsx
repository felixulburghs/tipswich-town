import { motion } from 'framer-motion'

export const filters = ['Alles', 'Komend', 'Gespeeld', 'Thuis', 'Uit'] as const
export type Filter = (typeof filters)[number]

/**
 * Tabs om de matchlijst te filteren. De rode onderlijn is één element met layoutId:
 * Motion ziet dat hij van tab verandert en laat hem er vloeiend naartoe schuiven.
 */
export function FilterTabs({ actief, kies }: { actief: Filter; kies: (f: Filter) => void }) {
  return (
    <div role="tablist" aria-label="Matchen filteren" className="flex gap-0.5 overflow-x-auto [scrollbar-width:none] sm:gap-1">
      {filters.map((f) => (
        <button
          key={f}
          type="button"
          role="tab"
          aria-selected={f === actief}
          onClick={() => kies(f)}
          className={`relative shrink-0 px-2 py-2 font-display text-base tracking-wide uppercase sm:px-3 sm:text-lg transition-colors focus-visible:outline-2 focus-visible:outline-orange-400 ${
            f === actief ? 'text-white' : 'text-white/50 hover:text-white/80'
          }`}
        >
          {f}
          {f === actief && (
            <motion.span
              layoutId="tab-onderlijn"
              className="absolute inset-x-1.5 -bottom-px h-1 rounded-full bg-red-600"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
        </button>
      ))}
    </div>
  )
}
