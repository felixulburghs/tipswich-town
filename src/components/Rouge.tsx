import { useEffect, useImperativeHandle, useRef, useState, type Ref } from 'react'
import { animate } from 'framer-motion'

/**
 * "Rouge": de paginaovergang tijdens de takeover. Eén plat getekend vel rood bier (geen simulatie):
 * vooraan een schuimkraag van crème bollen met een inktlijn op de bovenrand, achteraan onze rafelige penseelrand.
 * Het vel veegt in één beweging over het scherm (± 480 ms) en keert nooit om:
 * - 0–200 ms: komt van onder binnen (schuim eerst) tot het scherm vol rood is
 * - 200–240 ms: scherm bedekt, de pagina wisselt (dicht)
 * - 240–480 ms: gaat verder omhoog en verdwijnt boven, penseelrand laatst
 * Terug/vooruit in de geschiedenis: hetzelfde vel, gespiegeld, van boven naar onder.
 *
 * Het vel staat altijd (verborgen) in de HTML en wordt telkens hergebruikt. De verschuiving is één
 * transform via WAAPI: die loopt op de compositor door, ook terwijl React de nieuwe pagina opbouwt.
 */

const ROOD = '#D61022'
const CREME = '#FFF9F2'
const INKT = '#121212'
const BREED = 3000 // viewBox-breedte; met "slice" en vaste hoogte vervormen de bollen nooit (tot 3000 px breed)
const SCHUIM = 90 // px: schuimkraag
const RAND = 100 // px: penseelrand
const DUUR = 480

/** Vaste "willekeur": elke build en elke bezoeker krijgt dezelfde tekening (ook in de voorgerenderde HTML). */
function reeks(zaad: number) {
  let s = zaad
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}

// Schuim: bovenrand = boogjes tussen punten (overlappende cirkels), onderrand = grotere bulten in het rood.
const r0 = reeks(7)
const BOVEN_X = [0]
while (BOVEN_X.at(-1)! < BREED) BOVEN_X.push(BOVEN_X.at(-1)! + 46 + r0() * 58)
const ONDER_X = BOVEN_X.filter((_, i) => i % 2 === 0)
const BOVEN_Y = BOVEN_X.map(() => 36 + r0() * 12)
const ONDER_Y = ONDER_X.map(() => 66 + r0() * 8)

const boog = (x1: number, y1: number, x2: number, y2: number, k: number) => {
  const r = Math.hypot(x2 - x1, y2 - y1) * k // straal ≥ halve koorde, dus altijd een geldige boog
  return `A${r.toFixed(1)} ${r.toFixed(1)} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`
}

/** Drie handgemaakte standen van het schuim: zelfde punten, iets andere hoogtes en bollingen (voor het wiebelen). */
const STANDEN = [0, 1, 2].map((k) => {
  const w = reeks(101 + k * 37)
  const d = (n: number) => (k === 0 ? 0 : (w() - 0.5) * n)
  const boven = BOVEN_Y.map((y) => y + d(9))
  const bolling = BOVEN_X.map(() => 0.56 + (k === 0 ? 0.06 : w() * 0.12))
  const onder = ONDER_Y.map((y) => y + d(8))
  let lijn = `M${BOVEN_X[0]} ${boven[0].toFixed(1)}`
  for (let i = 1; i < BOVEN_X.length; i++) lijn += boog(BOVEN_X[i - 1], boven[i - 1], BOVEN_X[i], boven[i], bolling[i])
  let vlak = `${lijn}L${ONDER_X.at(-1)} ${onder.at(-1)!.toFixed(1)}`
  for (let i = ONDER_X.length - 2; i >= 0; i--) vlak += boog(ONDER_X[i + 1], onder[i + 1], ONDER_X[i], onder[i], 1.2) // vlakke bulten: geen rode punten
  return { lijn, vlak: vlak + 'Z' }
})

// Penseelrand (dezelfde streek als onder het rode scherm van de blikjesregen), 5 tegels van 600 breed
const PENSEEL =
  'M0 0H600V58C560 72 528 50 488 66S418 94 378 70 300 46 250 74 168 98 120 72 48 54 0 58Z M150 80h64l-6 5h-52zM392 78h76l-7 4h-62zM520 70h48l-5 4h-38z'

// Belletjes in het rood: [x in %, plaats in het vel (0–1), straal, dekking]
const BELLEN = [
  [12, 0.12, 9, 0.5],
  [78, 0.18, 5, 0.4],
  [40, 0.3, 13, 0.3],
  [88, 0.42, 8, 0.55],
  [22, 0.55, 6, 0.6],
  [62, 0.63, 11, 0.35],
  [8, 0.78, 7, 0.45],
  [70, 0.86, 5, 0.5],
] as const

/** Hoogtes van het vel bij schermhoogte H. Zie veeg() voor waarom het rood 1,6 × (H + schuim) lang is. */
const maten = (H: number) => {
  const lijf = 1.6 * (H + SCHUIM) - RAND
  return { lijf, totaal: SCHUIM + lijf + RAND }
}

export type RougeVel = {
  veeg: (o: { omlaag: boolean; dicht: () => void; zichtbaar: () => void }) => Promise<void>
}

