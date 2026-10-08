import { NavLink, useLocation } from 'react-router-dom'

const links = [
  { naar: '/', tekst: 'Home' },
  { naar: '/kalender', tekst: 'Kalender' },
  { naar: '/spelers', tekst: 'Spelers' },
]

/**
 * Bovenbalk met logo en links. NavLink weet zelf welke pagina actief is (isActive).
 * Op home staat het grote logo al in de hero, dus daar laten we het kleine weg.
 */
export function Nav() {
  const opHome = useLocation().pathname === '/'
  return (
    <nav className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-4 py-3 sm:px-8">
      {opHome ? (
        <span />
      ) : (
        <NavLink to="/" aria-label="Tipswich Town, naar home">
          <img src="/logo.png" alt="" width={150} height={150} className="size-9 rounded-lg" />
        </NavLink>
      )}
      <ul className="flex gap-5 font-display text-lg tracking-wide uppercase">
        {links.map((l) => (
          <li key={l.naar}>
            <NavLink
              to={l.naar}
              end={l.naar === '/'}
              className={({ isActive }) =>
                `border-b-2 pb-0.5 transition-colors ${
                  isActive ? 'border-red-600 text-white' : 'border-transparent text-white/60 hover:text-white'
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
