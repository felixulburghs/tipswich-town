import { coach } from '../../lib/spelers'
import { SpelerFoto } from './SpelerFoto'

/** Kaart voor de coach: geen stats, niet klikbaar. */
export function CoachKaart() {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-navy-900/80 p-4 ring-1 ring-white/10">
      <SpelerFoto
        foto={coach.foto}
        alt={coach.naam}
        className="size-16 shrink-0 overflow-hidden rounded-full bg-navy-950 ring-2 ring-orange-400/60"
      />
      <div>
        <p className="text-sm font-semibold text-orange-400">Coach</p>
        <p className="font-display text-3xl leading-none uppercase">{coach.naam}</p>
      </div>
    </div>
  )
}
