// Vormen van de data in data/matchen.json en data/spelers.json

export interface Doelpunt {
  speler: number // rugnummer
  assist?: number | null // rugnummer van wie de assist gaf
}

export interface Match {
  datum: string | null // "2026-10-17", of null als de datum onbekend is (bv. de eerste match tegen Ballieboys)
  uur: string | null // "22:00"
  tegenstander: string
  thuis: boolean
  locatie: string
  uitslag: { wij: number; zij: number } | null
  doelpunten?: Doelpunt[]
  selectie?: number[] // rugnummers van wie meespeelde
}

export interface Coach {
  naam: string
  foto: string | null
}

export interface Speler {
  nummer: number
  naam: string // "J. Van Looy"
  voornaam: string | null
  positie: string | null
  foto: string | null
  funFact: string | null
}

/** Winst, Gelijk, Verlies */
export type Resultaat = 'W' | 'G' | 'V'
