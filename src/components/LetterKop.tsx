import { motion, useReducedMotion } from 'framer-motion'
import { useIntrede } from '../lib/intrede'

/**
 * Tekst waarvan de letters één voor één binnenspringen, zodra de intrede van de pagina vrij is
 * (lib/intrede.ts), plus `vertraging` seconden.
 * - Elk woord is één blok dat niet breekt (whitespace-nowrap), zodat een woord nooit midden in
 *   de letters op een nieuwe regel springt.
 * - Schermlezers lezen de gewone tekst (sr-only); de losse letters zijn voor hen verborgen.
 * - als="span": binnen een titel (bv. TIPSWICH in de h1).
 * - naamOpOuder: de ouder (bv. de h1) draagt al een aria-label; dan geen extra sr-only kopie,
 *   anders staat de tekst er voor zoekmachines dubbel ("TipswichTipswich").
 */
export function LetterKop({
  tekst,
  className = '',
  vertraging = 0,
  als = 'p',
  naamOpOuder = false,
}: {
  tekst: string
  className?: string
  vertraging?: number
  als?: 'p' | 'span'
  naamOpOuder?: boolean
}) {
  const { vrij } = useIntrede()
  const minder = useReducedMotion() ?? false // minder beweging: meteen leesbaar, geen letter-voor-letter
  const Blok = als
  let n = 0
  return (
    <Blok className={className}>
      {!naamOpOuder && <span className="sr-only">{tekst}</span>}
      <span aria-hidden="true">
        {tekst.split(' ').map((woord, w) => (
          <span key={w}>
            {w > 0 && ' '}
            <span className="inline-block whitespace-nowrap">
              {[...woord].map((letter) => {
                const i = n++
                const van = { opacity: 0, y: '0.6em', rotate: 10 }
                return (
                  <motion.span
                    key={i}
                    className="inline-block"
                    initial={van}
                    animate={vrij || minder ? { opacity: 1, y: 0, rotate: 0 } : van}
                    transition={
                      minder
                        ? { duration: 0 }
                        : { delay: vertraging + i * 0.025, type: 'spring', stiffness: 500, damping: 22 }
                    }
                  >
                    {letter}
                  </motion.span>
                )
              })}
            </span>
          </span>
        ))}
      </span>
    </Blok>
  )
}
