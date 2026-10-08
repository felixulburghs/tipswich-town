import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { reeks, seizoen, volgendeMatch } from '../lib/matchen'
import { berichten, nieuwsDatum } from '../lib/nieuws'
import { Countdown } from './Countdown'
import { Kroon } from './Kroon'
import { PenseelTitel } from './PenseelTitel'

export function Hero() {
  const match = volgendeMatch()
  const laatsteNieuws = berichten[0]

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
        src="/logo.webp"
        alt="Logo Tipswich Town"
        width={321}
        height={400}
        initial={{ opacity: 0, y: -20, rotate: -8 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 14 }}
        className="mb-5 h-32 w-auto drop-shadow-[0_8px_28px_rgb(8_72_184/0.7)] sm:h-40"
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

      {/* Laatste nieuwsbericht: hoog op de pagina zodat je het meteen ziet */}
      {laatsteNieuws && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.45 }}
          className="mt-8 w-full max-w-md"
        >
          <Link
            to={`/nieuws/${laatsteNieuws.slug}`}
            className="flex items-center gap-3 rounded-xl bg-navy-900/90 p-3 text-left shadow-lg shadow-red-600/20 ring-2 ring-red-600 transition hover:bg-navy-900 hover:shadow-red-600/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400"
          >
            <span className="flex shrink-0 items-center gap-1.5 rounded-md bg-red-600 px-2 py-1 font-display text-sm tracking-wide uppercase">
              {/* Pulserend bolletje; motion-safe: niet bij "minder beweging" */}
              <span className="relative flex size-2" aria-hidden="true">
                <span className="absolute inline-flex size-full rounded-full bg-white opacity-75 motion-safe:animate-ping" />
                <span className="relative inline-flex size-2 rounded-full bg-white" />
              </span>
              Nieuws
            </span>
            <span className="min-w-0 flex-1">
              <span className="line-clamp-2 font-display text-lg leading-tight uppercase">{laatsteNieuws.titel}</span>
              <span className="block text-xs text-white/60">{nieuwsDatum(laatsteNieuws)}</span>
            </span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true" className="size-4 shrink-0 text-white/80">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </Link>
        </motion.div>
      )}

      <div className="mt-8 flex w-full justify-center">
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

    </header>
  )
}
