import { AnimatePresence, motion } from 'framer-motion'
import type { Match } from '../types'
import { aftrapVan, datumTekst } from '../lib/matchen'
import { useNu } from '../lib/nu'
import { ThuisUitIcoon } from './ThuisUitIcoon'

function splitsTijd(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000))
  return {
    dagen: Math.floor(s / 86400),
    uren: Math.floor((s % 86400) / 3600),
    min: Math.floor((s % 3600) / 60),
    sec: s % 60,
  }
}

/**
 * Eén vakje van de countdown; het getal schuift naar beneden weg als het verandert.
 * waarde null: nog geen echte tijd (voorgerenderde HTML), dan blijft het vakje leeg.
 */
function Vakje({ waarde, label }: { waarde: number | null; label: string }) {
  const tekst = String(waarde).padStart(2, '0')
  return (
    <div className="flex flex-col items-center rounded-lg bg-navy-950/70 px-2 py-3 ring-1 ring-royal-500/40">
      <div className="relative h-10 w-full overflow-hidden sm:h-14">
        {waarde !== null && (
          <AnimatePresence initial={false}>
            <motion.span
              key={tekst}
              initial={{ y: '-100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="absolute inset-0 text-center font-display text-4xl tabular-nums sm:text-5xl"
            >
              {tekst}
            </motion.span>
          </AnimatePresence>
        )}
      </div>
      <span className="mt-1 text-xs text-tekst-zacht">{label}</span>
    </div>
  )
}

/** eigenIntrede={false}: niet zelf binnenkomen (de takeover-hero regelt dat in zijn cascade). */
export function Countdown({ match, eigenIntrede = true }: { match: Match; eigenIntrede?: boolean }) {
  // De cijfers pas tonen met de echte tijd: in de voorgerenderde HTML zou anders de tijd van de build staan
  const { tijd, echt } = useNu(true)
  const t = splitsTijd(aftrapVan(match)!.getTime() - tijd.getTime()) // volgendeMatch() heeft altijd een datum
  const { dagen, uren, min, sec } = echt ? t : { dagen: null, uren: null, min: null, sec: null }

  return (
    <motion.section
      aria-labelledby="volgende-match"
      initial={eigenIntrede ? { opacity: 0, y: 24 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="w-full max-w-md text-left rounded-2xl bg-gradient-to-br from-royal-700 to-navy-900 p-5 shadow-2xl shadow-royal-500/20 ring-1 ring-lijn"
    >
      <div className="flex items-center gap-2">
        <span
          className={`grid size-8 shrink-0 place-items-center rounded-full toutbien:text-white ${
            match.thuis ? 'bg-red-600' : 'bg-royal-500'
          }`}
        >
          <ThuisUitIcoon thuis={match.thuis} className="size-4" />
        </span>
        <h2 id="volgende-match" className="text-sm font-semibold text-orange-400">
          Volgende match, {match.thuis ? 'thuis' : 'uit'}
        </h2>
      </div>

      <p className="mt-3 font-display text-3xl leading-none text-balance uppercase sm:text-4xl toutbien:[font-stretch:125%]">
        {match.tegenstander}
      </p>

      <p className="mt-2 text-sm text-tekst/80">{datumTekst(match)}</p>
      <p className="text-sm text-tekst-zacht">{match.locatie}</p>

      <div className="mt-4 grid grid-cols-4 gap-2" role="timer" aria-live="off">
        <Vakje waarde={dagen} label="dagen" />
        <Vakje waarde={uren} label="uren" />
        <Vakje waarde={min} label="min" />
        <Vakje waarde={sec} label="sec" />
      </div>
    </motion.section>
  )
}
