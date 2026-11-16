import { useRef, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { useInBeeldEnVrij } from '../lib/intrede'

/**
 * Titel met een rode "geschilderde" penseelstreek erachter.
 * De streek wordt van links naar rechts "geverfd" (scaleX 0 → 1) zodra hij in beeld komt (en de pagina vrij is).
 */
export function PenseelTitel({
  children,
  className = '',
  vrij,
  vertraging = 0,
}: {
  children: ReactNode
  className?: string
  /** Zelf bepalen wanneer de streek geverfd wordt (takeover-hero), i.p.v. zodra hij in beeld komt. */
  vrij?: boolean
  vertraging?: number
}) {
  const opSignaal = vrij !== undefined
  const ref = useRef<HTMLSpanElement>(null)
  const zichtbaar = useInBeeldEnVrij(ref)
  return (
    // Tout Bien: marge in em (groeit mee met de letter), rechts wat meer voor het schuin aflopende italic,
    // anders valt de laatste letter buiten de rode streek (crème op crème: "SPEELSCHEM")
    <span ref={ref} className={`relative inline-block px-4 py-1 toutbien:px-[0.3em] toutbien:pr-[0.45em] ${className}`}>
      <motion.svg
        viewBox="0 0 300 60"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full origin-left text-red-600"
        initial={{ scaleX: 0 }}
        {...(opSignaal
          ? { animate: { scaleX: vrij ? 1 : 0 }, transition: { duration: 0.45, ease: 'easeOut', delay: vertraging } }
          : { animate: { scaleX: zichtbaar ? 1 : 0 }, transition: { duration: 0.5, ease: 'easeOut', delay: 0.2 } })}
      >
        <path
          fill="currentColor"
          d="M6 14 C40 6 90 10 140 7 S240 4 292 9 L297 18 288 24 298 32 290 40 296 49 C250 55 180 52 120 55 S40 56 8 52 L2 44 10 37 1 29 9 21z"
        />
      </motion.svg>
      <span className="relative toutbien:text-white">{children}</span>
    </span>
  )
}
