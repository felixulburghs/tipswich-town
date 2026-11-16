import Matter from 'matter-js'
import { vraagGyroscoopToestemming } from '../hooks/useKantel'

/**
 * Vallende blikjes met echte natuurkunde (matter-js), getekend op één <canvas>.
 * Gebruikt door de blikjesregen bij het openen van de site, en later door de footer.
 * Dit bestand (en matter-js) wordt pas geladen met import() als het nodig is,
 * zodat het de eerste weergave van de site nooit vertraagt.
 */

const { Engine, Bodies, Body, Composite, Mouse, MouseConstraint } = Matter

const BEELDEN = { pils: '/sponsors/can-pils.png', rouge: '/sponsors/can-rouge.png' }
type Soort = keyof typeof BEELDEN

export type BlikjesOpties = {
  canvas: HTMLCanvasElement
  aantal: number
  breedte: number // breedte van een blikje op het scherm, in CSS-pixels
  rougeKans: number // 0.25 = ongeveer 3 Pils per Rouge; 0 = enkel Pils
  regenDuurMs: number // over hoeveel tijd de blikjes binnenvallen
  interactief: boolean // muis duwen/gooien, gsm vegen en kantelen
  stil?: boolean // "minder beweging": bereken de stapel in stilte en teken één beeld
}

const GROOTTE_MIN = 0.88
const GROOTTE_MAX = 1.12
const willekeurig = (min: number, max: number) => min + Math.random() * (max - min)

/**
 * Hoe breed de voorbereide (gecachte) afbeelding wordt, in echte pixels:
 * groot genoeg voor het grootste blikje op dit scherm, maar nooit groter dan het bestand zelf.
 */
export function cacheBreedte(cssBreedte: number, dpr: number, bestandBreedte: number) {
  return Math.min(Math.round(cssBreedte * GROOTTE_MAX * dpr), bestandBreedte)
}
console.assert(cacheBreedte(120, 2, 268) === 268 && cacheBreedte(90, 1, 445) === 101, 'cacheBreedte')

/** Laadt een blikje één keer en schaalt het één keer naar schermformaat (nooit elk frame opnieuw). */
async function voorbereid(src: string, cssBreedte: number, dpr: number) {
  const img = new Image()
  img.src = src
  await img.decode()
  const b = cacheBreedte(cssBreedte, dpr, img.naturalWidth)
  const h = Math.round((b * img.naturalHeight) / img.naturalWidth)
  const cache = document.createElement('canvas')
  cache.width = b
  cache.height = h
  const ctx = cache.getContext('2d')!
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, 0, 0, b, h)
  return { cache, verhouding: h / b }
}

