/** Huis = thuismatch in GBS De Stip Linden, vliegtuig = uitmatch (zoals op het speelschema). */
export function ThuisUitIcoon({ thuis, className = '' }: { thuis: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      role="img"
      aria-label={thuis ? 'Thuismatch' : 'Uitmatch'}
      className={className}
    >
      {thuis ? (
        <path d="M12 3 2 11.5h3V21h5.5v-6h3v6H19v-9.5h3z" />
      ) : (
        <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" />
      )}
    </svg>
  )
}
