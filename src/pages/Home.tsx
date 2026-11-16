import { Hero } from '../components/Hero'
import { Looptekst } from '../components/Looptekst'
import { SPONSOR_TAKEOVER } from '../config'

export function Home() {
  return (
    <>
      <Hero />
      {SPONSOR_TAKEOVER && <Looptekst />}
    </>
  )
}
