import { NieuwsKaart } from '../components/nieuws/NieuwsKaart'
import { PenseelTitel } from '../components/PenseelTitel'
import { berichten } from '../lib/nieuws'

/** Overzicht van al het clubnieuws, nieuwste eerst. */
export function Nieuws() {
  return (
    <main
      className="min-h-svh bg-navy-950 px-4 pt-24 pb-16 sm:pt-28"
      style={{ backgroundImage: 'radial-gradient(ellipse 70% 30% at 50% 0%, rgb(8 72 184 / 0.45), transparent 70%)' }}
    >
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-5xl leading-none uppercase sm:text-7xl">
          <PenseelTitel>Nieuws</PenseelTitel>
        </h1>
        <p className="mt-3 text-white/70">Het laatste nieuws over de club en de spelers.</p>

        {berichten.length === 0 ? (
          <p className="mt-10 text-white/60">Nog geen nieuws. Kom binnenkort terug.</p>
        ) : (
          <ul className="mt-10 space-y-4">
            {berichten.map((b) => (
              <li key={b.slug}>
                <NieuwsKaart bericht={b} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
