import { Link } from 'react-router-dom'
import { motion, useMotionTemplate, useReducedMotion } from 'framer-motion'
import { useKantel, vraagGyroscoopToestemming } from '../../hooks/useKantel'
import type { Speler } from '../../types'
import { isKapitein } from '../../lib/spelers'
import { isGeblesseerd } from './BlessureIcoon'
import { KaartVoorkant } from './KaartVoorkant'

/**
 * FIFA-kaart van een speler. Klik → naar zijn profiel met alle stats.
 * - Kantelt mee met muis of gsm (useKantel) met een holografische glans erover.
 * - layoutId zorgt dat Motion deze kaart herkent op de detailpagina en hem ernaartoe laat "vliegen".
 */
export function SpelerKaart({ speler }: { speler: Speler }) {
  const minderBeweging = useReducedMotion() ?? false
  const { rotateX, rotateY, glansX, glansY, handlers } = useKantel(!minderBeweging)

  // Twee lagen glans: een lichtvlek waar je muis is + een regenboogstreep die meeschuift
  const glans = useMotionTemplate`radial-gradient(circle at ${glansX} ${glansY}, rgb(255 255 255 / 0.35), transparent 45%),
    linear-gradient(115deg, transparent 25%, rgb(241 144 41 / 0.25) ${glansX}, rgb(8 72 184 / 0.35), transparent 75%)`

  return (
    <motion.div layoutId={`kaart-${speler.nummer}`} className="aspect-[5/7] [perspective:900px]">
      <motion.div style={{ rotateX, rotateY }} {...handlers} className="h-full w-full">
        <Link
          to={`/spelers/${speler.nummer}`}
          onClick={vraagGyroscoopToestemming}
          aria-label={`Bekijk de stats van ${speler.naam}${isKapitein(speler.nummer) ? ' (kapitein)' : ''}${isGeblesseerd(speler.status) ? ' (geblesseerd)' : ''}`}
          className="relative block h-full w-full rounded-2xl transition-shadow hover:shadow-2xl hover:shadow-royal-500/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400"
        >
          <KaartVoorkant speler={speler} />
          {!minderBeweging && (
            <motion.span
              aria-hidden="true"
              style={{ backgroundImage: glans }}
              className="pointer-events-none absolute inset-0 rounded-2xl mix-blend-color-dodge"
            />
          )}
        </Link>
      </motion.div>
    </motion.div>
  )
}
