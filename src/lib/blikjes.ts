import Matter from 'matter-js'
import { vraagGyroscoopToestemming } from '../hooks/useKantel'

/**
 * Vallende blikjes met echte natuurkunde (matter-js). Pas geladen met import() wanneer nodig,
 * zodat de eerste weergave van de site er nooit op wacht.
 *
 * Drie lagen, elk op een eigen <canvas>:
 * - achter: kleine blikjes die traag vallen, zonder botsingen (de CSS maakt ze wazig en donker)
 * - midden: de echte natuurkunde-blikjes, scherp, met schaduw, contactschaduw en druppels
 * - voor:   2–3 reuzenblikjes die in de eerste seconde voorbij flitsen (de CSS maakt ze heel wazig)
 * De titel staat in de HTML tussen midden en voor, zodat de stapel hem nooit bedekt.
 */

const { Engine, Bodies, Body, Composite, Events, Mouse, MouseConstraint, Sleeping } = Matter
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MBody = any

// WebP-kopieën van de PNG's van de sponsor (zelfde map), op de grootste maat die de site ooit toont:
// Pils 360 px breed (104 px × 1,12 × 3× scherm), Rouge 268 px (de originele breedte). 78 KB i.p.v. 760 KB.
const BEELDEN = { pils: '/sponsors/can-pils.webp', rouge: '/sponsors/can-rouge.webp' }
type Soort = keyof typeof BEELDEN

const GROOTTE = 0.12 // elk blikje ±12%
const VLOER_MARGE = 6 // px tussen vloer en onderkant scherm, zodat de contactschaduw zichtbaar is
const CREME = '255 249 242'

const willekeurig = (min: number, max: number) => min + Math.random() * (max - min)
const klem = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

/** Breedte van een blikje: 9% van het scherm, tussen 56 en 104 px. */
export const blikBreedte = (schermBreedte: number) => klem(schermBreedte * 0.09, 56, 104)

/**
 * Zoveel blikjes dat de stapel hooguit de onderste `grens` (40%) van het scherm bedekt.
 * DEKKING = welk deel van die 40% echt met blik gevuld raakt (de rest is lucht tussen schuine blikjes);
 * afgesteld door de stapelhoogte te meten (canvas.dataset.stapel).
 */
const DEKKING = 0.42
export function aantalVoorStapel(B: number, H: number, breedte: number, verhouding: number, grens = 0.4) {
  return klem(Math.round((grens * B * H * DEKKING) / (breedte * breedte * verhouding)), 6, 40)
}

/** Hoe breed de voorbereide afbeelding wordt (echte pixels): nooit groter dan het bestand zelf. */
export function cacheBreedte(cssBreedte: number, dpr: number, bestandBreedte: number) {
  return Math.min(Math.round(cssBreedte * (1 + GROOTTE) * dpr), bestandBreedte)
}
console.assert(cacheBreedte(120, 2, 268) === 268 && cacheBreedte(90, 1, 445) === 101, 'cacheBreedte')
console.assert(blikBreedte(375) === 56 && blikBreedte(1440) === 104 && blikBreedte(800) === 72, 'blikBreedte')

async function laad(src: string) {
  const img = new Image()
  img.src = src
  await img.decode()
  return img
}

type Sprite = { beeld: HTMLCanvasElement; schaduw?: HTMLCanvasElement; pad: number; verhouding: number; max: number }

/**
 * Schaalt een blikje één keer naar schermformaat (nooit elk frame vanuit het grote bestand),
 * en bakt er desgewenst een zachte schaduw bij: een wazig, donker silhouet als apart beeldje.
 * Apart, zodat de schaduw altijd naar rechtsonder valt, ook als het blikje ondersteboven ligt.
 */
