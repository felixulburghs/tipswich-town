import data from '../../data/spelers.json'
import type { Coach, Match, Speler } from '../types'
import { matchen } from './matchen'

/** Alle spelers, gesorteerd op rugnummer. */
export const spelers: Speler[] = [...data.spelers].sort((a, b) => a.nummer - b.nummer)
export const coach: Coach = data.coach

/** Rugnummer van de kapitein (uit spelers.json), of null als er geen is aangeduid. */
export const kapitein: number | null = data.kapitein ?? null
export const isKapitein = (nummer: number) => nummer === kapitein

export function spelerMet(nummer: number): Speler | undefined {
  return spelers.find((s) => s.nummer === nummer)
}

/** Rugnummer → naam uit spelers.json. Onbekend nummer? Dan tonen we gewoon "#nummer". */
export function naamVan(nummer: number): string {
  return spelerMet(nummer)?.naam ?? `#${nummer}`
}

/** "J. Van Looy" + voornaam "Joppe" → { voornaam: "Joppe", achternaam: "Van Looy" } */
export function naamDelen(speler: Speler): { voornaam: string; achternaam: string } {
  const [initiaal, ...rest] = speler.naam.split(' ')
  return { voornaam: speler.voornaam ?? initiaal, achternaam: rest.join(' ') }
}

/** [77, 23, 77] → [{ nummer: 77, aantal: 2 }, { nummer: 23, aantal: 1 }], meeste eerst. */
export function telPerSpeler(nummers: (number | null | undefined)[]) {
  const tellers = new Map<number, number>()
  for (const n of nummers) if (n != null) tellers.set(n, (tellers.get(n) ?? 0) + 1)
  return [...tellers]
    .map(([nummer, aantal]) => ({ nummer, aantal }))
    .sort((a, b) => b.aantal - a.aantal)
}

/**
 * Goals, assists en matchen van één speler, berekend uit matchen.json.
 * Iemand speelde mee als hij in de selectie staat, of als hij scoorde of een assist gaf
 * (voor matchen waar de selectie nog niet is ingevuld).
 */
export function statsVan(nummer: number) {
  const perMatch: { match: Match; goals: number; assists: number }[] = []
  for (const match of matchen) {
    if (!match.uitslag) continue
    const doelpunten = match.doelpunten ?? []
    const goals = doelpunten.filter((d) => d.speler === nummer).length
    const assists = doelpunten.filter((d) => d.assist === nummer).length
    const speelde = match.selectie?.includes(nummer) || goals > 0 || assists > 0
    if (speelde) perMatch.push({ match, goals, assists })
  }
  return {
    goals: perMatch.reduce((som, m) => som + m.goals, 0),
    assists: perMatch.reduce((som, m) => som + m.assists, 0),
    matchen: perMatch.length,
    perMatch,
  }
}

/** Beste schutters: meeste goals, bij gelijkstand meeste assists. */
export function topschutters(aantal = 3) {
  return spelers
    .map((speler) => ({ speler, ...statsVan(speler.nummer) }))
    .filter((s) => s.goals > 0)
    .sort((a, b) => b.goals - a.goals || b.assists - a.assists)
    .slice(0, aantal)
}

/** Vorige en volgende speler (op rugnummer), rondlopend: na de laatste komt de eerste. */
export function buren(nummer: number): { vorige: Speler; volgende: Speler } {
  const i = spelers.findIndex((s) => s.nummer === nummer)
  return {
    vorige: spelers[(i - 1 + spelers.length) % spelers.length],
    volgende: spelers[(i + 1) % spelers.length],
  }
}
