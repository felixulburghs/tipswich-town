import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { animate, useInView, useReducedMotion } from 'framer-motion'
import { naamDelen, topschutters } from '../../lib/spelers'
import { SpelerFoto } from './SpelerFoto'

/**
 * Getal dat van 0 naar `waarde` optelt zodra het in beeld komt.
 * We schrijven rechtstreeks in de tekst van het element (geen state), dat is lichter.
 */
function Teller({ waarde }: { waarde: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inBeeld = useInView(ref, { once: true })
  const minderBeweging = useReducedMotion()

  useEffect(() => {
    if (!inBeeld || minderBeweging || !ref.current) return
    const el = ref.current
    const telling = animate(0, waarde, {
      duration: 1.2,
      ease: 'easeOut',
      onUpdate: (v) => (el.textContent = String(Math.round(v))),
    })
    return () => telling.stop()
  }, [inBeeld, minderBeweging, waarde])

  return <span ref={ref}>{minderBeweging ? waarde : 0}</span>
}

// Podiumvolgorde: 2e links, 1e in het midden, 3e rechts
const plaatsen = [
  { index: 1, hoogte: 'h-20 sm:h-24', kleur: 'bg-royal-700' },
  { index: 0, hoogte: 'h-28 sm:h-32', kleur: 'bg-red-600' },
  { index: 2, hoogte: 'h-14 sm:h-16', kleur: 'bg-navy-900' },
]

/** Top 3 schutters als podium, berekend uit matchen.json. */
export function TopschuttersPodium() {
  const top = topschutters(3)
  if (top.length === 0) return null

  return (
    <ol className="grid grid-cols-3 items-end gap-2 sm:gap-4">
      {plaatsen.map(({ index, hoogte, kleur }) => {
        const s = top[index]
        if (!s) return <li key={index} />
        const { achternaam } = naamDelen(s.speler)
        return (
          <li key={s.speler.nummer} className="flex flex-col items-center text-center">
            <Link to={`/spelers/${s.speler.nummer}`} className="group flex flex-col items-center">
              <SpelerFoto
                foto={s.speler.foto}
                alt=""
                className="size-14 overflow-hidden rounded-full bg-navy-900 ring-2 ring-white/20 transition group-hover:ring-orange-400 sm:size-20"
              />
              <span className="mt-2 font-display text-base leading-tight uppercase group-hover:text-orange-400 sm:text-xl">
                {achternaam}
              </span>
              <span className="text-xs text-white/60">#{s.speler.nummer}</span>
            </Link>
            <div className={`mt-2 flex w-full flex-col items-center justify-start rounded-t-lg pt-2 ${hoogte} ${kleur}`}>
              <span className="font-display text-3xl leading-none sm:text-4xl">
                <Teller waarde={s.goals} />
              </span>
              <span className="text-xs text-white/70">{s.goals === 1 ? 'goal' : 'goals'}</span>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