export async function startBlikjes(o: BlikjesOpties) {
  const { canvas } = o
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const B = canvas.clientWidth
  const H = canvas.clientHeight
  canvas.width = Math.round(B * dpr)
  canvas.height = Math.round(H * dpr)
  const ctx = canvas.getContext('2d')!

  const [pils, rouge] = await Promise.all([
    voorbereid(BEELDEN.pils, o.breedte, dpr),
    o.rougeKans > 0 ? voorbereid(BEELDEN.rouge, o.breedte, dpr) : null,
  ])
  const beeld = { pils, rouge: rouge ?? pils }

  const engine = Engine.create({ enableSleeping: false })
  const wereld = engine.world

  // Vloer en zijmuren net buiten beeld; de muren zijn hoog zodat opgegooide blikjes niet ontsnappen
  const dik = 200
  const vloer = Bodies.rectangle(B / 2, H + dik / 2, B * 3, dik, { isStatic: true })
  const muren = [
    Bodies.rectangle(-dik / 2, 0, dik, H * 6, { isStatic: true }),
    Bodies.rectangle(B + dik / 2, 0, dik, H * 6, { isStatic: true }),
  ]
  Composite.add(wereld, [vloer, ...muren])

  type Blik = { body: any; soort: Soort; b: number; h: number } // eslint-disable-line @typescript-eslint/no-explicit-any
  const blikjes: Blik[] = []

  function voegToe(y: number) {
    const soort: Soort = Math.random() < o.rougeKans ? 'rouge' : 'pils'
    const b = o.breedte * willekeurig(GROOTTE_MIN, GROOTTE_MAX)
    const h = b * beeld[soort].verhouding
    const body = Bodies.rectangle(willekeurig(b / 2, B - b / 2), y, b * 0.92, h * 0.97, {
      chamfer: { radius: b * 0.2 },
      angle: willekeurig(-Math.PI, Math.PI),
      restitution: 0.35,
      friction: 0.25,
      frictionAir: 0.008,
      density: 0.0015,
    })
    Body.setAngularVelocity(body, willekeurig(-0.2, 0.2))
    Composite.add(wereld, body)
    blikjes.push({ body, soort, b, h })
  }

  function teken() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, B, H)
    for (const { body, soort, b, h } of blikjes) {
      ctx.save()
      ctx.translate(body.position.x, body.position.y)
      ctx.rotate(body.angle)
      ctx.drawImage(beeld[soort].cache, -b / 2, -h / 2, b, h)
      ctx.restore()
    }
  }

  // Minder beweging: alles in één keer laten vallen, stilletjes doorrekenen, één beeld tekenen
  if (o.stil) {
    for (let i = 0; i < o.aantal; i++) voegToe(willekeurig(-H, H * 0.5))
    for (let i = 0; i < 240; i++) Engine.update(engine, 1000 / 60)
    teken()
    return { laatVallen() {}, stop() {} }
  }

  // --- Interactie ---
  const opruimen: (() => void)[] = []
  let muisBeperking: any = null // eslint-disable-line @typescript-eslint/no-explicit-any
  const duw = { x: -999, y: -999, vx: 0, vy: 0 }

  if (o.interactief) {
    // Grijpen en gooien (muis én vinger): matter-js regelt dat zelf
    const muis = Mouse.create(canvas)
    muis.pixelRatio = dpr
    // matter-js blokkeert anders het scrollwiel
    muis.element.removeEventListener('wheel', muis.mousewheel)
    muis.element.removeEventListener('mousewheel', muis.mousewheel)
    muisBeperking = MouseConstraint.create(engine, {
      mouse: muis,
      constraint: { stiffness: 0.2, render: { visible: false } },
    })
    Composite.add(wereld, muisBeperking)

    // Duwen: een muis die over de blikjes beweegt geeft ze een zetje in dezelfde richting
    const opBeweeg = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      const r = canvas.getBoundingClientRect()
      const x = e.clientX - r.left
      const y = e.clientY - r.top
      duw.vx = x - duw.x
      duw.vy = y - duw.y
      duw.x = x
      duw.y = y
    }
    // Kantelen op gsm: de blikjes glijden mee (iPhone vraagt toestemming bij de eerste tik)
    const opKantel = (e: DeviceOrientationEvent) => {
      if (e.gamma == null) return
      engine.gravity.x = Math.max(-1, Math.min(1, e.gamma / 40))
    }
    canvas.addEventListener('pointermove', opBeweeg)
    canvas.addEventListener('pointerdown', vraagGyroscoopToestemming)
    window.addEventListener('deviceorientation', opKantel)
    opruimen.push(() => {
      canvas.removeEventListener('pointermove', opBeweeg)
      canvas.removeEventListener('pointerdown', vraagGyroscoopToestemming)
      window.removeEventListener('deviceorientation', opKantel)
    })
  }

  function duwBlikjes() {
    const snelheid = Math.hypot(duw.vx, duw.vy)
    if (snelheid < 1 || muisBeperking?.body) return
    for (const { body } of blikjes) {
      const afstand = Math.hypot(body.position.x - duw.x, body.position.y - duw.y)
      if (afstand > 80) continue
      const kracht = (1 - afstand / 80) * 0.5
      Body.setVelocity(body, {
        x: body.velocity.x + Math.max(-30, Math.min(30, duw.vx)) * kracht,
        y: body.velocity.y + Math.max(-30, Math.min(30, duw.vy)) * kracht,
      })
    }
    duw.vx = duw.vy = 0
  }

  // --- De lus: regen laten vallen, rekenen, tekenen ---
  const start = performance.now()
  const tussenTijd = o.regenDuurMs / o.aantal
  let vorige = start
  let frameMs = 1000 / 60 // gemiddelde frametijd
  let frames = 0
  let regenStopt = false // te traag toestel: geen extra blikjes meer
  let raf = 0

  function stap(nu: number) {
    const dt = nu - vorige
    vorige = nu
    frames++
    frameMs = frameMs * 0.9 + dt * 0.1
    if (frames > 15 && frameMs > 1000 / 50) regenStopt = true

    const moetEr = Math.min(o.aantal, Math.floor((nu - start) / tussenTijd) + 1)
    while (!regenStopt && blikjes.length < moetEr) voegToe(-o.breedte * 2 - Math.random() * 80)

    duwBlikjes()
    Engine.update(engine, Math.min(dt, 1000 / 30))
    teken()
    raf = requestAnimationFrame(stap)
  }
  raf = requestAnimationFrame(stap)

  // Pauzeren als het tabblad verborgen is
  const opZichtbaar = () => {
    cancelAnimationFrame(raf)
    if (!document.hidden) {
      vorige = performance.now()
      raf = requestAnimationFrame(stap)
    }
  }
  document.addEventListener('visibilitychange', opZichtbaar)
  opruimen.push(() => document.removeEventListener('visibilitychange', opZichtbaar))

  return {
    /** De vloer valt weg: alle blikjes vallen uit beeld. */
    laatVallen() {
      regenStopt = true
      Composite.remove(wereld, vloer)
      if (muisBeperking) Composite.remove(wereld, muisBeperking)
      engine.gravity.x = 0
      engine.gravity.y = 1.6
    },
    stop() {
      cancelAnimationFrame(raf)
      opruimen.forEach((f) => f())
      Composite.clear(wereld, false)
      Engine.clear(engine)
    },
  }
}
