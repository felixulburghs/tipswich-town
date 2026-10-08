import data from '../../data/nieuws.json'
import type { Nieuwsbericht } from '../types'

/** Alle berichten, nieuwste eerst. */
export const berichten: Nieuwsbericht[] = [...data.berichten].sort((a, b) => b.datum.localeCompare(a.datum))

export function berichtMet(slug: string): Nieuwsbericht | undefined {
  return berichten.find((b) => b.slug === slug)
}

/** Berichten waarin een speler (rugnummer) vermeld wordt. */
export function berichtenOver(nummer: number): Nieuwsbericht[] {
  return berichten.filter((b) => b.spelers.includes(nummer))
}

/** "2026-10-08" → "8 oktober 2026" */
export function nieuwsDatum(bericht: Nieuwsbericht): string {
  return new Date(`${bericht.datum}T12:00:00`).toLocaleDateString('nl-BE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** Pad naar een bestand in public/media/ (niet public/nieuws/: dat zou botsen met de pagina /nieuws) */
export function nieuwsBestand(naam: string): string {
  return `/media/${naam}`
}
