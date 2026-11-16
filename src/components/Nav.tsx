import { NavLink, useLocation } from 'react-router-dom'
import { InstagramKnop } from './InstagramKnop'

const links = [
  { naar: '/', tekst: 'Home' },
  { naar: '/kalender', tekst: 'Kalender' },
  { naar: '/spelers', tekst: 'Spelers' },
  { naar: '/nieuws', tekst: 'Nieuws' },
]

/**
 * Bovenbalk met logo en links. NavLink weet zelf welke pagina actief is (isActive).
 * Op home staat het grote logo al in de hero, dus daar staat linksboven de Instagram-knop.
 */
export function Nav() {
  const opHome = useLocation().pathname === '/'
  return (
    <nav className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-4 py-3 sm:px-8">
      {opHome ? (
        <InstagramKnop />
      ) : (
        <NavLink to="/" aria-label="Tipswich Town, naar home">
          <img src="/logo.webp" alt="" width={321} height={400} style={{ filter: 'var(--gloed-nav-logo)' }} className="h-14 w-auto sm:h-16" />
        </NavLink>
      )}
      {/* Tout Bien-thema: rode pil met crème pilknoppen; op gsm normale letterbreedte zodat alles past */}
      <ul className="flex gap-3 font-display text-base tracking-wide uppercase sm:gap-5 sm:text-lg toutbien:gap-1 toutbien:rounded-full toutbien:bg-red-600 toutbien:p-1 toutbien:text-xs toutbien:tracking-normal toutbien:[font-stretch:100%] sm:toutbien:text-base sm:toutbien:[font-stretch:125%]">
        {links.map((l) => (
          <li key={l.naar}>
            <NavLink
              to={l.naar}
              end={l.naar === '/'}
              className={({ isActive }) =>
                `border-b-2 pb-0.5 toutbien:block transition-colors toutbien:rounded-full toutbien:border-0 toutbien:px-1.5 toutbien:py-1 sm:toutbien:px-4 ${
                  isActive
                    ? 'border-red-600 text-tekst toutbien:bg-red-800 toutbien:text-white'
                    : 'border-transparent text-tekst-zacht hover:text-tekst toutbien:bg-white toutbien:text-red-600 toutbien:hover:bg-white/85 toutbien:hover:text-red-600'
                }`
              }
            >
              {l.tekst}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
