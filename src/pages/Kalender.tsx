import { useState } from 'react'
import { Countdown } from '../components/Countdown'
import { FilterTabs, type Filter } from '../components/kalender/FilterTabs'
import { MaandGroep } from '../components/kalender/MaandGroep'
import { SeizoensBalk } from '../components/kalender/SeizoensBalk'
import { PenseelTitel } from '../components/PenseelTitel'
import { matchen, perMaand, seizoen, volgendeMatch } from '../lib/matchen'
import type { Match } from '../types'

const filterRegels: Record<Filter, (m: Match) => boolean> = {
  Alles: () => true,
  Komend: (m) => m.uitslag === null,
  Gespeeld: (m) => m.uitslag !== null,
  Thuis: (m) => m.thuis,
  Uit: (m) => !m.thuis,
}

/** Speelschema: seizoensbalk, volgende match, filters en alle matchen per maand. */
export function Kalender() {
  const [filter, setFilter] = useState<Filter>('Alles')
  const volgende = volgendeMatch()
  const maanden = perMaand(matchen.filter(filterRegels[filter]))

  return (
    <main
      className="min-h-svh bg-navy-950 px-4 pt-20 pb-16"
      style={{ backgroundImage: 'radial-gradient(ellipse 70% 30% at 50% 0%, rgb(8 72 184 / 0.45), transparent 70%)' }}
    >
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-5xl leading-none uppercase sm:text-7xl">
          <PenseelTitel>Speelschema</PenseelTitel>
          <span className="mt-2 block text-3xl text-white/70 sm:text-4xl">{seizoen}</span>
        </h1>

        <div className="mt-8">
          <SeizoensBalk />
        </div>

        {volgende && (
          <div className="mt-8">
            <Countdown match={volgende} />
          </div>
        )}

        <div className="mt-10 border-b border-white/10">
          <FilterTabs actief={filter} kies={setFilter} />
        </div>

        <div className="mt-8 space-y-10">
          {maanden.length === 0 ? (
            <p className="text-white/60">Geen matchen in deze selectie. Kies hierboven een andere filter.</p>
          ) : (
            maanden.map((g) => <MaandGroep key={g.maand} {...g} />)
          )}
        </div>
      </div>
    </main>
  )
}
