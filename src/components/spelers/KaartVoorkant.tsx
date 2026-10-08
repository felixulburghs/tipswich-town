import { naamDelen } from '../../lib/spelers'
import type { Speler } from '../../types'
import { Kroon } from '../Kroon'
import { SpelerFoto } from './SpelerFoto'

/**
 * De voorkant van een spelerskaart. Wordt zowel in het overzicht als op de detailpagina gebruikt.
 * "@container" + "cqw"-eenheden: tekstgroottes schalen mee met de breedte van de kaart,
 * zodat dezelfde kaart klein (overzicht) en groot (detail) goed oogt.
 */
export function KaartVoorkant({ speler }: { speler: Speler }) {
  const { voornaam, achternaam } = naamDelen(speler)
  return (
    <div className="@container relative h-full w-full overflow-hidden rounded-2xl bg-gradient-to-b from-royal-500 via-royal-700 to-navy-900 ring-1 ring-white/20">
      {/* Groot rugnummer, half doorzichtig op de achtergrond */}
      <span
        aria-hidden="true"
        className="absolute -top-[4cqw] -right-[2cqw] font-display text-[62cqw] leading-none text-white/10"
      >
        {speler.nummer}
      </span>

      {/* Rugnummer + kroontje linksboven, zoals de rating op een FIFA-kaart */}
      <div className="absolute top-[5cqw] left-[6cqw] flex flex-col items-center leading-none">
        <Kroon className="w-[12cqw] text-orange-400" />
        <span className="mt-[1cqw] font-display text-[14cqw]">{speler.nummer}</span>
      </div>

      <SpelerFoto
        foto={speler.foto}
        alt={speler.naam}
        className="absolute inset-x-[8%] top-[14%] bottom-[22%]"
      />

      {/* Naam onderaan op een donkere band */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950 via-navy-950/90 to-transparent px-[6cqw] pt-[10cqw] pb-[5cqw] text-center">
        <p className="text-[7cqw] font-semibold text-white/70">{voornaam}</p>
        {/* Lange achternamen (bv. "Van Doorn Ballon") krijgen een kleinere letter zodat ze passen */}
        <p
          className={`truncate font-display leading-none uppercase ${
            achternaam.length > 12 ? 'text-[9cqw]' : achternaam.length > 9 ? 'text-[11cqw]' : 'text-[13cqw]'
          }`}
        >
          {achternaam}
        </p>
      </div>
    </div>
  )
}
