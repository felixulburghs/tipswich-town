import { motion } from 'framer-motion'
import { Hero } from '../components/Hero'
import { Looptekst } from '../components/Looptekst'
import { SPONSOR_TAKEOVER } from '../config'
import { useOpkomst } from '../lib/intrede'

export function Home() {
  const o = useOpkomst()
  return (
    <>
      <Hero />
      {SPONSOR_TAKEOVER && (
        <motion.div {...o(8, { opacity: 0, y: 20 })}>
          <Looptekst />
        </motion.div>
      )}
    </>
  )
}
