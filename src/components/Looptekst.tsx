import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'framer-motion'

const TEKST = 'Tout Bien × Tipswich Town × Up the Tips × '
const BASIS = 4 // % van de band per seconde als je niet scrolt

/**
 * Rode band met lopende tekst onder de hero (tijdens de takeover).
 * Hoe sneller je scrolt, hoe sneller hij loopt en hoe schuiner hij hangt.
 * - useVelocity(scrollY) = scrollsnelheid; useSpring maakt die zacht, zodat het niet schokt.
 * - De tekst staat er twee keer in: na de helft springt hij terug naar 0, zonder dat je het ziet.
 */
export function Looptekst() {
  const minderBeweging = useReducedMotion()
  const { scrollY } = useScroll()
  const snelheid = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 })
  const extra = useTransform(snelheid, (v) => Math.min(Math.abs(v) / 300, 8)) // tot 9× zo snel
  const scheef = useTransform(snelheid, [-2500, 2500], [8, -8], { clamp: true })
  const x = useMotionValue(0)
  const xProcent = useTransform(x, (v) => `${v}%`)

  useAnimationFrame((_, dt) => {
    if (minderBeweging) return
    let nieuw = x.get() - (BASIS * (1 + extra.get()) * dt) / 1000
    if (nieuw <= -50) nieuw += 50
    x.set(nieuw)
  })

  const stuk = TEKST.repeat(4)
  return (
    // mb-24: ruimte voor de blikjes die op de rand van de footer vallen
    <div className="mb-24 overflow-hidden bg-red-600 py-3">
      <p className="sr-only">Tout Bien × Tipswich Town × Up the Tips</p>
      <motion.div
        aria-hidden="true"
        style={{ x: xProcent, skewX: minderBeweging ? 0 : scheef }}
        className="flex w-max font-display text-2xl whitespace-nowrap uppercase [font-stretch:125%] sm:text-4xl"
      >
        <span className="pr-[0.3em]">{stuk}</span>
        <span className="pr-[0.3em]">{stuk}</span>
      </motion.div>
    </div>
  )
}
