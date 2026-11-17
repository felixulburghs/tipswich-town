import { SPONSOR } from '../config'

export type Tier = 'hoofdsponsor' | 'powered-by'

export type Sponsor = {
  name: string
  tier: Tier
  /** voor een lichte (crème) achtergrond */
  logo: string
  /** voor een donkere (navy) achtergrond; leeg = logo staat op een crème plaatje */
  logoLight?: string
  /** leeg = logo zonder link */
  url: string
  /** betaalde vermelding: krijgt rel="sponsored" */
  sponsored: boolean
  /** pixelmaten van het bestand: voor de optische grootte en tegen verspringen */
  width: number
  height: number
}

export const SPONSORS: Sponsor[] = [
  {
    name: 'Tout Bien',
    tier: 'hoofdsponsor',
    logo: SPONSOR.logo,
    url: SPONSOR.url,
    sponsored: true,
    width: 800,
    height: 155,
  },
  {
    name: 'Pitchdrive',
    tier: 'powered-by',
    logo: '/sponsors/pitchdrive-logo.png',
    logoLight: '/sponsors/pitchdrive-logo-light.png',
    url: 'https://www.pitchdrive.com',
    sponsored: false,
    width: 740,
    height: 136,
  },
]
