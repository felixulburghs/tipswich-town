/**
 * Bier als vloeistof, getekend op één canvas over het hele scherm (pas aangemaakt bij het eerste gebruik,
 * daarna hergebruikt). Enkel voor het logo-bier (vul); de paginaovergang is het rode vel (components/Rouge.tsx).
 *
 * Geen blok dat verschuift, maar een NIVEAU dat stijgt en zakt:
 * - het oppervlak = niveau + golf (3 sinussen), die harder golft als het niveau snel beweegt
 *   en kantelt in de richting van de navigatie
 * - het bier: goudgeel onder het schuim naar diep amber onderaan, donkere randen (dikte van het glas),
 *   één zachte lichtstreep
 * - koolzuur: belletjes in losse stromen, sneller vlak onder het oppervlak, enkel onder het oppervlak
 * - schuimkraag: crème cirkels (één keer gegenereerd), dus een bobbelige rand die de golf volgt,
 *   met een iets donkerdere onderkant; bij het leeglopen blijft het schuim achter en laat het "lacing" achter
 */

const CREME = '#fff9f2'
const willekeurig = (a: number, b: number) => a + Math.random() * (b - a)

type Bel = { x: number; y: number; r: number; v: number; creme: boolean; stroom: number }
type Bol = { x: number; dy: number; r: number }
type Lacing = { x: number; y: number; bollen: { dx: number; dy: number; r: number }[]; start: number }

/** Wat de tijdlijn op elk moment teruggeeft (niveaus als deel van de schermhoogte, 0 = onderaan, 1 = bovenaan). */
export type Stand = { bier: number; schuim: number; kanteling: number }

type Scherm = {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  B: number
  H: number
  dpr: number
  gsm: boolean
  bollen: Bol[]
  bellen: Bel[]
  stromen: number[]
}

let scherm: Scherm | null = null
let lopend: (() => void) | null = null // de animatie die nu speelt (een nieuwe stopt de vorige)

function maakScherm(): Scherm {
  const canvas = document.createElement('canvas')
  canvas.setAttribute('aria-hidden', 'true')
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:50;display:none'
  document.body.append(canvas)
  const s = {
    canvas,
    ctx: canvas.getContext('2d')!,
    B: 0,
    H: 0,
    dpr: 1,
    gsm: false,
    bollen: [],
    bellen: [],
    stromen: [],
  }
  maatnemen(s)
  return s
}

/** Canvas op schermgrootte (scherp: devicePixelRatio) en schuim en belletjes één keer genereren. */
function maatnemen(s: Scherm) {
  const B = window.innerWidth
  const H = window.innerHeight
  if (s.B === B && s.H === H) return
  s.B = B
  s.H = H
  s.dpr = Math.min(window.devicePixelRatio || 1, 3)
  s.gsm = B < 640
  s.canvas.width = Math.round(B * s.dpr)
  s.canvas.height = Math.round(H * s.dpr)
  const dik = schuimDikte(s)
  // Schuim: gsm eenvoudiger (minder cirkels); verspreid over de breedte, wat buiten beeld aan beide kanten
  const n = s.gsm ? 28 : 64
  s.bollen = Array.from({ length: n }, (_, i) => ({
    x: ((i + willekeurig(0.1, 0.9)) / n) * (B + 40) - 20,
    dy: willekeurig(0, 0.5) * dik,
    r: willekeurig(0.2, 0.42) * dik,
  }))
  s.stromen = Array.from({ length: s.gsm ? 6 : 9 }, () => willekeurig(0.05, 0.95) * B)
  s.bellen = Array.from({ length: s.gsm ? 25 : 42 }, (_, i) => ({
    x: 0,
    y: Infinity, // wordt bij de eerste beurt onder het oppervlak geplaatst
    r: willekeurig(1, 3),
    v: willekeurig(0.12, 0.3),
    creme: i % 5 === 0,
    stroom: i % s.stromen.length,
  }))
}

const schuimDikte = (s: Scherm) => s.H * (s.gsm ? 0.09 : 0.1)

/** Het oppervlak op plek x: niveau + 3 golven + kanteling. */
function oppervlak(s: Scherm, yNiveau: number, x: number, t: number, amp: number, kanteling: number) {
  const k = (2 * Math.PI) / s.B
  const golf =
    Math.sin(x * k * 1.3 + t * 0.006) * 0.55 +
    Math.sin(x * k * 2.7 - t * 0.0092 + 1.7) * 0.3 +
    Math.sin(x * k * 5.1 + t * 0.013 + 4.1) * 0.15
  return yNiveau + golf * amp + Math.tan(kanteling) * (x - s.B / 2)
}

