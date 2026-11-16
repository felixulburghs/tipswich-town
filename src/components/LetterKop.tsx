import { motion } from 'framer-motion'

/**
 * Tekst waarvan de letters één voor één binnenspringen.
 * - Elk woord is één blok dat niet breekt (whitespace-nowrap), zodat een woord nooit midden in
 *   de letters op een nieuwe regel springt.
 * - Schermlezers lezen de gewone zin (sr-only); de losse letters zijn voor hen verborgen.
 */
export function LetterKop({
  tekst,
  className = '',
  vertraging = 0.5,
}: {
  tekst: string
  className?: string
  vertraging?: number
}) {
  let n = 0
  return (
    <p className={className}>
      <span className="sr-only">{tekst}</span>
      <span aria-hidden="true">
        {tekst.split(' ').map((woord, w) => (
          <span key={w}>
            {w > 0 && ' '}
            <span className="inline-block whitespace-nowrap">
              {[...woord].map((letter) => {
                const i = n++
                return (
                  <motion.span
                    key={i}
                    className="inline-block"
                    initial={{ opacity: 0, y: '0.6em', rotate: 10 }}
                    animate={{ opacity: 1, y: 0, rotate: 0 }}
                    transition={{ delay: vertraging + i * 0.025, type: 'spring', stiffness: 500, damping: 22 }}
                  >
                    {letter}
                  </motion.span>
                )
              })}
            </span>
          </span>
        ))}
      </span>
    </p>
  )
}
