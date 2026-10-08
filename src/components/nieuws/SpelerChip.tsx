import { Link } from 'react-router-dom'
import { naamDelen, spelerMet } from '../../lib/spelers'

/** Klein label "#19 Louie Baert" dat naar het profiel van de speler linkt. */
export function SpelerChip({ nummer, klikbaar = true }: { nummer: number; klikbaar?: boolean }) {
  const speler = spelerMet(nummer)
  const tekst = speler ? `${naamDelen(speler).voornaam} ${naamDelen(speler).achternaam}` : 'Onbekende speler'
  const inhoud = (
    <>
      <span className="font-display text-red-600">#{nummer}</span> {tekst}
    </>
  )
  const stijl = 'inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold'

  if (!klikbaar || !speler) return <span className={stijl}>{inhoud}</span>
  return (
    <Link to={`/spelers/${nummer}`} className={`${stijl} transition hover:bg-white/20`}>
      {inhoud}
    </Link>
  )
}
