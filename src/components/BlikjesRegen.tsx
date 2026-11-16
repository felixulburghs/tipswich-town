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

const VEEG_MS = 700 // het rode scherm veegt weg
const RAND = 140 // px: hoogte van de penseelrand bovenaan het rode scherm

// Penseelrand: onderaan dicht, bovenaan een rafelige streek met een paar losse haren
const PENSEEL = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 140' preserveAspectRatio='none'><path d='M0 140V74C70 50 120 86 190 62S310 34 370 68 450 96 520 60 640 30 700 64 800 92 860 56 980 26 1040 62 1130 90 1200 52V140Z'/><path d='M150 54h120l-10 5H160zM560 44h150l-14 4H570zM930 34h110l-9 5H938z'/></svg>`,
)}")`
const LINEAAL = 'linear-gradient(#000, #000)'

/**
 * Showpiece 1, de blikjesregen (± 3,5 s):
 * 0,0 s titel slaat in · 0,5 s drie blikjes · 0,9 s stortbui in golven · 2,2 s stapel ligt stil
 * · 3,0 s vloer weg, blikjes vallen, het rode scherm veegt weg met een penseelrand.
 * Lagen van achter naar voor: rood scherm, kleine wazige blikjes, natuurkunde-blikjes, titel, reuzenblikjes.
 * De natuurkunde (src/lib/blikjes.ts + matter-js) wordt pas hier geladen met import().
 */
export function BlikjesRegen() {
  const [zichtbaar, setZichtbaar] = useState(() => !alGezien())
  const [valt, setValt] = useState(false)
  const minderBeweging = useReducedMotion() ?? false
  const scherm = useRef<HTMLDivElement>(null)
  const titel = useRef<HTMLSpanElement>(null)
  const achter = useRef<HTMLCanvasElement>(null)
  const midden = useRef<HTMLCanvasElement>(null)
  const voor = useRef<HTMLCanvasElement>(null)
  const knop = useRef<HTMLButtonElement>(null)
  const regen = useRef<{ laatVallen(): void; stop(): void } | null>(null)
  const gevallen = useRef(false) // ref i.p.v. state: de timers zien zo altijd de actuele waarde
  const begon = useRef(performance.now())

  function naarDeSite() {
    if (gevallen.current) return
    gevallen.current = true
    setValt(true)
    regen.current?.laatVallen()
    setTimeout(() => setZichtbaar(false), minderBeweging ? 0 : VEEG_MS + 150)
  }

  useEffect(() => {
    if (!zichtbaar) return
    try {
      sessionStorage.setItem(REGEN_GEZIEN, '1')
    } catch {
      // privévenster zonder opslag: dan zie je de regen gewoon opnieuw
    }
    let gestopt = false
    // Wacht niet eeuwig op trage beelden: na 6 s gaat het scherm hoe dan ook weg
    let timer = setTimeout(naarDeSite, 6000)
    // Blikjes al ophalen terwijl de natuurkunde-code nog laadt (de browser bewaart ze voor straks)
    for (const src of ['/sponsors/can-pils.png', '/sponsors/can-rouge.png']) new Image().src = src

    import('../lib/blikjes').then(async ({ startBlikjes }) => {
      if (gestopt || !midden.current) return
      const breed = window.innerWidth > 1024
      const r = await startBlikjes({
        canvas: midden.current,
        achterCanvas: achter.current ?? undefined,
        voorCanvas: voor.current ?? undefined,
        rougeKans: 0.25,
        // Brede schermen: stapel tot 50% en geen gaten op de vloer; gsm: 40%
        stapelGrens: breed ? 0.5 : 0.4,
        vulGaten: breed,
        // De knop is een vast blok: blikjes botsen ertegen en stapelen errond, hij blijft zichtbaar en tikbaar
        obstakels: knop.current ? [knop.current] : [],
        sceneTijd: performance.now() - begon.current,
        interactief: true,
        stil: minderBeweging,
        schudElement: scherm.current ?? undefined,
        bij: {
          // De titel krijgt een duwtje als het eerste blikje de vloer raakt
          eersteLanding: () =>
            titel.current?.animate(
              [{ transform: 'none' }, { transform: 'translateY(-7px) rotate(-1.2deg)' }, { transform: 'none' }],
              { duration: 260, easing: 'ease-out' },
            ),
          vloerWeg: naarDeSite,
        },
      })
      if (gestopt) return r.stop()
      regen.current = r
      if (minderBeweging) {
        clearTimeout(timer)
        timer = setTimeout(naarDeSite, 1000)
      }
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
  // Rood scherm en titel schuiven samen even ver weg, zodat de titel altijd op het rood blijft
  const weg = valt && !minderBeweging ? window.innerHeight + RAND : 0
  const veeg = { duration: VEEG_MS / 1000, ease: [0.6, 0, 0.85, 0.45] as const }

  return (
    <div
      ref={scherm}
      role="dialog"
      aria-modal="true"
      aria-label="Tipswich Town × Tout Bien"
      className="fixed inset-0 z-[60] overflow-hidden"
    >
      {/* Het rode scherm: zachte val van #D61022 in het midden naar #9E0C1E aan de randen
          (de enige verloop in het thema), met een penseelrand bovenaan voor de veeg */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0"
        style={{
          top: -RAND,
          background: 'radial-gradient(ellipse 85% 70% at 50% 45%, #d61022 35%, #9e0c1e 100%)',
          maskImage: `${PENSEEL}, ${LINEAAL}`,
          WebkitMaskImage: `${PENSEEL}, ${LINEAAL}`,
          maskSize: `100% ${RAND}px, 100% calc(100% - ${RAND - 1}px)`,
          WebkitMaskSize: `100% ${RAND}px, 100% calc(100% - ${RAND - 1}px)`,
          maskPosition: 'top, bottom',
          WebkitMaskPosition: 'top, bottom',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
        }}
        animate={{ y: weg }}
        transition={veeg}
      />

      <canvas
        ref={achter}
        aria-hidden="true"
        className={`absolute inset-0 h-full w-full [filter:blur(1.5px)_brightness(0.7)] transition-opacity duration-300 ${valt ? 'opacity-0' : ''}`}
      />
      <canvas ref={midden} aria-hidden="true" className="absolute inset-0 h-full w-full touch-none" />

      {/* Titel tussen de natuurkunde-blikjes en de reuzenblikjes; boven de stapel (top 60% blijft vrij) */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-[34%] -translate-y-1/2 px-4"
        animate={{ y: weg }}
        transition={veeg}
      >
        <motion.p
          className="text-center font-display text-[11vw] leading-[0.95] text-white uppercase sm:text-[min(8vw,7.5rem)]"
          initial={minderBeweging ? false : { scale: 2.6, opacity: 0, rotate: -6 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 520, damping: 22, mass: 0.9 }}
        >
          <span ref={titel} className="block">
            {/* Drie regels, zodat de × altijd alleen in het midden staat */}
            <span className="block text-balance">Tipswich Town</span>
            <span className="block">×</span>
            <span className="block">Tout Bien</span>
          </span>
        </motion.p>
      </motion.div>

      <canvas
        ref={voor}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full [filter:blur(10px)]"
      />

      {!valt && (
        <button
          ref={knop}
          type="button"
          onClick={naarDeSite}
          className="absolute bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 rounded-lg bg-white px-5 py-3 font-display text-lg whitespace-nowrap text-red-600 uppercase transition hover:bg-white/90 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          Naar de site
        </button>
      )}
    </div>
  )
}
