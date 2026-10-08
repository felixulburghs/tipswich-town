import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { reeks, seizoen, volgendeMatch } from '../lib/matchen'
import { Countdown } from './Countdown'
import { Kroon } from './Kroon'
import { PenseelTitel } from './PenseelTitel'

export function Hero() {
  const match = volgendeMatch()

  return (
    <header className="relative isolate flex min-h-svh flex-col items-center justify-center overflow-hidden px-4 py-16 text-center">
      {/* "Sportzaal": blauwe lichtbundels van bovenaf op een donkere achtergrond */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-navy-950"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 60% 45% at 50% 0%, rgb(8 72 184 / 0.55), transparent 70%),
            radial-gradient(ellipse 30% 60% at 15% 0%, rgb(8 40 136 / 0.5), transparent 70%),
            radial-gradient(ellipse 30% 60% at 85% 0%, rgb(8 40 136 / 0.5), transparent 70%),
            linear-gradient(to bottom, transparent 60%, #080838)`,
        }}
      />

      <motion.img
        src="/logo.png"
        alt="Logo Tipswich Town"
        width={150}
        height={150}
        initial={{ opacity: 0, y: -20, rotate: -8 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 14 }}
        className="mb-5 size-24 rounded-2xl shadow-xl shadow-royal-500/40 ring-2 ring-white/20 sm:size-28"
      />

      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-2 text-sm font-semibold text-white/70"
      >
        <Kroon className="h-3 text-orange-400" />
        {reeks}, seizoen {seizoen}
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="mt-4 font-display text-6xl leading-none uppercase sm:text-8xl"
      >
        Tipswich
        <br />
        <PenseelTitel>Town</PenseelTitel>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-5 font-display text-xl tracking-wide text-white/90 uppercase sm:text-2xl"
      >
        Up the Tips!
      </motion.p>

      <div className="mt-10 flex w-full justify-center">
        {match ? (
          <Countdown match={match} />
        ) : (
          <p className="font-display text-2xl uppercase">Seizoen afgelopen – tot volgend jaar!</p>
        )}
      </div>

      <Link
        to="/kalender"
        className="mt-4 text-sm font-semibold text-white/80 underline decoration-red-600 decoration-2 underline-offset-4 hover:text-white"
      >
        Bekijk het volledige speelschema
      </Link>

      <a
        href="https://www.instagram.com/tipswich_town/"
        target="_blank"
        rel="noreferrer"
        className="mt-8 rounded-full bg-red-600 px-6 py-3 font-display tracking-wider uppercase transition hover:scale-105 hover:bg-red-600/90 active:scale-95"
      >
        Volg @tipswich_town
      </a>
    </header>
  )
}
