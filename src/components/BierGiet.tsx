import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { BierLijf, Schuim, SchuimOnderrand } from './BierVulling'

/** Na zoveel ms staat het bier tot boven: dan wisselt App de pagina, onzichtbaar onder het bier. */
export const GIET_DICHT_MS = 300
const DUUR = 0.66 // s, alles samen (onder de 700 ms)

/**
 * Showpiece 2, de paginaovergang: goudgeel bier stijgt van onder met een deinende schuimrand,
 * bedekt het scherm, en zakt weer weg zodat de nieuwe pagina tevoorschijn komt.
 * Enkel transform (y, x van het schuim) en geen layout: blijft vloeiend op gsm.
 * Hetzelfde bier als bij het logo (BierLijf), maar ondoorzichtig.
 */
export function BierGiet() {
  const weg = window.innerHeight + 90 // helemaal onder het scherm, schuimkraag inbegrepen
  return createPortal(
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      <motion.div
        className="absolute inset-x-0 bottom-0 h-full"
        initial={{ y: weg }}
        animate={{ y: [weg, 0, 0, weg] }}
        // stijgen tot 0,28 s, even vol, dan leeglopen
        transition={{ duration: DUUR, times: [0, 0.42, 0.5, 1], ease: ['easeOut', 'linear', 'easeIn'] }}
      >
        <Schuim />
        <SchuimOnderrand />
        <BierLijf vol />
      </motion.div>
    </div>,
    document.body,
  )
}
