import { CoachKaart } from '../components/spelers/CoachKaart'
import { SpelerKaart } from '../components/spelers/SpelerKaart'
import { TopschuttersPodium } from '../components/spelers/TopschuttersPodium'
import { PenseelTitel } from '../components/PenseelTitel'
import { spelers } from '../lib/spelers'

/** Overzicht van de kern: topschutters-podium, alle spelerskaarten en de coach. */
export function Spelers() {
  return (
    <main
      className="min-h-svh bg-navy-950 px-4 pt-20 pb-16"
      style={{ backgroundImage: 'radial-gradient(ellipse 70% 30% at 50% 0%, rgb(8 72 184 / 0.45), transparent 70%)' }}
    >
      <div className="mx-auto max-w-5xl">
        <h1 className="font-display text-5xl leading-none uppercase sm:text-7xl">
          <PenseelTitel>De kern</PenseelTitel>
          <span className="mt-2 block text-3xl text-white/70 sm:text-4xl">{spelers.length} spelers</span>
        </h1>

        <section aria-labelledby="topschutters" className="mt-10">
          <h2 id="topschutters" className="font-display text-2xl tracking-wide uppercase">
            Topschutters
          </h2>
          <div className="mt-4 max-w-xl">
            <TopschuttersPodium />
          </div>
        </section>

        <ul className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {spelers.map((s) => (
            <li key={s.nummer}>
              <SpelerKaart speler={s} />
            </li>
          ))}
        </ul>

        <div className="mt-12 max-w-sm">
          <CoachKaart />
        </div>
      </div>
    </main>
  )
}
