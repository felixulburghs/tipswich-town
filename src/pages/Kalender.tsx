import { useState } from 'react'
import { Countdown } from '../components/Countdown'
import { FilterTabs, type Filter } from '../components/kalender/FilterTabs'
import { MaandGroep } from '../components/kalender/MaandGroep'
import { SeizoensBalk } from '../components/kalender/SeizoensBalk'
import { PenseelTitel } from '../components/PenseelTitel'
import { matchen, perMaand, seizoen, volgendeMatch } from '../lib/matchen'
import { useNu } from '../lib/nu'
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
  const volgende = volgendeMatch(useNu().tijd)
  const maanden = perMaand(matchen.filter(filterRegels[filter]))

  return (
    <main
      className="min-h-svh bg-navy-950 px-4 pt-24 pb-16 sm:pt-28"
      style={{ backgroundImage: 'var(--licht-pagina)' }}
    >
      <div className="mx-auto max-w-3xl">
        {/* "Speelschema" is lang: in het brede Tout Bien-lettertype schaalt hij mee met de schermbreedte (clamp) */}
        <h1 className="font-display text-5xl leading-none uppercase sm:text-7xl toutbien:text-[clamp(1.5rem,8vw,4rem)] sm:toutbien:text-[clamp(1.5rem,8vw,4rem)]">
          <PenseelTitel>Speelschema</PenseelTitel>
          <span className="mt-2 block text-3xl text-tekst/70 sm:text-4xl">{seizoen}</span>
        </h1>

        <div className="mt-8">
          <SeizoensBalk />
        </div>

        {volgende && (
          <div className="mt-8">
            <Countdown match={volgende} />
          </div>
        )}

        <div className="mt-10 border-b border-lijn">
          <FilterTabs actief={filter} kies={setFilter} />
        </div>

        <div className="mt-8 space-y-10">
          {maanden.length === 0 ? (
            <p className="text-tekst-zacht">Geen matchen in deze selectie. Kies hierboven een andere filter.</p>
          ) : (
            maanden.map((g) => <MaandGroep key={g.maand} {...g} />)
          )}
        </div>
      </div>
    </main>
  )
}
