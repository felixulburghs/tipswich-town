/**
 * Blessure-icoon: wit rondje met een rood kruis, zoals op een FIFA-kaart.
 * Verschijnt bij spelers met "status": "geblesseerd" in spelers.json.
 */
export function BlessureIcoon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" role="img" aria-label="Geblesseerd" className={className}>
      <title>Geblesseerd</title>
      <circle cx="12" cy="12" r="11" fill="#f8f8f8" />
      <path d="M10 5h4v5h5v4h-5v5h-4v-5H5v-4h5z" fill="#d70719" />
    </svg>
  )
}

export const isGeblesseerd = (status: string | null) => status === 'geblesseerd'
