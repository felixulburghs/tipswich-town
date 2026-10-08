import type { Match } from '../../types'
import { PenseelTitel } from '../PenseelTitel'
import { MatchRij } from './MatchRij'

/** Maandnaam in een rode penseelstreek (zoals op het Instagram-speelschema) met de matchen eronder. */
export function MaandGroep({ maand, matchen }: { maand: string; matchen: Match[] }) {
  return (
    <section aria-label={maand}>
      <h3 className="font-display text-2xl tracking-wide uppercase">
        <PenseelTitel>{maand}</PenseelTitel>
      </h3>
      <ul className="mt-3 space-y-2">
        {matchen.map((m, i) => (
          <MatchRij key={`${m.datum}-${m.tegenstander}`} match={m} index={i} />
        ))}
      </ul>
    </section>
  )
}