/**
 * Speelt een tijdlijn af. stand(t) geeft per ms de niveaus en de kanteling; gebeurtenissen worden één keer
 * opgeroepen zodra hun tijd voorbij is. doorzichtig: het bier laat de site doorschijnen (logo-bier).
 */
export function speel({
  duur,
  stand,
  gebeurtenissen = [],
  doorzichtig = 1,
  lacing = 0,
}: {
  duur: number
  stand: (t: number) => Stand
  gebeurtenissen?: { t: number; doe: () => void }[]
  doorzichtig?: number
  lacing?: number // aantal schuimvlekjes dat achterblijft bij het leeglopen
}): Promise<void> {
  lopend?.()
  scherm ??= maakScherm()
  const s = scherm
  maatnemen(s)
  const { ctx, canvas } = s
  canvas.style.display = 'block'
  const todo = [...gebeurtenissen].sort((a, b) => a.t - b.t)
  const dik = schuimDikte(s)
  const lacings: Lacing[] = []
  let lacingNog = lacing
  let energie = 1
  let vorigNiveau = stand(0).bier
  let vorigeT = 0
  const begin = performance.now()

  return new Promise((klaar) => {
    let raf = 0
    const stop = () => {
      cancelAnimationFrame(raf)
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      canvas.style.display = 'none'
      lopend = null
      todo.length = 0
      klaar()
    }
    lopend = stop

    const beeld = (nu: number) => {
      const t = Math.min(nu - begin, duur)
      const dt = Math.max(1, t - vorigeT)
      vorigeT = t
      while (todo.length && todo[0].t <= t) todo.shift()!.doe()
      const { bier, schuim, kanteling } = stand(t)

      // Golf: hoe sneller het niveau beweegt, hoe hoger de golven (6–14 px); daarna dempen ze uit
      const snelheid = Math.abs(bier - vorigNiveau) / dt // schermhoogtes per ms
      vorigNiveau = bier
      energie = Math.max(Math.min(1, snelheid * 300), energie * 0.94)
      const amp = 6 + 8 * energie

      const yBier = s.H * (1 - bier)
      const ySchuim = s.H * (1 - schuim)
      const STAP = s.gsm ? 12 : 16
      const bierOpp = (x: number) => oppervlak(s, yBier + dik * 0.55, x, t, amp, kanteling)
      const schuimOpp = (x: number) => oppervlak(s, ySchuim, x, t + 120, amp, kanteling)

      ctx.setTransform(s.dpr, 0, 0, s.dpr, 0, 0)
      ctx.clearRect(0, 0, s.B, s.H)

      // 1. Het bier
      ctx.save()
      ctx.globalAlpha = doorzichtig
      ctx.beginPath()
      ctx.moveTo(-10, s.H + 10)
      for (let x = -10; x <= s.B + 10; x += STAP) ctx.lineTo(x, bierOpp(x))
      ctx.lineTo(s.B + 10, s.H + 10)
      ctx.closePath()
      const top = Math.max(0, Math.min(s.H, yBier))
      const verloop = ctx.createLinearGradient(0, top, 0, s.H + 1)
      verloop.addColorStop(0, '#f8cd52') // licht goud vlak onder het schuim
      verloop.addColorStop(0.45, '#eba62f')
      verloop.addColorStop(1, '#a9580d') // diep amber onderaan
      ctx.fillStyle = verloop
      ctx.fill()
      ctx.clip()
      // donkere randen (dikte van het glas) en één zachte lichtstreep
      const rand = ctx.createLinearGradient(0, 0, s.B, 0)
      rand.addColorStop(0, 'rgb(110 50 0 / 0.38)')
      rand.addColorStop(0.12, 'rgb(110 50 0 / 0)')
      rand.addColorStop(0.88, 'rgb(110 50 0 / 0)')
      rand.addColorStop(1, 'rgb(110 50 0 / 0.38)')
      ctx.fillStyle = rand
      ctx.fillRect(0, 0, s.B, s.H)
      const streep = ctx.createLinearGradient(s.B * 0.15, 0, s.B * 0.2, 0)
      streep.addColorStop(0, 'rgb(255 255 255 / 0)')
      streep.addColorStop(0.5, 'rgb(255 255 255 / 0.16)')
      streep.addColorStop(1, 'rgb(255 255 255 / 0)')
      ctx.fillStyle = streep
      ctx.fillRect(s.B * 0.15, 0, s.B * 0.05, s.H)

      // 2. Koolzuur: in stromen omhoog, sneller vlak onder het oppervlak, enkel onder het oppervlak
      for (const b of s.bellen) {
        const opp = bierOpp(b.x)
        if (b.y < opp + 6 || b.y > s.H + 4) {
          b.x = s.stromen[b.stroom] + willekeurig(-10, 10)
          b.y = willekeurig(Math.max(opp + 10, s.H * 0.35), s.H + 4)
        }
        const nabij = 1 - Math.min(1, (b.y - opp) / s.H)
        b.y -= b.v * (1 + 2.2 * nabij) * dt
        b.x += Math.sin((b.y + b.stroom * 40) * 0.05) * 0.3
        ctx.fillStyle = b.creme ? 'rgb(255 249 242 / 0.6)' : 'rgb(255 255 240 / 0.35)'
        ctx.beginPath()
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()

      // 3. Schuimkraag: van het (achterblijvende) schuimoppervlak tot net in het bier
      //    eerst de iets donkerdere onderkant, dan de crème cirkels met hun bobbelige bovenrand
      ctx.beginPath()
      ctx.moveTo(-10, schuimOpp(-10) + dik * 0.4)
      for (let x = -10; x <= s.B + 10; x += STAP) ctx.lineTo(x, schuimOpp(x) + dik * 0.4)
      for (let x = s.B + 10; x >= -10; x -= STAP)
        ctx.lineTo(x, Math.max(bierOpp(x), schuimOpp(x) + dik * 0.6) + dik * 0.15)
      ctx.closePath()
      const onder = ctx.createLinearGradient(0, ySchuim, 0, Math.max(yBier + dik, ySchuim + dik * 0.9))
      onder.addColorStop(0, CREME)
      onder.addColorStop(1, '#ecdcc2') // donkerder crème waar het schuim het bier raakt
      ctx.fillStyle = onder
      ctx.fill()
      ctx.fillStyle = CREME
      ctx.beginPath()
      for (const bol of s.bollen) {
        const y = schuimOpp(bol.x) + bol.dy + bol.r * 0.35
        ctx.moveTo(bol.x + bol.r, y)
        ctx.arc(bol.x, y, bol.r, 0, Math.PI * 2)
      }
      ctx.fill()

      // 4. Lacing: schuimvlekjes die blijven plakken waar het schuim voorbijkomt, en in 250 ms verdwijnen
      // enkel zolang ze nog 200+ ms kunnen uitdoven binnen de duur
      if (lacingNog > 0 && schuim < 0.95 && schuim > 0.35 && t <= duur - 200 && Math.random() < 0.4) {
        lacingNog--
        const x = willekeurig(0.08, 0.92) * s.B
        lacings.push({
          x,
          y: schuimOpp(x) - willekeurig(dik * 0.4, dik * 1.6),
          start: t,
          bollen: Array.from({ length: Math.round(willekeurig(3, 5)) }, () => ({
            dx: willekeurig(-9, 9),
            dy: willekeurig(-6, 6),
            r: willekeurig(3, 7),
          })),
        })
      }
      for (const l of lacings) {
        const leeftijd = (t - l.start) / Math.min(250, duur - l.start)
        if (leeftijd >= 1) continue
        ctx.globalAlpha = 1 - leeftijd
        ctx.fillStyle = CREME
        ctx.beginPath()
        for (const b of l.bollen) {
          const r = b.r * (1 - leeftijd * 0.8)
          ctx.moveTo(l.x + b.dx + r, l.y + b.dy)
          ctx.arc(l.x + b.dx, l.y + b.dy, r, 0, Math.PI * 2)
        }
        ctx.fill()
        ctx.globalAlpha = 1
      }

      if (t >= duur) stop()
      else raf = requestAnimationFrame(beeld)
    }
    raf = requestAnimationFrame(beeld)
  })
}

const easeOutCubic = (u: number) => 1 - (1 - u) ** 3
const easeInQuad = (u: number) => u * u

/**
 * Het logo-bier: het scherm loopt tot 86% vol, klotst, blijft even staan en loopt weer leeg (± 3 s).
 * Doorschijnend, zodat je de site erdoor blijft zien.
 */
export function vul(duur = 3000) {
  const niveau = (t: number) => {
    const u = t / duur
    if (u < 0.38) return 0.86 * easeOutCubic(u / 0.38)
    if (u < 0.68) return 0.86 - 0.03 * Math.sin(((u - 0.38) / 0.3) * Math.PI * 2) * (1 - (u - 0.38) / 0.3)
    return 0.86 - 1.06 * easeInQuad((u - 0.68) / 0.32)
  }
  return speel({
    duur,
    doorzichtig: 0.8,
    stand: (t) => ({
      bier: niveau(t),
      schuim: Math.max(niveau(t), niveau(Math.max(0, t - 80))),
      kanteling: t < duur * 0.5 ? 0.03 * Math.sin((t / duur) * Math.PI * 6) * (1 - t / (duur * 0.5)) : 0,
    }),
  })
}

/** Lopende overgang meteen stoppen (bv. als de component verdwijnt). */
export const stopBier = () => lopend?.()
