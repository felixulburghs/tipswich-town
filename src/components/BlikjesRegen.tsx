import { useEffect, useRef, useState } from 'react'
import { animate, motion, useReducedMotion } from 'framer-motion'

/** sessionStorage-sleutel: de regen speelt één keer per sessie. */
export const REGEN_GEZIEN = 'toutbien-drop-gezien'

/** Heeft deze bezoeker de regen deze sessie al gezien? (App beslist zo of de regen komt.) */
export function regenAlGezien() {
  try {
    return sessionStorage.getItem(REGEN_GEZIEN) === '1'
  } catch {
    return false
  }
}

const RAND = 140 // px: hoogte van de penseelrand onderaan het rode scherm
const TEGEL = 600 // px: breedte van één stuk penseelrand (herhaalt zich over de breedte)

// Penseelrand voor de onderkant: bovenaan dicht, onderaan een rafelige streek met een paar losse haren.
// Links en rechts op dezelfde hoogte, zodat de stukken naadloos aan elkaar sluiten.
const PENSEEL = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${TEGEL} ${RAND}' preserveAspectRatio='none'><path d='M0 0H600V58C560 72 528 50 488 66S418 94 378 70 300 46 250 74 168 98 120 72 48 54 0 58Z'/><path d='M150 80h64l-6 5h-52zM392 78h76l-7 4h-62zM520 70h48l-5 4h-38z'/></svg>`,
)}")`
const VOL = 'linear-gradient(#000, #000)'

/** Middelpunt van een element op het scherm. */
const midden = (r: DOMRect) => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 })
const doel = (naam: string) => document.querySelector<HTMLElement>(`[data-hand="${naam}"]`)
/** Een Framer-animatie als gewone Promise (zodat Promise.all kan wachten tot alles klaar is). */
const klaarMet = (animatie: { then(klaar: () => void): unknown }) => new Promise<void>((klaar) => animatie.then(klaar))

/**
 * Showpiece 1, de blikjesregen. Tot 2,2 s: titel slaat in, drie blikjes, stortbui, stapel ligt stil.
 * Dan gaat de regen over in de pagina, zonder één harde knip (± 1,1 s, bij overslaan dubbel zo snel):
 * 1. 0–150 ms: een laatste blikje knalt op de stapel, het scherm schokt, de stapel veert in
 * 2. 100–600 ms: de vloer valt van links naar rechts weg, alle blikjes vallen uit beeld
 * 3. 250–850 ms: het rode scherm trekt omhoog weg, met een rafelige penseelrand onderaan
 * 4. 250–850 ms: de × uit de titel vliegt naar de × tussen schild en logo; de woorden krimpen naar
 *    het schild en het logo toe
 * 5. vanaf 500 ms: de pagina eronder komt in een cascade binnen (intrede.ts)
 * Lagen van achter naar voor: rood scherm, kleine wazige blikjes, natuurkunde-blikjes, titel, reuzenblikjes.
 */
