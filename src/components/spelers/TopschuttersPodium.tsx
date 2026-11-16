import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { animate, motion, useInView, useReducedMotion } from 'framer-motion'
import { SPONSOR_TAKEOVER } from '../../config'
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

/**
 * Tijdens de takeover: één klein Pils-blikje per goal, gestapeld boven het podium.
 * Ze vallen op hun plaats zodra het podium in beeld komt (whileInView), het ene na het andere.
 * Rijen van 4, van onder naar boven gevuld (flex-wrap-reverse), zodat het echt een stapel is.
 */
function BlikjesStapel({ aantal }: { aantal: number }) {
  return (
    <div
      aria-hidden="true"
      className="mt-2 flex w-full max-w-[5.5rem] flex-wrap-reverse justify-center gap-0.5 sm:max-w-28"
    >
      {Array.from({ length: aantal }, (_, i) => (
        <motion.img
          key={i}
          src="/sponsors/can-pils-klein.webp" // 72 px brede kopie: hier is een blikje maar ±20 px breed
          alt=""
          width={72}
          height={128}
          loading="lazy"
          decoding="async"
          className="h-8 w-auto sm:h-10"
          initial={{ y: -160, opacity: 0, rotate: i % 2 ? 25 : -25 }}
          whileInView={{ y: 0, opacity: 1, rotate: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ delay: i * 0.07, type: 'spring', stiffness: 420, damping: 18 }}
        />
      ))}
    </div>
  )
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
                zonderFoto="logo"
                className="size-14 overflow-hidden rounded-full bg-navy-900 ring-2 ring-tekst/20 transition group-hover:ring-orange-400 sm:size-20"
              />
              <span className="mt-2 font-display text-base leading-tight uppercase group-hover:text-orange-400 sm:text-xl">
                {achternaam}
              </span>
              <span className="text-xs text-tekst-zacht">#{s.speler.nummer}</span>
            </Link>
            {SPONSOR_TAKEOVER && <BlikjesStapel aantal={s.goals} />}
            <div
              className={`mt-2 flex w-full flex-col items-center justify-start rounded-t-lg pt-2 ${hoogte} ${kleur}`}
            >
              <span className="font-display text-3xl leading-none sm:text-4xl">
                <Teller waarde={s.goals} />
              </span>
              <span className="text-xs text-tekst/70 toutbien:text-tekst">{s.goals === 1 ? 'goal' : 'goals'}</span>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
