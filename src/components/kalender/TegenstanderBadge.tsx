import { initialen, kleurVanNaam } from '../../lib/badge'

/** Rond "logo" voor een tegenstander: initialen op een kleur die uit de naam berekend wordt. */
export function TegenstanderBadge({ naam }: { naam: string }) {
  return (
    <span
      aria-hidden="true"
      style={{ backgroundColor: kleurVanNaam(naam) }}
      className="grid size-10 shrink-0 place-items-center rounded-full font-display text-sm tracking-wide ring-2 ring-white/15"
    >
      {initialen(naam)}
    </span>
  )
}
