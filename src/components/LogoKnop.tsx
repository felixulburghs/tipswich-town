import { useRef, useState } from 'react'
import { MotionConfig, motion, useAnimate } from 'framer-motion'
import { BIER_DUUR_MS, BierVulling } from './BierVulling'

/** Het geluid dat speelt als je op het logo drukt. Zet het bestand in public/media/. */
const GELUID = '/media/logo-geluid.mp3'
const LOGO = '/logo.webp'

/**
 * Het grote clublogo op de homepagina, als knop: druk erop en je hoort het clubgeluid.
 * - Het mp3-bestand wordt pas geladen bij de eerste druk (niet bij het openen van de pagina).
 * - Nog eens drukken start het geluid opnieuw vanaf het begin.
 * - Ontbreekt het bestand, dan gebeurt er gewoon niets (geen foutmelding voor de bezoeker).
 * - Animatie: het logo veert in en uit, een lichtstreep glijdt over het schild en
 *   één witte ring rimpelt naar buiten, en het scherm loopt vol bier (BierVulling).
 *
 * Waarom reducedMotion="never" hier? De rest van de site respecteert "minder beweging"
 * (App.tsx: reducedMotion="user"). Dit effect start alleen als iemand zélf bewust op het
 * logo klikt, dus hier spelen we het altijd af. De MotionConfig moet rond de component
 * staan die useAnimate gebruikt, daarom zijn er twee lagen: LogoKnop en LogoKnopInhoud.
 */
export function LogoKnop() {
  return (
    <MotionConfig reducedMotion="never">
      <LogoKnopInhoud />
    </MotionConfig>
  )
}

function LogoKnopInhoud() {
  const geluid = useRef<HTMLAudioElement | null>(null)
  const [logo, animeer] = useAnimate()
  // Elke klik krijgt een nieuw nummer; als "key" gebruikt laat React de streep en ring
  // opnieuw aanmaken, zodat hun animatie bij elke klik van voren af aan speelt.
  const [klik, setKlik] = useState(0)
  const [bier, setBier] = useState(false) // staat het scherm vol bier?
  const bierTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  function speel() {
    geluid.current ??= new Audio(GELUID)
    geluid.current.currentTime = 0
    geluid.current.play().catch(() => {
      // Bestand ontbreekt of de browser blokkeert het: stil negeren
    })

    // Even indrukken, dan opveren voorbij de normale maat, dan terug
    animeer(logo.current, { scale: [1, 0.88, 1.1, 1] }, { duration: 0.5, times: [0, 0.2, 0.55, 1], ease: 'easeOut' })
    setKlik((k) => k + 1)

    // Scherm vol bier; opnieuw klikken tijdens het bier start de timer opnieuw
    setBier(true)
    clearTimeout(bierTimer.current)
    bierTimer.current = setTimeout(() => setBier(false), BIER_DUUR_MS)
  }

  return (
    <motion.button
      type="button"
      onClick={speel}
      aria-label="Tipswich Town-logo: speel het clubgeluid"
      initial={{ opacity: 0, y: -20, rotate: -8 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 14 }}
      whileHover={{ scale: 1.04 }}
      className="relative isolate mb-5 cursor-pointer rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-400"
    >
      {/* Schokgolf: één witte ring die naar buiten rimpelt */}
      {klik > 0 && (
        <motion.span
          key={`ring-${klik}`}
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-1/2 -z-10 -mt-20 -ml-20 size-40 rounded-full border-2 border-white sm:-mt-24 sm:-ml-24 sm:size-48"
          initial={{ scale: 0.6, opacity: 0.8 }}
          animate={{ scale: 1.7, opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      )}

      <span ref={logo} className="relative block">
        <img
          src={LOGO}
          alt=""
          width={321}
          height={400}
          className="h-32 w-auto drop-shadow-[0_8px_28px_rgb(8_72_184/0.7)] sm:h-40"
        />

        {/* Lichtstreep over het schild. Het logo dient als masker (mask-image),
            zodat de streep enkel óp het schild zichtbaar is en niet in de lege hoeken. */}
        {klik > 0 && (
          <motion.span
            key={`glans-${klik}`}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              maskImage: `url(${LOGO})`,
              WebkitMaskImage: `url(${LOGO})`,
              maskSize: '100% 100%',
              WebkitMaskSize: '100% 100%',
              backgroundImage: 'linear-gradient(105deg, transparent 35%, rgb(255 255 255 / 0.85) 50%, transparent 65%)',
              backgroundSize: '250% 100%',
            }}
            initial={{ backgroundPosition: '120% 0' }}
            animate={{ backgroundPosition: '-20% 0' }}
            transition={{ duration: 0.6, ease: 'easeInOut', delay: 0.08 }}
          />
        )}
      </span>

      {/* Scherm vol bier (key={klik}: bij een nieuwe klik begint het vullen opnieuw) */}
      {bier && <BierVulling key={klik} />}
    </motion.button>
  )
}
