import { seizoensStats } from '../../lib/matchen'
import type { Resultaat } from '../../types'

export const resultaatKleur: Record<Resultaat, string> = {
  W: 'bg-winst',
  G: 'bg-gelijk',
  V: 'bg-red-600',
}

const resultaatWoord: Record<Resultaat, string> = { W: 'winst', G: 'gelijk', V: 'verlies' }

function Cijfer({ waarde, label }: { waarde: string | number; label: string }) {
  return (
    <div className="flex flex-col">
      <span className="font-display text-4xl leading-none sm:text-5xl">{waarde}</span>
      <span className="mt-1 text-xs text-white/60">{label}</span>
    </div>
  )
}

/** Bolletjes voor de laatste 5 resultaten, oudste links. */
function VormBolletjes({ vorm }: { vorm: Resultaat[] }) {
  return (
    <div className="flex flex-col">
      <ol className="flex h-9 items-center gap-2 sm:h-12" aria-label={`Vorm: ${vorm.map((r) => resultaatWoord[r]).join(', ')}`}>
        {vorm.map((r, i) => (
          <li key={i} className={`grid size-9 place-items-center rounded-full font-display text-lg ring-2 ring-white/20 sm:size-11 sm:text-xl ${resultaatKleur[r]}`}>
            {r}
          </li>
        ))}
      </ol>
      <span className="mt-1 text-xs text-white/60">vorm</span>
    </div>
  )
}

/** Seizoensstatistieken, volledig berekend uit de uitslagen in matchen.json. */
export function SeizoensBalk() {
  const s = seizoensStats()
  return (
    <section
      aria-label="Seizoen in cijfers"
      className="grid grid-cols-4 gap-x-4 gap-y-5 border-y border-white/10 py-5 sm:flex sm:gap-x-10"
    >
      <Cijfer waarde={s.gespeeld} label="gespeeld" />
      <Cijfer waarde={s.winst} label="gewonnen" />
      <Cijfer waarde={s.gelijk} label="gelijk" />
      <Cijfer waarde={s.verlies} label="verloren" />
      <div className="col-span-2 sm:col-span-1">
        <Cijfer waarde={`${s.voor}–${s.tegen}`} label="doelpunten voor–tegen" />
      </div>
      <div className="col-span-2 sm:col-span-1">
        {s.vorm.length > 0 && <VormBolletjes vorm={s.vorm} />}
      </div>
    </section>
  )
}