function maakSprite(img: HTMLImageElement, cssBreedte: number, dpr: number, metSchaduw: boolean): Sprite {
  const b = cacheBreedte(cssBreedte, dpr, img.naturalWidth)
  const h = Math.round((b * img.naturalHeight) / img.naturalWidth)
  const beeld = document.createElement('canvas')
  beeld.width = b
  beeld.height = h
  const ctx = beeld.getContext('2d')!
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, 0, 0, b, h)

  const sprite: Sprite = { beeld, pad: 0, verhouding: h / b, max: img.naturalWidth }
  if (!metSchaduw) return sprite

  // Schaduwtruc: teken het blikje ver buiten beeld, met een schaduw-offset die hem terug in beeld zet
  const vervaging = Math.round(b * 0.1)
  const pad = vervaging * 2
  const s = document.createElement('canvas')
  s.width = b + pad * 2
  s.height = h + pad * 2
  const sc = s.getContext('2d')!
  const ver = s.width + 1000
  sc.shadowColor = 'rgb(45 0 6 / 0.75)'
  sc.shadowBlur = vervaging
  sc.shadowOffsetX = ver
  sc.drawImage(beeld, pad - ver, pad)
  sprite.schaduw = s
  sprite.pad = pad / dpr
  return sprite
}

type Laag = { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; dpr: number }
function maakLaag(canvas: HTMLCanvasElement, dpr: number, B: number, H: number): Laag {
  canvas.width = Math.round(B * dpr)
  canvas.height = Math.round(H * dpr)
  const ctx = canvas.getContext('2d')!
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  return { canvas, ctx, dpr }
}

/** Een blikje zonder natuurkunde (achter- en voorlaag): rechte val met draai. */
type Zweef = {
  soort: Soort
  x: number
  y: number
  vx: number
  vy: number
  hoek: number
  draai: number
  b: number
  h: number
}
type Druppel = { x: number; y: number; vx: number; vy: number; r: number; leven: number }

export type BlikjesOpties = {
  canvas: HTMLCanvasElement // midden: de natuurkunde-blikjes
  achterCanvas?: HTMLCanvasElement
  voorCanvas?: HTMLCanvasElement
  rougeKans: number // 0.25 ≈ 3 Pils per Rouge; 0 = enkel Pils
  aantal?: number // standaard: zoveel dat de stapel ≤ stapelGrens van het scherm bedekt
  stapelGrens?: number // 0.4 = de stapel blijft in de onderste 40%
  vulGaten?: boolean // extra blikjes gooien tot er geen gaten meer op de vloer zijn
  breedte?: number // standaard 9% van de breedte, tussen 56 en 104 px
  vloerMarge?: number // px tussen vloer en onderkant van het canvas (standaard 6)
  obstakels?: HTMLElement[] // bv. de knop: blikjes botsen ertegen en stapelen errond
  bui?: { vloerWegNa?: number } // korte bui: alles meteen in twee golven; vloer weg na x ms (of nooit)
  sceneTijd?: number // ms sinds de titel verscheen; de blikjes beginnen op 0,5 s
  interactief: boolean // muis duwen/gooien, gsm vegen en kantelen
  stil?: boolean // "minder beweging": stapel in stilte berekenen, één beeld tekenen
  schudElement?: HTMLElement // schudt even bij de eerste harde landingen
  bij?: { eersteLanding?(): void; vertrek?(): void; leeg?(): void } // vertrek: tijd voor de uitgang (2,92 s); leeg: alles uit beeld
}

