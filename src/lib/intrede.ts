import { createContext, useContext } from 'react'
import { useReducedMotion, type TargetAndTransition, type Transition } from 'framer-motion'

/**
 * De intrede van de homepagina tijdens de takeover: één signaal voor de hele pagina.
 * - vrij: mag de cascade beginnen? Na de blikjesregen pas als het rode scherm wegtrekt,
 *   bij een gewoon bezoek meteen.
 * - kruis: mag de × tussen schild en logo al zichtbaar zijn? (Na de regen pas als de vliegende
 *   × uit de titel er precies op geland is.)
 */
export type Intrede = { vrij: boolean; naRegen: boolean; kruis: boolean }
export const IntredeContext = createContext<Intrede>({ vrij: true, naRegen: false, kruis: true })
export const useIntrede = () => useContext(IntredeContext)

/** Tijd tussen twee stappen van de cascade (nav, logo's, titel, penseel, kop, kaarten, ...). */
export const STAP = 0.06

type Van = {
  opacity?: number
  x?: number | string
  y?: number | string
  scale?: number
  scaleX?: number
  rotate?: number
}
const eind = (van: Van): TargetAndTransition =>
  Object.fromEntries(Object.keys(van).map((k) => [k, k.startsWith('scale') || k === 'opacity' ? 1 : 0]))

/**
 * Props voor één element van de cascade: blijft in zijn begin-stand (`van`) tot de intrede vrij is,
 * en komt dan op zijn beurt (stap × 60 ms) binnen. Enkel transform en opacity, dus geen verspringen.
 * Minder beweging: meteen in de eindstand, zonder animatie.
 */
export function useOpkomst() {
  const { vrij } = useIntrede()
  const minder = useReducedMotion() ?? false
  return (stap: number, van: Van, extra: Transition = {}) =>
    minder
      ? { initial: false as const }
      : {
          initial: van,
          animate: vrij ? eind(van) : van,
          transition: {
            // rustig genoeg dat elementen nog bewegen als het rode scherm ze vrijgeeft (± 0,6 s)
            type: 'spring' as const,
            stiffness: 220,
            damping: 24,
            delay: stap * STAP,
            opacity: { duration: 0.45, delay: stap * STAP },
            ...extra,
          },
        }
}
