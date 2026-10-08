import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { aftrapVan, resultaat } from '../../lib/matchen'
import { naamVan, telPerSpeler } from '../../lib/spelers'
import type { Match, Resultaat } from '../../types'
import { ThuisUitIcoon } from '../ThuisUitIcoon'
import { AgendaKnop } from './AgendaKnop'
import { TegenstanderBadge } from './TegenstanderBadge'

const randKleur: Record<Resultaat, string> = {
  W: 'border-winst',
  G: 'border-gelijk',
  V: 'border-red-600',
}
const resultaatWoord: Record<Resultaat, string> = { W: 'gewonnen', G: 'gelijkspel', V: 'verloren' }

/** Dag groot, maand klein – zoals een scheurkalender. Zonder datum tonen we een vraagteken. */
export function DatumBlok({ datum }: { datum: Date | null }) {
  if (!datum) {
    return (
      <div className="flex w-11 shrink-0 flex-col items-center justify-center self-stretch rounded-lg bg-navy-950/70 py-1">
        <span className="font-display text-2xl text-white/60" aria-label="Datum onbekend">?</span>
      </div>
    )
  }
  const maand = datum.toLocaleDateString('nl-BE', { month: 'short' }).replace('.', '')
  const weekdag = datum.toLocaleDateString('nl-BE', { weekday: 'short' }).replace('.', '')
  return (
    <div className="flex w-11 shrink-0 flex-col items-center rounded-lg bg-navy-950/70 py-1 leading-none">
      <span className="text-[10px] text-white/50">{weekdag}</span>
      <span className="font-display text-2xl">{datum.getDate()}</span>
      <span className="text-[10px] text-white/60">{maand}</span>
    </div>
  )
}

/** Lijstje "J. Van Looy ×4" voor doelpunten of assists. */
function SpelerTelling({ titel, nummers }: { titel: string; nummers: (number | null | undefined)[] }) {
  const telling = telPerSpeler(nummers)
  return (
    <div>
      <h4 className="text-xs font-semibold text-orange-400">{titel}</h4>
      {telling.length === 0 ? (
        <p className="mt-1 text-sm text-white/50">Geen</p>
      ) : (
        <ul className="mt-1 space-y-0.5 text-sm">
          {telling.map(({ nummer, aantal }) => (
            <li key={nummer}>
              <span className="mr-1.5 font-display text-white/50">#{nummer}</span>
              {naamVan(nummer)}
              {aantal > 1 && <span className="ml-1 text-white/60">×{aantal}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/**
 * Eén match in de kalender. Gespeeld: score + gekleurde rand, klikbaar om doelpunten te tonen.
 * Komend: knop om hem in je agenda te zetten. `index` zorgt voor het gestaggerd inschuiven.
 */
export function MatchRij({ match, index }: { match: Match; index: number }) {
  const [open, setOpen] = useState(false)
  const r = resultaat(match)
  const detailId = `detail-${match.datum ?? match.tegenstander}`

  const inhoud: ReactNode = (
    <>
      <DatumBlok datum={aftrapVan(match)} />
      <TegenstanderBadge naam={match.tegenstander} />
      <div className="min-w-0 flex-1">
        <p className="font-display text-lg leading-tight text-balance uppercase sm:text-xl">{match.tegenstander}</p>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-white/70">
          <ThuisUitIcoon thuis={match.thuis} className={`size-3.5 ${match.thuis ? 'text-red-600' : 'text-white/70'}`} />
          {match.uur}
          <span className="truncate text-white/50">{match.locatie}</span>
        </p>
      </div>
    </>
  )

  return (
    <motion.li
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className={`overflow-hidden rounded-xl border-l-4 bg-navy-900/80 ring-1 ring-white/10 ${
        r ? randKleur[r] : 'border-royal-700'
      }`}
    >
      {r && match.uitslag ? (
        <>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls={detailId}
            className="flex w-full items-center gap-3 p-3 text-left transition hover:bg-white/5 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-orange-400"
          >
            {inhoud}
            <span className="font-display text-3xl tabular-nums" aria-label={`${match.uitslag.wij}–${match.uitslag.zij}, ${resultaatWoord[r]}`}>
              {match.uitslag.wij}–{match.uitslag.zij}
            </span>
            <motion.svg
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"
              className="size-4 shrink-0 text-white/50"
              animate={{ rotate: open ? 180 : 0 }}
            >
              <path d="m6 9 6 6 6-6" />
            </motion.svg>
          </button>
          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                id={detailId}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-4 border-t border-white/10 px-3 py-3 sm:pl-[7.5rem]">
                  <SpelerTelling titel="Doelpunten" nummers={(match.doelpunten ?? []).map((d) => d.speler)} />
                  <SpelerTelling titel="Assists" nummers={(match.doelpunten ?? []).map((d) => d.assist)} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 p-3">
          {inhoud}
          <div className="w-full pl-[6.75rem] sm:w-auto sm:pl-0">
            <AgendaKnop match={match} />
          </div>
        </div>
      )}
    </motion.li>
  )
}
