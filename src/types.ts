// Vormen van de data in data/matchen.json en data/spelers.json

/**
 * Wie scoorde of een assist gaf: een rugnummer (speler uit de kern),
 * of een naam als tekst voor een reservespeler zonder rugnummer (bv. "S. Ector").
 */
export type SpelerRef = number | string

export interface Doelpunt {
  speler: SpelerRef
  assist?: SpelerRef | null // wie de assist gaf, als bekend is bij welk doelpunt
}

export interface Match {
  datum: string | null // "2026-10-17", of null als de datum onbekend is (bv. de eerste match tegen Ballieboys)
  uur: string | null // "22:00"
  tegenstander: string
  thuis: boolean
  locatie: string
  uitslag: { wij: number; zij: number } | null
  doelpunten?: Doelpunt[]
  /** Assists als losse lijst, als niet bekend is bij welk doelpunt ze horen (zoals in de Instagram-stats) */
  assists?: SpelerRef[]
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
  status: string | null // "geblesseerd" of null (fit)
  positie: string | null
  foto: string | null
  funFact: string | null
}

/** Eén bericht uit data/nieuws.json */
export interface Nieuwsbericht {
  slug: string // stuk van de link: /nieuws/<slug>
  datum: string // "2026-10-08"
  titel: string
  intro: string
  tekst: string[] // alinea's
  spelers: number[] // rugnummers van wie het bericht gaat
  video: string | null // bestandsnaam in public/media/
  afbeelding: string | null // bestandsnaam in public/media/
}

/** Winst, Gelijk, Verlies */
export type Resultaat = 'W' | 'G' | 'V'
