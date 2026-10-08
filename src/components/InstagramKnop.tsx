export const INSTAGRAM_URL = 'https://www.instagram.com/tipswich_town/'

/** Het Instagram-logo (camera-icoon) als lijntekening. */
export function InstagramIcoon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  )
}

/**
 * "Volg ons op Instagram"-knop voor linksboven.
 * Op gsm enkel het icoon (er is weinig plaats naast het menu), vanaf sm: ook "@tipswich_town".
 * Rood uit de huisstijl (red-600), zoals de andere knoppen op de site.
 */
export function InstagramKnop() {
  return (
    <a
      href={INSTAGRAM_URL}
      target="_blank"
      rel="noreferrer"
      aria-label="Volg Tipswich Town op Instagram"
      className="flex items-center gap-2 rounded-full bg-red-600 p-2 font-display tracking-wide uppercase shadow-lg shadow-red-600/30 transition hover:scale-105 hover:bg-red-600/90 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400 sm:py-2 sm:pr-4 sm:pl-2.5"
    >
      <InstagramIcoon className="size-6" />
      <span className="hidden sm:inline">@tipswich_town</span>
    </a>
  )
}
