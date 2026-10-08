import data from '../../data/matchen.json'
import type { Match, Resultaat } from '../types'

export const seizoen = data.seizoen
export const reeks = data.reeks
/**
 * Alle matchen: eerst de "andere" matchen zonder datum (de seizoensstart tegen Ballieboys,
 * niet in het speelschema), daarna het speelschema. Zo tellen ze mee in de stats en de vorm.
 */
export const matchen: Match[] = [...data.andereMatchen, ...data.matchen]

/** Datum + uur uit de JSON omzetten naar een Date (lokale tijd van de bezoeker = Belgische tijd). Null als de datum onbekend is. */
export function aftrapVan(match: Match): Date | null {
  if (!match.datum) return null
  return new Date(`${match.datum}T${match.uur ?? '00:00'}:00`)
}

/** Eerste match zonder uitslag die nog niet begonnen is, of null als het seizoen gedaan is. */
export function volgendeMatch(nu: Date = new Date()): Match | null {
  return (
    matchen
      .filter((m) => m.uitslag === null && (aftrapVan(m) ?? 0) > nu)
      .sort((a, b) => aftrapVan(a)!.getTime() - aftrapVan(b)!.getTime())[0] ?? null
  )
}

/** "zaterdag 17 oktober om 22:00" */
export function datumTekst(match: Match): string {
  const aftrap = aftrapVan(match)
  if (!aftrap) return 'Datum onbekend'
  const dag = aftrap.toLocaleDateString('nl-BE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  return `${dag} om ${match.uur}`
}

/** W, G of V – of null als de match nog niet gespeeld is. */
export function resultaat(match: Match): Resultaat | null {
  if (!match.uitslag) return null
  const { wij, zij } = match.uitslag
  return wij > zij ? 'W' : wij < zij ? 'V' : 'G'
}

/** Alles voor de seizoensbalk, berekend uit de gespeelde matchen. */
export function seizoensStats() {
  const gespeeld = matchen.filter((m) => m.uitslag !== null)
  const resultaten = gespeeld.map((m) => resultaat(m)!)
  return {
    gespeeld: gespeeld.length,
    winst: resultaten.filter((r) => r === 'W').length,
    gelijk: resultaten.filter((r) => r === 'G').length,
    verlies: resultaten.filter((r) => r === 'V').length,
    voor: gespeeld.reduce((som, m) => som + m.uitslag!.wij, 0),
    tegen: gespeeld.reduce((som, m) => som + m.uitslag!.zij, 0),
    vorm: resultaten.slice(-5), // laatste 5, oudste eerst
  }
}

/**
 * Groepeert matchen per maand, in de volgorde waarin ze voorkomen: [{ maand: "oktober 2026", matchen }].
 * Matchen zonder datum komen in de groep "Seizoensstart".
 */
export function perMaand(lijst: Match[]): { maand: string; matchen: Match[] }[] {
  const groepen = new Map<string, Match[]>()
  for (const m of lijst) {
    const maand = aftrapVan(m)?.toLocaleDateString('nl-BE', { month: 'long', year: 'numeric' }) ?? 'Seizoensstart'
    groepen.set(maand, [...(groepen.get(maand) ?? []), m])
  }
  return [...groepen].map(([maand, matchen]) => ({ maand, matchen }))
}
