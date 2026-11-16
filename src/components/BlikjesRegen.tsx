import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

/** sessionStorage-sleutel: de regen speelt één keer per sessie. */
export const REGEN_GEZIEN = 'toutbien-drop-gezien'

function alGezien() {
  try {
    return sessionStorage.getItem(REGEN_GEZIEN) === '1'
  } catch {
    return false
  }
}

const REGEN_MS = 3000 // hoe lang de blikjes blijven liggen voor de vloer wegvalt
const VAL_MS = 800 // het rode scherm schuift weg en de blikjes vallen uit beeld

/**
 * Showpiece 1, de blikjesregen: een rood scherm, "TIPSWICH TOWN × TOUT BIEN" slaat erin,
 * en blikjes regenen met echte natuurkunde naar beneden. Na ±3 s (of "Naar de site")
 * valt de vloer weg en schuift het rode scherm naar beneden: de homepagina eronder komt tevoorschijn.
 * - De natuurkunde (src/lib/blikjes.ts + matter-js) wordt pas hier met import() geladen.
 * - Minder beweging: één stilstaand beeld, één seconde.
 */
export function BlikjesRegen() {
  const [zichtbaar, setZichtbaar] = useState(() => !alGezien())
  const [valt, setValt] = useState(false)
  const minderBeweging = useReducedMotion() ?? false
  const canvas = useRef<HTMLCanvasElement>(null)
  const regen = useRef<{ laatVallen(): void; stop(): void } | null>(null)
  const gevallen = useRef(false) // ref i.p.v. state: de timers zien zo altijd de actuele waarde

  function naarDeSite() {
    if (gevallen.current) return
    gevallen.current = true
    setValt(true)
    regen.current?.laatVallen()
    setTimeout(() => setZichtbaar(false), minderBeweging ? 0 : VAL_MS)
  }

  useEffect(() => {
    if (!zichtbaar) return
    try {
      sessionStorage.setItem(REGEN_GEZIEN, '1')
    } catch {
      // privévenster zonder opslag: dan zie je de regen gewoon opnieuw
    }
    let gestopt = false
    const gsm = window.matchMedia('(max-width: 639px), (pointer: coarse)').matches
    // Wacht niet eeuwig op trage beelden: na 5 s gaat het scherm hoe dan ook weg
    let timer = setTimeout(naarDeSite, 5000)

    import('../lib/blikjes').then(async ({ startBlikjes }) => {
      if (gestopt || !canvas.current) return
      const r = await startBlikjes({
        canvas: canvas.current,
        aantal: gsm ? 18 : 45,
        breedte: gsm ? 90 : 120,
        rougeKans: 0.25,
        regenDuurMs: 1600,
        interactief: true,
        stil: minderBeweging,
      })
      if (gestopt) return r.stop()
      regen.current = r
      clearTimeout(timer)
      timer = setTimeout(naarDeSite, minderBeweging ? 1000 : REGEN_MS)
    })

    const opToets = (e: KeyboardEvent) => e.key === 'Escape' && naarDeSite()
    window.addEventListener('keydown', opToets)
    return () => {
      gestopt = true
      clearTimeout(timer)
      window.removeEventListener('keydown', opToets)
      regen.current?.stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- één keer starten
  }, [zichtbaar])

  if (!zichtbaar) return null
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Tipswich Town × Tout Bien"
      className="fixed inset-0 z-[60] overflow-hidden"
    >
      {/* Het rode scherm met de titel; schuift naar beneden weg als de vloer wegvalt */}
      <motion.div
        className="absolute inset-0 grid place-items-center bg-red-600 px-4"
        animate={{ y: valt && !minderBeweging ? '100%' : 0 }}
        transition={{ duration: VAL_MS / 1000, ease: [0.55, 0, 0.9, 0.4] }}
      >
        <motion.p
          className="max-w-[14ch] text-center font-display text-[11vw] leading-[0.9] text-balance text-white uppercase sm:text-[min(8vw,7.5rem)]"
          initial={minderBeweging ? false : { scale: 2.6, opacity: 0, rotate: -6 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 520, damping: 22, mass: 0.9 }}
        >
          Tipswich Town × Tout Bien
        </motion.p>
      </motion.div>

      <canvas ref={canvas} aria-hidden="true" className="absolute inset-0 h-full w-full touch-none" />

      {!valt && (
        <button
          type="button"
          onClick={naarDeSite}
          className="absolute bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 rounded-lg bg-white px-5 py-3 font-display text-lg text-red-600 uppercase transition hover:bg-white/90 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          Naar de site
        </button>
      )}
    </div>
  )
}