export function Rouge({ ref }: { ref: Ref<RougeVel> }) {
  const houder = useRef<HTMLDivElement>(null)
  const vel = useRef<SVGSVGElement>(null)
  const vlak = useRef<SVGPathElement>(null)
  const lijn = useRef<SVGPathElement>(null)
  // 800 tot de browser meet: zo is de voorgerenderde HTML voor iedereen gelijk
  const [H, setH] = useState(800)
  useEffect(() => {
    const meet = () => setH(window.innerHeight)
    meet()
    window.addEventListener('resize', meet)
    return () => window.removeEventListener('resize', meet)
  }, [])

  useImperativeHandle(
    ref,
    () => ({
      veeg({ omlaag, dicht, zichtbaar }) {
        const { totaal } = maten(H)
        // Snelheden sluiten aan (geen hapering): binnenkomen versnelt (u²), het middenstuk is lineair,
        // weggaan vertraagt (1-(1-u)²). Met v = snelheid op 200 ms: binnen = 100v, midden = 40v, weg = 120v.
        // Binnen = H + schuim (tot het rood bovenaan raakt), dus weg = 1,2 × (H + schuim) en moet het
        // rood 1,6 × (H + schuim) lang zijn om op het einde helemaal boven uit beeld te zijn.
        const v = (H + SCHUIM) / 100
        const y200 = -SCHUIM
        const y240 = y200 - 40 * v
        // moment waarop het midden van de penseelrand voorbij de helft van het scherm komt
        const p = (y240 - (H / 2 - totaal + RAND / 2)) / (120 * v)
        const tHelft = 240 + 240 * (1 - Math.sqrt(1 - Math.min(1, Math.max(0, p))))

        const h = houder.current!
        h.style.transform = omlaag ? 'scaleY(-1)' : ''
        h.style.visibility = 'visible'
        const schuif = animate(
          vel.current!,
          { transform: [H, y200, y240, -totaal].map((y) => `translateY(${y}px)`) },
          {
            duration: DUUR / 1000,
            times: [0, 200 / DUUR, 240 / DUUR, 1],
            ease: [[1 / 3, 0, 2 / 3, 1 / 3], 'linear', [1 / 3, 2 / 3, 2 / 3, 1]],
          },
        )
        // wiebelen: tussen de drie handgemaakte standen
        const wiebel = { duration: DUUR / 1000, ease: 'easeInOut' as const }
        animate(vlak.current!, { d: [STANDEN[0].vlak, STANDEN[1].vlak, STANDEN[2].vlak, STANDEN[0].vlak] }, wiebel)
        animate(lijn.current!, { d: [STANDEN[0].lijn, STANDEN[1].lijn, STANDEN[2].lijn, STANDEN[0].lijn] }, wiebel)
        // Wisselen en vrijgeven op de klok van de animatie zelf (niet met setTimeout): als de start of
        // de hoofdthread wat later is, schuift alles mee en wisselt de pagina nooit buiten het bedekte stuk.
        const todo = [
          { t: 0.2, doe: dicht },
          { t: tHelft / 1000, doe: zichtbaar },
        ]
        const kijk = () => {
          while (todo.length && schuif.time >= todo[0].t) todo.shift()!.doe()
          if (todo.length) requestAnimationFrame(kijk)
        }
        requestAnimationFrame(kijk)
        return schuif.then(() => {
          todo.splice(0).forEach((x) => x.doe()) // wat nog niet gebeurd is (bv. tabblad op de achtergrond)
          h.style.visibility = 'hidden'
        })
      },
    }),
    [H],
  )

  const { lijf, totaal } = maten(H)
  return (
    <div
      ref={houder}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
      style={{ visibility: 'hidden' }}
    >
      <svg
        ref={vel}
        width="100%"
        height={totaal}
        className="absolute top-0 left-0"
        style={{ transform: 'translateY(100vh)' }}
      >
        {/* het rood begint al achter het schuim, zodat er tussen de bulten nooit een kier is */}
        <rect y={SCHUIM / 2} width="100%" height={lijf + SCHUIM / 2 + 1} fill={ROOD} />
        {BELLEN.map(([x, plaats, r, dekking]) => (
          <circle key={x} cx={`${x}%`} cy={SCHUIM + plaats * lijf} r={r} fill={CREME} opacity={dekking} />
        ))}
        <svg height={SCHUIM} width="100%" viewBox={`0 0 ${BREED} ${SCHUIM}`} preserveAspectRatio="xMidYMax slice">
          <path ref={vlak} d={STANDEN[0].vlak} fill={CREME} />
          <path
            ref={lijn}
            d={STANDEN[0].lijn}
            fill="none"
            stroke={INKT}
            strokeWidth={2}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <svg y={SCHUIM + lijf} height={RAND} width="100%" viewBox={`0 0 ${BREED} 140`} preserveAspectRatio="xMidYMin slice">
          {[0, 600, 1200, 1800, 2400].map((x) => (
            // 1 eenheid overlap tussen de tegels, anders een lichte naad op elke aansluiting
            <path key={x} d={PENSEEL} transform={`translate(${x - 0.5} 0) scale(${601 / 600} 1)`} fill={ROOD} />
          ))}
        </svg>
      </svg>
    </div>
  )
}
