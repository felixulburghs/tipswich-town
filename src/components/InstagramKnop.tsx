export const INSTAGRAM_URL = 'https://www.instagram.com/tipswich_town/'

/**
 * Het Instagram-logo als volle vorm (één pad, evenodd): gevuld vierkantje met de lens en het flitsje uitgespaard.
 * Neemt de tekstkleur over (currentColor).
 */
export function InstagramIcoon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" fillRule="evenodd" aria-hidden="true" className={className}>
      <path d="M8 3h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8a5 5 0 0 1 5-5ZM12 7a5 5 0 1 0 0 10a5 5 0 1 0 0-10ZM12 8.8a3.2 3.2 0 1 0 0 6.4a3.2 3.2 0 1 0 0-6.4ZM17.5 5.3a1.2 1.2 0 1 0 0 2.4a1.2 1.2 0 1 0 0-2.4Z" />
    </svg>
  )
}

/**
 * Ronde Instagram-knop (enkel het icoon) linksboven op home.
 * Takeover: rood rondje met crème icoon, even hoog als de rode nav-pil rechts (32 px, vanaf sm 40 px).
 * Gewoon thema: navy rondje (44 px) met wit icoon; de dunne ring houdt het zichtbaar op de navy pagina.
 * ::before maakt het aanraakvlak altijd minstens 44 × 44 px.
 */
export function InstagramKnop() {
  return (
    <a
      href={INSTAGRAM_URL}
      target="_blank"
      rel="noreferrer"
      aria-label="Instagram @tipswich_town"
      className="relative grid size-11 place-items-center rounded-full bg-navy-900 text-white ring-1 ring-white/15 transition-transform before:absolute before:top-1/2 before:left-1/2 before:size-11 before:-translate-1/2 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400 active:scale-95 toutbien:size-8 toutbien:bg-red-600 toutbien:ring-0 sm:toutbien:size-10"
    >
      <InstagramIcoon className="size-5 toutbien:size-4 sm:toutbien:size-5" />
    </a>
  )
}