export async function startBlikjes(o: BlikjesOpties) {
  const B = o.canvas.clientWidth
  const H = o.canvas.clientHeight
  const dpr = Math.min(window.devicePixelRatio || 1, 3)
  const breedte = o.breedte ?? blikBreedte(B)

  const [pilsImg, rougeImg] = await Promise.all([laad(BEELDEN.pils), o.rougeKans > 0 ? laad(BEELDEN.rouge) : null])
  const img = { pils: pilsImg, rouge: rougeImg ?? pilsImg }
  const sprites = (css: number, d: number, schaduw: boolean) => ({
    pils: maakSprite(img.pils, css, d, schaduw),
    rouge: maakSprite(img.rouge, css, d, schaduw),
  })
  const midSprite = sprites(breedte, dpr, true)
  // Achter en voor zijn wazig: 1× resolutie volstaat en scheelt veel rekenwerk op gsm
  const achterSprite = o.achterCanvas ? sprites(breedte * 0.5, 1, false) : null
  const voorSprite = o.voorCanvas ? sprites(breedte * 2.5, 1, false) : null

  const midden = maakLaag(o.canvas, dpr, B, H)
  const achter = o.achterCanvas ? maakLaag(o.achterCanvas, 1, B, H) : null
  const voor = o.voorCanvas ? maakLaag(o.voorCanvas, 1, B, H) : null

  const kiesSoort = (): Soort => (Math.random() < o.rougeKans ? 'rouge' : 'pils')
  /** Breedte met ±12% variatie, maar nooit breder dan het bestand. */
  const maat = (basis: number, s: Sprite) => Math.min(basis * willekeurig(1 - GROOTTE, 1 + GROOTTE), s.max)

  // --- Natuurkunde ---
  const engine = Engine.create({ enableSleeping: true })
  engine.gravity.y = 1.6
  const wereld = engine.world
  const vloerY = H - (o.vloerMarge ?? VLOER_MARGE)
  const dik = 200
  // De vloer in 8 stukken, zodat hij bij de uitgang van links naar rechts kan wegvallen.
  // Het eerste en laatste stuk lopen ver buiten beeld door, voor blikjes die tegen de muur liggen.
  const DELEN = 8
  const vloerDelen = Array.from({ length: DELEN }, (_, i) => {
    const van = i === 0 ? -B : (B * i) / DELEN
    const tot = i === DELEN - 1 ? B * 2 : (B * (i + 1)) / DELEN
    return Bodies.rectangle((van + tot) / 2, vloerY + dik / 2, tot - van, dik, { isStatic: true, friction: 0.9 })
  })
  const isVloer = (k: MBody) => vloerDelen.includes(k)
  const muren = [
    Bodies.rectangle(-dik / 2, 0, dik, H * 6, { isStatic: true, friction: 0.3 }),
    Bodies.rectangle(B + dik / 2, 0, dik, H * 6, { isStatic: true, friction: 0.3 }),
  ]
  Composite.add(wereld, [...vloerDelen, ...muren])
  // Obstakels (de knop): een vast, onzichtbaar blok op dezelfde plek; de knop zelf blijft erboven getekend
  const c = o.canvas.getBoundingClientRect()
  const obstakels = (o.obstakels ?? []).map((el) => {
    const r = el.getBoundingClientRect()
    return Bodies.rectangle(r.left - c.left + r.width / 2, r.top - c.top + r.height / 2, r.width, r.height, {
      isStatic: true,
      friction: 0.6,
      chamfer: { radius: 8 },
    })
  })
  Composite.add(wereld, obstakels)

  type Blik = { body: MBody; soort: Soort; b: number; h: number; contact: number }
  const blikjes: Blik[] = []
  const grens = o.stapelGrens ?? 0.4
  const aantal =
    o.aantal ?? aantalVoorStapel(B, H, breedte, (midSprite.pils.verhouding * 3 + midSprite.rouge.verhouding) / 4, grens)

  function voegToe(x: number, y: number, vy: number) {
    const soort = kiesSoort()
    const b = maat(breedte, midSprite[soort])
    const h = b * midSprite[soort].verhouding
    const body = Bodies.rectangle(klem(x, b / 2, B - b / 2), y, b * 0.94, h * 0.97, {
      chamfer: { radius: b * 0.35 }, // ronde hoeken: een blikje rechtop op een ander blikje kantelt om
      angle: willekeurig(-Math.PI, Math.PI),
      restitution: willekeurig(0.15, 0.25),
      friction: 0.6,
      frictionStatic: 0.9,
      frictionAir: 0.003, // weinig luchtweerstand: ze vallen zwaar
      density: 0.002,
      sleepThreshold: 30,
    })
    body.plugin.blik = true
    Body.setVelocity(body, { x: willekeurig(-1, 1), y: vy * (1000 / 60) }) // matter rekent in px per stap
    Body.setAngularVelocity(body, willekeurig(-0.18, 0.18))
    Composite.add(wereld, body)
    blikjes.push({ body, soort, b, h, contact: 0 })
  }

  let vallen = false // na laatVallen(): niets meer afremmen
  // Demping: in de lucht blijven ze tollen, bij contact komen ze snel tot rust (en slapen dan)
  let stapNr = 0
  Events.on(engine, 'collisionActive', (e: { pairs: { bodyA: MBody; bodyB: MBody }[] }) => {
    for (const p of e.pairs) {
      p.bodyA.plugin.contact = stapNr
      p.bodyB.plugin.contact = stapNr
    }
  })
  Events.on(engine, 'beforeUpdate', () => {
    stapNr++
    for (const { body } of blikjes) {
      if (body.isSleeping) continue
      const opGrond = stapNr - (body.plugin.contact ?? -99) < 3
      Body.setAngularVelocity(body, body.angularVelocity * (opGrond ? 0.86 : 0.995))
      if (opGrond && !vallen) Body.setVelocity(body, { x: body.velocity.x * 0.94, y: body.velocity.y }) // niet eindeloos doorschuiven
    }
  })

  // --- Reacties op harde landingen: schok, druppels, titel ---
  const druppels: Druppel[] = []
  let hardeLandingen = 0
  let eersteLanding = false
  let slamGeland = false
  Events.on(engine, 'collisionStart', (e: { pairs: MBody[] }) => {
    for (const p of e.pairs) {
      const { bodyA: a, bodyB: b, collision } = p
      if (!a.plugin.blik && !b.plugin.blik) continue
      const raaktVloer = isVloer(a) || isVloer(b)
      if (raaktVloer && !eersteLanding) {
        eersteLanding = true
        o.bij?.eersteLanding?.()
      }
      // Het allerlaatste blikje van de uitgang: altijd een schok, en de stapel veert even in
      const slam = (a.plugin.slam || b.plugin.slam) && !slamGeland
      if (slam) {
        slamGeland = true
        o.canvas.style.transformOrigin = '50% 100%'
        o.canvas.animate([{ transform: 'none' }, { transform: 'scaleY(0.97)' }, { transform: 'none' }], {
          duration: 180,
          easing: 'ease-out',
        })
      }
      const n = collision.normal
      const snelheid = Math.abs((a.velocity.x - b.velocity.x) * n.x + (a.velocity.y - b.velocity.y) * n.y)
      if (snelheid < 7 && !slam) continue
      const punt = collision.supports[0] ?? a.position
      if (druppels.length < 90) {
        for (let i = 0; i < 8; i++) {
          const hoek = willekeurig(-Math.PI * 0.95, -Math.PI * 0.05)
          const v = willekeurig(0.12, 0.42)
          druppels.push({
            x: punt.x,
            y: punt.y,
            vx: Math.cos(hoek) * v,
            vy: Math.sin(hoek) * v,
            r: willekeurig(1.2, 3.2),
            leven: 1,
          })
        }
      }
      if ((hardeLandingen++ < 4 || slam) && o.schudElement) {
        const dx = willekeurig(2, 4) * (Math.random() < 0.5 ? -1 : 1)
        const dy = willekeurig(2, 4) * (Math.random() < 0.5 ? -1 : 1)
        o.schudElement.animate(
          [
            { transform: `translate(${dx}px, ${dy}px)` },
            { transform: `translate(${-dx / 2}px, ${-dy / 2}px)` },
            { transform: 'none' },
          ],
          { duration: 80 },
        )
      }
    }
  })

  // --- Tekenen ---
  function tekenMidden() {
    const { ctx } = midden
    ctx.clearRect(0, 0, B, H)
    // Contactschaduw: een zachte donkere vlek op de vloer onder elk blikje dat (bijna) op de grond ligt
    for (const { body } of blikjes) {
      const afstand = vloerY - body.bounds.max.y
      if (afstand > 14 || afstand < -4) continue
      const halfB = (body.bounds.max.x - body.bounds.min.x) / 2
      ctx.save()
      ctx.translate(body.position.x + 3, vloerY)
      ctx.scale(halfB * 1.05, 7)
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1)
      g.addColorStop(0, `rgb(40 0 5 / ${0.6 * (1 - Math.max(0, afstand) / 14)})`)
      g.addColorStop(1, 'rgb(50 0 6 / 0)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(0, 0, 1, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }
    // Schaduw (altijd rechtsonder) en dan het blikje zelf
    for (const { body, soort, b, h } of blikjes) {
      const s = midSprite[soort]
      const pad = (s.pad * b * dpr) / s.beeld.width // rand van de schaduw, meegeschaald met dit blikje
      ctx.save()
      ctx.translate(body.position.x + b * 0.09, body.position.y + b * 0.14)
      ctx.rotate(body.angle)
      ctx.drawImage(s.schaduw!, -b / 2 - pad, -h / 2 - pad, b + pad * 2, h + pad * 2)
      ctx.restore()
    }
    for (const { body, soort, b, h } of blikjes) {
      ctx.save()
      ctx.translate(body.position.x, body.position.y)
      ctx.rotate(body.angle)
      ctx.drawImage(midSprite[soort].beeld, -b / 2, -h / 2, b, h)
      ctx.restore()
    }
    for (const d of druppels) {
      ctx.fillStyle = `rgb(${CREME} / ${d.leven})`
      ctx.beginPath()
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  function tekenZwevers(laag: Laag | null, lijst: Zweef[], sp: ReturnType<typeof sprites> | null) {
    if (!laag || !sp) return
    laag.ctx.clearRect(0, 0, B, H)
    for (const z of lijst) {
      laag.ctx.save()
      laag.ctx.translate(z.x, z.y)
      laag.ctx.rotate(z.hoek)
      laag.ctx.drawImage(sp[z.soort].beeld, -z.b / 2, -z.h / 2, z.b, z.h)
      laag.ctx.restore()
    }
  }

  // Minder beweging: alles in één keer laten vallen, in stilte doorrekenen, één beeld tekenen
  if (o.stil) {
    Events.off(engine, 'collisionStart') // geen schok of titel-duwtje bij "minder beweging"
    for (let i = 0; i < aantal; i++) voegToe(willekeurig(0, B), willekeurig(H * 0.1, H * 0.7), 0)
    for (let i = 0; i < 300; i++) Engine.update(engine, 1000 / 60)
    tekenMidden()
    return { laatVallen() {}, slamBlik() {}, stop() {} }
  }

  // --- Draaiboek (ms na het verschijnen van de titel) ---
  let scene = o.sceneTijd ?? 0
  // de eerste drie blikjes op 0,5 s (later als de beelden traag binnenkwamen); een korte bui begint meteen
  const begin = o.bui ? scene : Math.max(500, scene)
  const gepland: { t: number; doe: () => void; golf?: boolean }[] = []
  const plan = (t: number, doe: () => void, golf = false) => gepland.push({ t: begin + t, doe, golf })

  /** Stukken vloer waar geen blikje (of obstakel) boven ligt, breder dan 24 px. */
  function vloerGaten(enkelOpVloer: boolean) {
    const bedekt = obstakels.map((k: MBody) => [k.bounds.min.x, k.bounds.max.x])
    for (const { body } of blikjes) {
      if (enkelOpVloer && body.bounds.max.y < vloerY - breedte * 0.7) continue
      bedekt.push([body.bounds.min.x + 6, body.bounds.max.x - 6])
    }
    bedekt.sort((p: number[], q: number[]) => p[0] - q[0])
    const gaten: [number, number][] = []
    let x = 0
    for (const [van, tot] of bedekt) {
      if (van - x > 24) gaten.push([x, van])
      x = Math.max(x, tot)
    }
    if (B - x > 24) gaten.push([x, B])
    return gaten
  }
  let extra = 0
  function vulVloer(enkelOpVloer: boolean) {
    if (teTraag) return // te traag toestel: geen extra blikjes
    for (const [van, tot] of vloerGaten(enkelOpVloer)) {
      const n = Math.max(1, Math.round((tot - van) / (breedte * 1.2)))
      for (let i = 0; i < n && extra < 14; i++, extra++)
        voegToe(van + ((tot - van) * (i + 0.5)) / n, -breedte * willekeurig(1.2, 1.8), 1.5)
    }
  }

  if (o.bui) {
    // Korte bui: twee snelle golven, daarna blijven liggen of (na vloerWegNa) wegvallen
    const helft = Math.ceil(aantal / 2)
    for (let i = 0; i < aantal; i++) {
      const golf = i < helft ? 0 : 1
      const inGolf = golf ? aantal - helft : helft
      const plek = golf ? i - helft : i
      plan(golf * 220 + willekeurig(0, 80), () =>
        voegToe((B / inGolf) * (plek + willekeurig(0.2, 0.8)), -breedte * willekeurig(1.2, 2.2), 0.4),
      )
    }
    if (o.bui.vloerWegNa != null) plan(o.bui.vloerWegNa, () => laatVallen())
  }

  // 1. drie blikjes na elkaar, verspreid over de breedte
  const openers = o.bui ? 0 : Math.min(3, aantal)
  for (let i = 0; i < openers; i++)
    plan(i * 150, () => voegToe(B * (0.25 + i * 0.25) + willekeurig(-20, 20), -breedte * 2, 0.5))
  // 2. de stortbui van 0,9 tot 1,2 s: golven over de hele breedte, elke golf netjes gespreid (vakjes + toeval).
  //    Snel genoeg ingeworpen dat alles rond 1,8 s geland is en op 2,2 s stil ligt.
  const golven = 4
  const rest = o.bui ? 0 : aantal - openers
  for (let g = 0; g < golven; g++) {
    const inGolf = Math.round(rest / golven + (g < rest % golven ? 0.5 : 0))
    for (let i = 0; i < inGolf; i++) {
      const vak = B / inGolf
      plan(
        400 + g * 90 + willekeurig(0, 60),
        () => voegToe(vak * (i + willekeurig(0.2, 0.8)), -breedte * willekeurig(1.2, 2), 1.2),
        true,
      )
    }
  }
  // Achterlaag: 8–12 kleine blikjes die de hele tijd traag naar beneden zweven
  const achterlijst: Zweef[] = []
  if (achterSprite) {
    const n = Math.round(willekeurig(8, 12))
    for (let i = 0; i < n; i++) {
      plan(-300 + (i / n) * 2000, () => {
        const soort = kiesSoort()
        const b = maat(breedte * 0.5, achterSprite[soort])
        achterlijst.push({
          soort,
          b,
          h: b * achterSprite[soort].verhouding,
          x: willekeurig(0, B),
          y: -breedte,
          vx: willekeurig(-0.02, 0.02),
          vy: willekeurig(0.12, 0.22),
          hoek: willekeurig(-3, 3),
          draai: willekeurig(-0.002, 0.002),
        })
      })
    }
  }
  // Voorlaag: 2–3 reuzenblikjes die in de eerste seconde snel voorbij flitsen
  const voorlijst: Zweef[] = []
  if (voorSprite) {
    const n = Math.random() < 0.5 ? 2 : 3
    for (let i = 0; i < n; i++) {
      plan(-150 + i * 200, () => {
        const soort = kiesSoort()
        const b = maat(breedte * 2.5, voorSprite[soort])
        const h = b * voorSprite[soort].verhouding
        voorlijst.push({
          soort,
          b,
          h,
          x: B * (0.15 + 0.7 * ((i * 0.55 + Math.random() * 0.3) % 1)),
          y: -h,
          vx: willekeurig(-0.3, 0.3),
          vy: willekeurig(2.2, 2.8),
          hoek: willekeurig(-0.6, 0.6),
          draai: willekeurig(-0.004, 0.004),
        })
      })
    }
  }
  // Brede schermen: na de stortbui de gaten op de vloer opvullen (eerst op basis van waar ze vallen, dan nog eens)
  if (o.vulGaten && !o.bui) {
    plan(800, () => vulVloer(false))
    plan(1100, () => vulVloer(true))
  }
  // Meting op 2,2 s (controle van de stapelgrens): hoe hoog ligt de stapel, bewegen er nog, zijn er nog gaten?
  if (!o.bui)
    plan(1700, () => {
      // in rust = slapend, of traag én tegen iets aan (bovenaan een stuiter is een blikje ook even traag, maar zweeft)
      const rust = blikjes.filter(
        (k) => k.body.isSleeping || (k.body.speed < 1.5 && stapNr - (k.body.plugin.contact ?? -99) < 3),
      )
      o.canvas.dataset.stapel = ((vloerY - Math.min(...rust.map((k) => k.body.bounds.min.y))) / H).toFixed(2)
      o.canvas.dataset.inBeweging = String(blikjes.length - rust.length)
      o.canvas.dataset.gaten = String(vloerGaten(true).length)
      o.canvas.dataset.aantal = String(blikjes.length)
    })
  // 3,0 s: vloer weg
  // 2,92 s: de uitgang begint (de component regelt de rest: laatste blikje, vloer weg, rode scherm weg)
  if (!o.bui) plan(2420, () => o.bij?.vertrek?.())
  gepland.sort((a, b) => a.t - b.t)

  // --- Interactie (midden-laag) ---
  const opruimen: (() => void)[] = []
  let muisBeperking: MBody = null
  const duw = { x: -999, y: -999, vx: 0, vy: 0 }
  const wekAlles = () => blikjes.forEach(({ body }) => Sleeping.set(body, false))

  if (o.interactief) {
    const muis = Mouse.create(o.canvas)
    muis.pixelRatio = dpr
    muis.element.removeEventListener('wheel', muis.mousewheel)
    muis.element.removeEventListener('mousewheel', muis.mousewheel)
    muisBeperking = MouseConstraint.create(engine, {
      mouse: muis,
      constraint: { stiffness: 0.2, render: { visible: false } },
    })
    Composite.add(wereld, muisBeperking)

    const opBeweeg = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      const r = o.canvas.getBoundingClientRect()
      const x = e.clientX - r.left
      const y = e.clientY - r.top
      duw.vx = x - duw.x
      duw.vy = y - duw.y
      duw.x = x
      duw.y = y
    }
    const opKantel = (e: DeviceOrientationEvent) => {
      if (e.gamma == null) return
      const gx = klem(e.gamma / 40, -1, 1)
      if (Math.abs(gx - engine.gravity.x) > 0.05) wekAlles() // slapende blikjes voelen zwaartekracht niet
      engine.gravity.x = gx
    }
    o.canvas.addEventListener('pointermove', opBeweeg)
    o.canvas.addEventListener('pointerdown', vraagGyroscoopToestemming)
    window.addEventListener('deviceorientation', opKantel)
    opruimen.push(() => {
      o.canvas.removeEventListener('pointermove', opBeweeg)
      o.canvas.removeEventListener('pointerdown', vraagGyroscoopToestemming)
      window.removeEventListener('deviceorientation', opKantel)
    })
  }

  function duwBlikjes() {
    if (Math.hypot(duw.vx, duw.vy) < 1 || muisBeperking?.body) return
    for (const { body } of blikjes) {
      const afstand = Math.hypot(body.position.x - duw.x, body.position.y - duw.y)
      if (afstand > 80) continue
      const kracht = (1 - afstand / 80) * 0.5
      Sleeping.set(body, false)
      Body.setVelocity(body, {
        x: body.velocity.x + klem(duw.vx, -30, 30) * kracht,
        y: body.velocity.y + klem(duw.vy, -30, 30) * kracht,
      })
    }
    duw.vx = duw.vy = 0
  }

  // --- De lus ---
  let vorige = performance.now()
  let frameMs = 1000 / 60
  let frames = 0
  let teTraag = false // gemiddeld onder 50 fps: geen nieuwe natuurkunde-blikjes meer
  let leegGemeld = false
  let versnelling = 1 // 2 bij overslaan
  let raf = 0

  function stap(nu: number) {
    const dt = Math.min(nu - vorige, 50) // na een hapering niet in één keer vooruit springen
    vorige = nu
    scene += dt
    frames++
    frameMs = frameMs * 0.9 + dt * 0.1
    if (frames > 20 && frameMs > 1000 / 50) teTraag = true

    while (gepland.length && gepland[0].t <= scene) {
      const { doe, golf } = gepland.shift()!
      if (!(golf && teTraag)) doe() // te traag toestel: de rest van de stortbui overslaan
    }

    duwBlikjes()
    Engine.update(engine, Math.min(dt, 1000 / 30))

    for (const lijst of [achterlijst, voorlijst])
      for (const z of lijst) {
        if (vallen) z.vy += 0.004 * versnelling * dt
        z.x += z.vx * dt
        z.y += z.vy * dt
        z.hoek += z.draai * dt
      }
    for (let i = druppels.length - 1; i >= 0; i--) {
      const d = druppels[i]
      d.vy += 0.0016 * dt
      d.x += d.vx * dt
      d.y += d.vy * dt
      d.leven -= dt / 450
      if (d.leven <= 0) druppels.splice(i, 1)
    }

    // Na het wegvallen: melden zodra niets meer in beeld is (dan pas mag het scherm weg, nooit eerder)
    if (vallen && !leegGemeld) {
      const weg = (y: number, h: number) => y - h > H
      if (
        blikjes.every((k) => weg(k.body.position.y, k.h)) &&
        [...achterlijst, ...voorlijst].every((z) => weg(z.y, z.h)) &&
        !druppels.length
      ) {
        leegGemeld = true
        o.bij?.leeg?.()
      }
    }

    tekenZwevers(achter, achterlijst, achterSprite)
    tekenMidden()
    tekenZwevers(voor, voorlijst, voorSprite)
    // Een bui die blijft liggen (footer): als alles slaapt, niet elk frame blijven tekenen
    const klaar = o.bui && !vallen && !gepland.length && !druppels.length && blikjes.every((k) => k.body.isSleeping)
    if (!klaar) raf = requestAnimationFrame(stap)
  }
  raf = requestAnimationFrame(stap)

  // Pauzeren als het tabblad verborgen is (de scenetijd loopt dan ook niet door)
  const opZichtbaar = () => {
    cancelAnimationFrame(raf)
    if (!document.hidden) {
      vorige = performance.now()
      raf = requestAnimationFrame(stap)
    }
  }
  document.addEventListener('visibilitychange', opZichtbaar)
  opruimen.push(() => document.removeEventListener('visibilitychange', opZichtbaar))

  /** Het allerlaatste blikje van de uitgang: snel, ergens in het midden, met een schok als het neerkomt. */
  function slamBlik() {
    voegToe(B * willekeurig(0.35, 0.65), -breedte * 1.6, 2.2)
    blikjes[blikjes.length - 1].body.plugin.slam = true
  }

  /**
   * De vloer (en de knop) valt weg: alle blikjes vallen uit beeld.
   * spreiding: ms waarover de vloerstukken van links naar rechts wegvallen. snel: 2 = overslaan (dubbel zo snel).
   */
  function laatVallen({ spreiding = 0, snel = 1 }: { spreiding?: number; snel?: number } = {}) {
    if (vallen) return
    vallen = true
    versnelling = snel
    gepland.length = 0
    Composite.remove(wereld, obstakels)
    if (muisBeperking) Composite.remove(wereld, muisBeperking)
    engine.gravity.x = 0
    engine.gravity.y = 2.6 * snel
    vloerDelen.forEach((deel, i) => {
      const doe = () => {
        Composite.remove(wereld, deel)
        // Blikjes boven dit stuk wakker maken en een extra draai geven
        for (const { body } of blikjes)
          if (body.bounds.max.x > deel.bounds.min.x && body.bounds.min.x < deel.bounds.max.x) {
            Sleeping.set(body, false)
            Body.setAngularVelocity(body, body.angularVelocity + willekeurig(-0.12, 0.12))
          }
      }
      if (spreiding <= 0) doe()
      else gepland.push({ t: scene + (i / (DELEN - 1)) * spreiding, doe })
    })
    gepland.sort((a, b) => a.t - b.t)
  }

  return {
    laatVallen,
    slamBlik,
    stop() {
      cancelAnimationFrame(raf)
      opruimen.forEach((f) => f())
      Events.off(engine)
      Composite.clear(wereld, false)
      Engine.clear(engine)
    },
  }
}
