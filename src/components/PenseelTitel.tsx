import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

/**
 * Titel met een rode "geschilderde" penseelstreek erachter.
 * De streek wordt van links naar rechts "geverfd" (scaleX 0 → 1) zodra hij in beeld komt.
 */
export function PenseelTitel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span className={`relative inline-block px-4 py-1 ${className}`}>
      <motion.svg
        viewBox="0 0 300 60"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full origin-left text-red-600"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
      >
        <path
          fill="currentColor"
          d="M6 14 C40 6 90 10 140 7 S240 4 292 9 L297 18 288 24 298 32 290 40 296 49 C250 55 180 52 120 55 S40 56 8 52 L2 44 10 37 1 29 9 21z"
        />
      </motion.svg>
      <span className="relative">{children}</span>
    </span>
  )
}
