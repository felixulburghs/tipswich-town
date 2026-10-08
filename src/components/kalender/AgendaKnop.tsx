import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { downloadIcs, googleAgendaUrl } from '../../lib/ics'
import type { Match } from '../../types'

const pil =
  'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition focus-visible:outline-2 focus-visible:outline-orange-400'

/**
 * "Zet in mijn agenda": klapt twee keuzes open op dezelfde plek.
 * - Google Agenda: opent Google Agenda met de match al ingevuld (Android, browser, ook iPhone).
 * - Apple / Outlook: downloadt een .ics-bestand dat die apps openen.
 */
export function AgendaKnop({ match }: { match: Match }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex flex-wrap items-center gap-2">
      <AnimatePresence mode="popLayout" initial={false}>
        {!open ? (
          <motion.button
            key="knop"
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded={false}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`${pil} text-white/80 ring-white/25 hover:bg-white/10 hover:text-white`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="size-4">
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M3 10h18M8 3v4M16 3v4M12 13v5M9.5 15.5h5" />
            </svg>
            Zet in mijn agenda
          </motion.button>
        ) : (
          <motion.div
            key="keuzes"
            role="group"
            aria-label={`Agenda kiezen voor ${match.tegenstander}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-wrap items-center gap-2"
          >
            <a
              href={googleAgendaUrl(match)}
              target="_blank"
              rel="noreferrer"
              onClick={() => setOpen(false)}
              className={`${pil} bg-white text-navy-950 ring-white hover:bg-white/90`}
            >
              Google Agenda
            </a>
            <button
              type="button"
              onClick={() => {
                downloadIcs(match)
                setOpen(false)
              }}
              className={`${pil} text-white ring-white/40 hover:bg-white/10`}
            >
              Apple / Outlook
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Sluiten"
              className="grid size-7 place-items-center rounded-full text-white/60 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-orange-400"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true" className="size-3.5">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
