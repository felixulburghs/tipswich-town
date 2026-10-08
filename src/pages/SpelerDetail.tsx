import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { DatumBlok } from '../components/kalender/MatchRij'
import { TegenstanderBadge } from '../components/kalender/TegenstanderBadge'
import { KaartVoorkant } from '../components/spelers/KaartVoorkant'
import { aftrapVan } from '../lib/matchen'
import { buren, naamDelen, spelerMet, statsVan } from '../lib/spelers'
import type { Speler } from '../types'

function StatBlok({ waarde, label }: { waarde: number; label: string }) {
  return (
    <div className="rounded-xl bg-navy-900/80 px-4 py-4 ring-1 ring-white/10">
      <p className="font-display text-5xl leading-none sm:text-6xl">{waarde}</p>
      <p className="mt-1 text-sm text-white/60">{label}</p>
    </div>
  )
}

function meervoud(n: number, een: string, meer: string) {
  return `${n} ${n === 1 ? een : meer}`
}

/** Knop naar de vorige of volgende speler. */
function BuurLink({ speler, richting }: { speler: Speler; richting: 'vorige' | 'volgende' }) {
  const pijl = richting === 'vorige' ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6'
  return (
    <Link
      to={`/spelers/${speler.nummer}`}
      className={`flex items-center gap-2 rounded-full px-4 py-2 ring-1 ring-white/20 transition hover:bg-white/10 ${
        richting === 'volgende' ? 'flex-row-reverse text-right' : ''
      }`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true" className="size-4 shrink-0">
        <path d={pijl} />
      </svg>
      <span className="flex flex-col leading-tight">
        <span className="text-xs text-white/60">{richting === 'vorige' ? 'Vorige' : 'Volgende'}</span>
        <span className="font-display tracking-wide uppercase">
          #{speler.nummer} {naamDelen(speler).achternaam}
        </span>
      </span>
    </Link>
  )
}

/** Profielpagina van één speler: kaart, stats en zijn goals per match. */
export function SpelerDetail() {
  const param = useParams().nummer
  const nummer = Number(param)
  const speler = spelerMet(nummer)

  if (!speler) {
    return (
      <main className="grid min-h-svh place-items-center bg-navy-950 px-4 text-center">
        <div>
          <p className="font-display text-4xl uppercase">Speler #{param} bestaat niet</p>
          <Link to="/spelers" className="mt-4 inline-block underline decoration-red-600 decoration-2 underline-offset-4">
            Terug naar de kern
          </Link>
        </div>
      </main>
    )
  }

  const stats = statsVan(nummer)
  const { voornaam, achternaam } = naamDelen(speler)
  const { vorige, volgende } = buren(nummer)

  return (
    <main
      className="min-h-svh overflow-hidden bg-navy-950 px-4 pt-20 pb-16"
      style={{ backgroundImage: 'radial-gradient(ellipse 70% 35% at 50% 0%, rgb(8 72 184 / 0.5), transparent 70%)' }}
    >
      <div className="mx-auto max-w-4xl">
        {/* Hero */}
        <section className="relative flex flex-col items-center gap-8 sm:flex-row sm:items-end">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-10 right-0 font-display text-[16rem] leading-none text-white/5 sm:text-[22rem]"
          >
            {speler.nummer}
          </span>

          {/* Zelfde layoutId als de kaart in het overzicht → Motion laat hem hierheen vliegen */}
          <motion.div layoutId={`kaart-${speler.nummer}`} className="aspect-[5/7] w-56 shrink-0 sm:w-64">
            <KaartVoorkant speler={speler} />
          </motion.div>

          <div className="relative text-center sm:text-left">
            <p className="text-lg text-white/70">{voornaam}</p>
            <h1 className="font-display text-6xl leading-none uppercase sm:text-8xl">{achternaam}</h1>
            <p className="mt-2 font-display text-2xl text-red-600">
              #{speler.nummer}
              {speler.positie && <span className="ml-3 text-white/70">{speler.positie}</span>}
            </p>
          </div>
        </section>

        {/* Statblokken */}
        <section aria-label="Statistieken" className="mt-10 grid grid-cols-3 gap-3">
          <StatBlok waarde={stats.goals} label="goals" />
          <StatBlok waarde={stats.assists} label="assists" />
          <StatBlok waarde={stats.matchen} label="matchen" />
        </section>

        {speler.funFact && <p className="mt-6 text-lg text-white/80">{speler.funFact}</p>}

        {/* Goals per match */}
        <section aria-labelledby="per-match" className="mt-10">
          <h2 id="per-match" className="font-display text-2xl tracking-wide uppercase">
            Per match
          </h2>
          {stats.perMatch.length === 0 ? (
            <p className="mt-3 text-white/60">Nog geen matchen gespeeld dit seizoen.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {stats.perMatch.map(({ match, goals, assists }) => (
                <li
                  key={`${match.datum}-${match.tegenstander}`}
                  className="flex items-center gap-3 rounded-xl bg-navy-900/80 p-3 ring-1 ring-white/10"
                >
                  <DatumBlok datum={aftrapVan(match)} />
                  <TegenstanderBadge naam={match.tegenstander} />
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-lg leading-tight uppercase">{match.tegenstander}</p>
                    <p className="text-xs text-white/60">
                      {meervoud(goals, 'goal', 'goals')}, {meervoud(assists, 'assist', 'assists')}
                    </p>
                  </div>
                  {match.uitslag && (
                    <span className="font-display text-2xl tabular-nums">
                      {match.uitslag.wij}–{match.uitslag.zij}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <nav aria-label="Andere spelers" className="mt-12 flex justify-between gap-3">
          <BuurLink speler={vorige} richting="vorige" />
          <BuurLink speler={volgende} richting="volgende" />
        </nav>
      </div>
    </main>
  )
}
