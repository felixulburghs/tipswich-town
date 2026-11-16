import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { SPONSOR, SPONSOR_KOP, SPONSOR_TAKEOVER } from '../config'
import { STAP, useIntrede, useOpkomst } from '../lib/intrede'
import { reeks, seizoen, volgendeMatch } from '../lib/matchen'
import { berichten, nieuwsDatum } from '../lib/nieuws'
import { Countdown } from './Countdown'
import { Kroon } from './Kroon'
import { LetterKop } from './LetterKop'
import { LogoKnop } from './LogoKnop'
import { PenseelTitel } from './PenseelTitel'

const MotionLink = motion.create(Link)

/**
 * De hero van de homepagina.
 * Tijdens de takeover komt alles binnen in één cascade (lib/intrede.ts), stap per stap:
 * 0 nav · 1 schild × logo · 2 TIPSWICH · 3 penseelstreek achter TOWN · 4 kop · 5 nieuws · 6 match · 7 link.
 * Na de blikjesregen begint die cascade pas als het rode scherm wegtrekt; anders meteen.
 * data-hand="schild|kruis|logo": de plekken waar de titel van de regen naartoe vliegt.
 * Zonder takeover: de oorspronkelijke animaties, ongewijzigd.
 */
export function Hero() {
  const match = volgendeMatch()
  const laatsteNieuws = berichten[0]
  const t = SPONSOR_TAKEOVER
  const o = useOpkomst()
  const { vrij, naRegen, kruis } = useIntrede()

  return (
    <header className="relative isolate flex min-h-svh flex-col items-center justify-center overflow-hidden px-4 py-16 text-center">
      {/* "Sportzaal": blauwe lichtbundels van bovenaf op een donkere achtergrond */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-navy-950"
        style={{ backgroundImage: 'var(--licht-zaal)' }}
      />

      {t ? (
        // Takeover: ons schild en het Tout Bien-logo naast elkaar, met een × ertussen
        <div className="mb-5 flex items-center gap-3 sm:gap-6">
          <motion.div data-hand="schild" {...o(1, { opacity: 0, scale: 0.85 })}>
            <LogoKnop eigenIntrede={false} />
          </motion.div>
          {/* Na de regen verschijnt deze × pas als de vliegende × er precies op geland is */}
          <motion.span
            data-hand="kruis"
            aria-hidden="true"
            className="-mt-5 font-display text-4xl text-red-600 [font-stretch:125%] sm:text-6xl"
            {...(naRegen ? { initial: false, style: { opacity: kruis ? 1 : 0 } } : o(1, { opacity: 0, scale: 0.85 }))}
          >
            ×
          </motion.span>
          <motion.div data-hand="logo" className="-mt-5" {...o(1, { opacity: 0, scale: 0.85 })}>
            <img src={SPONSOR.logo} alt={SPONSOR.naam} width={800} height={155} className="h-auto w-36 sm:w-60" />
          </motion.div>
        </div>
      ) : (
        <LogoKnop />
      )}

      <motion.div
        {...(t
          ? o(2, { opacity: 0, y: 12 })
          : { initial: { opacity: 0, y: -12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4 } })}
        className="flex items-center gap-2 text-sm font-semibold text-tekst/70"
      >
        <Kroon className="h-3 text-orange-400" />
        {reeks}, seizoen {seizoen}
      </motion.div>

      <motion.h1
        {...(t
          ? { initial: false }
          : {
              initial: { opacity: 0, scale: 0.9 },
              animate: { opacity: 1, scale: 1 },
              transition: { duration: 0.5, ease: 'easeOut' },
            })}
        className="mt-4 font-display text-6xl leading-none uppercase sm:text-8xl toutbien:text-[11.5vw] sm:toutbien:text-8xl"
      >
        {t ? <LetterKop als="span" tekst="Tipswich" className="block" vertraging={2 * STAP} /> : 'Tipswich'}
        {!t && <br />}
        <PenseelTitel {...(t ? { vrij, vertraging: 3 * STAP } : {})}>Town</PenseelTitel>
      </motion.h1>

      {t ? (
        <LetterKop
          tekst={SPONSOR_KOP}
          vertraging={4 * STAP}
          className="mt-6 max-w-2xl font-display text-2xl leading-tight text-balance text-red-600 uppercase [font-stretch:125%] sm:text-4xl"
        />
      ) : (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-5 font-display text-xl tracking-wide text-tekst/90 uppercase sm:text-2xl"
        >
          Up the Tips!
        </motion.p>
      )}

      {/* Laatste nieuwsbericht: hoog op de pagina zodat je het meteen ziet */}
      {laatsteNieuws && (
        <motion.div
          {...(t
            ? o(5, { opacity: 0, y: 16 })
            : {
                initial: { opacity: 0, y: 12 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.4, delay: 0.45 },
              })}
          className="mt-8 w-full max-w-md"
        >
          <Link
            to={`/nieuws/${laatsteNieuws.slug}`}
            className="flex items-center gap-3 rounded-xl bg-navy-900/90 p-3 text-left shadow-lg shadow-red-600/20 ring-2 ring-red-600 transition hover:bg-navy-900 hover:shadow-red-600/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400"
          >
            <span className="flex shrink-0 items-center gap-1.5 rounded-md bg-red-600 px-2 py-1 font-display text-sm tracking-wide uppercase toutbien:text-white">
              {/* Pulserend bolletje; motion-safe: niet bij "minder beweging" */}
              <span className="relative flex size-2" aria-hidden="true">
                <span className="absolute inline-flex size-full rounded-full bg-white opacity-75 motion-safe:animate-ping" />
                <span className="relative inline-flex size-2 rounded-full bg-white" />
              </span>
              Nieuws
            </span>
            <span className="min-w-0 flex-1">
              <span className="line-clamp-2 font-display text-lg leading-tight uppercase">{laatsteNieuws.titel}</span>
              <span className="block text-xs text-tekst-zacht">{nieuwsDatum(laatsteNieuws)}</span>
            </span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              aria-hidden="true"
              className="size-4 shrink-0 text-tekst/80"
            >
              <path d="M9 6l6 6-6 6" />
            </svg>
          </Link>
        </motion.div>
      )}

      <motion.div
        {...(t ? o(6, { opacity: 0, y: 24 }) : { initial: false })}
        className="mt-8 flex w-full justify-center"
      >
        {match ? (
          <Countdown match={match} eigenIntrede={!t} />
        ) : (
          <p className="font-display text-2xl uppercase">Seizoen afgelopen – tot volgend jaar!</p>
        )}
      </motion.div>

      <MotionLink
        to="/kalender"
        {...(t ? o(7, { opacity: 0, y: 10 }) : { initial: false })}
        className="mt-4 text-sm font-semibold text-tekst/80 underline decoration-red-600 decoration-2 underline-offset-4 hover:text-tekst"
      >
        Bekijk het volledige speelschema
      </MotionLink>
    </header>
  )
}