export function BlikjesRegen({ vrij, kruisGeland }: { vrij: () => void; kruisGeland: () => void }) {
  const [zichtbaar, setZichtbaar] = useState(true)
  const [weg, setWeg] = useState(0) // 0 = nog niet; anders de snelheid van de uitgang (1, of 2 bij overslaan)
  const minderBeweging = useReducedMotion() ?? false
  const scherm = useRef<HTMLDivElement>(null)
  const paneel = useRef<HTMLDivElement>(null)
  const titel = useRef<HTMLSpanElement>(null)
  const links = useRef<HTMLSpanElement>(null)
  const kruis = useRef<HTMLSpanElement>(null)
  const kruisRood = useRef<HTMLSpanElement>(null)
  const rechts = useRef<HTMLSpanElement>(null)
  const achter = useRef<HTMLCanvasElement>(null)
  const middenLaag = useRef<HTMLCanvasElement>(null)
  const voor = useRef<HTMLCanvasElement>(null)
  const knop = useRef<HTMLButtonElement>(null)
  const regen = useRef<{
    laatVallen(o?: { spreiding?: number; snel?: number }): void
    slamBlik(): void
    stop(): void
  } | null>(null)
  const vertrokken = useRef(false) // ref i.p.v. state: timers en listeners zien zo altijd de actuele waarde
  const klaar = useRef({ beeld: false, leeg: false })
  const tik = useRef({ x: 0, y: 0, t: 0 })
  const begon = useRef(performance.now()) // het moment dat de titel verschijnt

  /** Pas weg als alle animaties klaar zijn én er geen blikje meer in beeld is: zo knipt er nooit iets weg. */
  function sluitAlsKlaar() {
    if (klaar.current.beeld && klaar.current.leeg) setZichtbaar(false)
  }

  function vertrek(snel: number) {
    if (vertrokken.current) return
    vertrokken.current = true

    // Minder beweging: enkel een overvloeier van 250 ms, de pagina staat er al
    if (minderBeweging) {
      vrij()
      kruisGeland()
      animate(scherm.current!, { opacity: 0 }, { duration: 0.25 }).then(() => setZichtbaar(false))
      return
    }

    setWeg(snel)
    const s = (ms: number) => ms / snel / 1000 // ms in de tijdlijn → seconden, op de juiste snelheid
    const r = regen.current

    // 1. Anticipatie: een laatste blikje knalt op de stapel
    r?.slamBlik()

    // 2. De vloer valt weg, van links naar rechts (Android: een tikje trilling, enkel na een eerdere tik)
    setTimeout(() => {
      r?.laatVallen({ spreiding: 150 / snel, snel })
      if (navigator.userActivation?.hasBeenActive) navigator.vibrate?.(15)
    }, 100 / snel)

    // 3. De scheur: het rode scherm trekt omhoog weg; de penseelrand schuift intussen een beetje mee
    const p = paneel.current!
    p.style.animationDuration = `${0.6 / snel}s`
    p.style.animationDelay = `${0.25 / snel}s`
    p.classList.add('penseelrand-beweegt')
    const scheur = animate(
      p,
      { y: -(window.innerHeight + RAND) },
      // gelijkmatig in-uit (zo verdwijnt het rood over ± 6 frames van 100 ms, niet in 2), licht aanzetten en doorschieten
      { delay: s(250), duration: s(600), ease: [0.45, -0.08, 0.45, 1.05] },
    )

    // 4. De titel geeft over aan de pagina: × naar de ×, woorden naar schild en logo
    const vlucht = { delay: s(250), duration: s(600), ease: [0.65, 0, 0.35, 1] as const }
    const stukken: Promise<void>[] = [klaarMet(scheur)]
    const doelKruis = doel('kruis')
    if (kruis.current && doelKruis) {
      const a = midden(kruis.current.getBoundingClientRect())
      const b = midden(doelKruis.getBoundingClientRect())
      const schaal =
        parseFloat(getComputedStyle(doelKruis).fontSize) / parseFloat(getComputedStyle(kruis.current).fontSize)
      stukken.push(
        klaarMet(animate(kruis.current, { x: b.x - a.x, y: b.y - a.y, scale: schaal }, vlucht)).then(kruisGeland),
        klaarMet(animate(kruisRood.current!, { opacity: 1 }, vlucht)), // crème wordt rood, zoals de × op de pagina
      )
    }
    for (const [woord, naam] of [
      [links.current, 'schild'],
      [rechts.current, 'logo'],
    ] as const) {
      const d = doel(naam)
      if (!woord) continue
      if (!d) {
        stukken.push(klaarMet(animate(woord, { opacity: 0 }, vlucht)))
        continue
      }
      const a = woord.getBoundingClientRect()
      const b = d.getBoundingClientRect()
      const v = { x: midden(b).x - midden(a).x, y: midden(b).y - midden(a).y }
      stukken.push(
        klaarMet(animate(woord, { x: v.x, y: v.y, scale: Math.min(1, (b.height / a.height) * 0.5) }, vlucht)),
        klaarMet(animate(woord, { opacity: 0 }, { delay: s(250), duration: s(450), ease: 'easeIn' })),
      )
    }

    // 5. De pagina vangt de overgang op. Op 500 ms: het rood trekt van onder naar boven weg, dus de nav en de
    //    logo's bovenaan komen als laatste vrij; zo zijn ze nog volop aan het binnenkomen als je ze ziet.
    setTimeout(vrij, 500 / snel)

    Promise.all(stukken).then(() => {
      klaar.current.beeld = true
      sluitAlsKlaar()
    })
    // Vangnet: als de natuurkunde nooit "leeg" meldt (bv. niet geladen), toch netjes afsluiten
    setTimeout(() => {
      klaar.current.leeg = true
      sluitAlsKlaar()
    }, 1700 / snel)
  }

  useEffect(() => {
    try {
      sessionStorage.setItem(REGEN_GEZIEN, '1')
    } catch {
      // privévenster zonder opslag: dan zie je de regen gewoon opnieuw
    }
    let gestopt = false
    // Wacht niet eeuwig op trage beelden: na 6 s gaat de uitgang hoe dan ook in
    let timer = setTimeout(() => vertrek(1), 6000)
    // Blikjes al ophalen terwijl de natuurkunde-code nog laadt (de browser bewaart ze voor straks)
    for (const src of ['/sponsors/can-pils.webp', '/sponsors/can-rouge.webp']) new Image().src = src

    import('../lib/blikjes').then(async ({ startBlikjes }) => {
      if (gestopt || !middenLaag.current) return
      const breed = window.innerWidth > 1024
      const r = await startBlikjes({
        canvas: middenLaag.current,
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
          vertrek: () => vertrek(1),
          leeg: () => {
            klaar.current.leeg = true
            sluitAlsKlaar()
          },
        },
      })
      if (gestopt) return r.stop()
      regen.current = r
      if (minderBeweging) {
        clearTimeout(timer)
        timer = setTimeout(() => vertrek(1), 1000)
      }
    })

    // Overslaan: een toets of het scrollwiel (tikken en klikken: zie onPointerUp hieronder)
    const sla = () => vertrek(2)
    window.addEventListener('keydown', sla)
    window.addEventListener('wheel', sla, { passive: true })
    return () => {
      gestopt = true
      clearTimeout(timer)
      window.removeEventListener('keydown', sla)
      window.removeEventListener('wheel', sla)
      regen.current?.stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- één keer starten
  }, [])

  if (!zichtbaar) return null

  return (
    <div
      ref={scherm}
      role="dialog"
      aria-modal="true"
      aria-label="Tipswich Town × Tout Bien"
      className="fixed inset-0 z-[60] overflow-hidden"
      // Een korte tik of klik slaat over; slepen blijft gooien/vegen met de blikjes
      onPointerDown={(e) => (tik.current = { x: e.clientX, y: e.clientY, t: performance.now() })}
      onPointerUp={(e) => {
        const { x, y, t } = tik.current
        if (Math.hypot(e.clientX - x, e.clientY - y) < 10 && performance.now() - t < 350) vertrek(2)
      }}
    >
      {/* Het rode scherm: zachte val van #D61022 in het midden naar #9E0C1E aan de randen
          (de enige verloop in het thema), met een rafelige penseelrand onderaan voor de scheur */}
      <div
        ref={paneel}
        aria-hidden="true"
        className="absolute inset-x-0 top-0"
        style={{
          height: `calc(100% + ${RAND}px)`,
          background: 'radial-gradient(ellipse 85% 60% at 50% 40%, #d61022 35%, #9e0c1e 100%)',
          maskImage: `${VOL}, ${PENSEEL}`,
          WebkitMaskImage: `${VOL}, ${PENSEEL}`,
          maskSize: `100% calc(100% - ${RAND - 1}px), ${TEGEL}px ${RAND}px`,
          WebkitMaskSize: `100% calc(100% - ${RAND - 1}px), ${TEGEL}px ${RAND}px`,
          maskPosition: '0 0, 0 100%',
          WebkitMaskPosition: '0 0, 0 100%',
          maskRepeat: 'no-repeat, repeat-x',
          WebkitMaskRepeat: 'no-repeat, repeat-x',
        }}
      />

      <canvas
        ref={achter}
        aria-hidden="true"
        className="absolute inset-0 h-full w-full [filter:blur(1.5px)_brightness(0.7)]"
      />
      <canvas ref={middenLaag} aria-hidden="true" className="absolute inset-0 h-full w-full touch-none" />

      {/* Titel tussen de natuurkunde-blikjes en de reuzenblikjes; boven de stapel (top 60% blijft vrij) */}
      <div className="pointer-events-none absolute inset-x-0 top-[34%] -translate-y-1/2 px-4">
        <motion.p
          className="text-center font-display text-[11vw] leading-[0.95] text-white uppercase [font-stretch:125%] sm:text-[min(8vw,7.5rem)]"
          initial={minderBeweging ? false : { scale: 2.6, opacity: 0, rotate: -6 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 520, damping: 22, mass: 0.9 }}
        >
          <span ref={titel} className="block">
            {/* Drie regels, zodat de × altijd alleen in het midden staat */}
            <span ref={links} className="block text-balance">
              Tipswich Town
            </span>
            <span className="block">
              <span ref={kruis} className="relative inline-block">
                ×
                <span ref={kruisRood} className="absolute inset-0 text-red-600 opacity-0">
                  ×
                </span>
              </span>
            </span>
            <span ref={rechts} className="block">
              Tout Bien
            </span>
          </span>
        </motion.p>
      </div>

      <canvas
        ref={voor}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full [filter:blur(10px)]"
      />

      <motion.button
        ref={knop}
        type="button"
        onClick={() => vertrek(2)}
        animate={weg ? { opacity: 0, scale: 0.9 } : { opacity: 1, scale: 1 }}
        transition={{ duration: weg ? 0.15 / weg : 0 }}
        className={`absolute bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 rounded-lg bg-white px-5 py-3 font-display text-lg whitespace-nowrap text-red-600 uppercase transition-colors hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white ${weg ? 'pointer-events-none' : ''}`}
      >
        Naar de site
      </motion.button>
    </div>
  )
}
