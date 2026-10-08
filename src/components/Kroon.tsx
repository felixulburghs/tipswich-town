/** Klein kroontje als detail uit de huisstijl. */
export function Kroon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 16" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M2 14 0 3l6 4 6-7 6 7 6-4-2 11z" />
    </svg>
  )
}
