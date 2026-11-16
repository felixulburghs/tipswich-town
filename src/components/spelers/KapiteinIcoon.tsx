/**
 * Kapiteins-icoon: oranje rondje met een "C", zoals de kapiteinsband.
 * Verschijnt bij de speler wiens rugnummer bij "kapitein" staat in spelers.json.
 */
export function KapiteinIcoon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" role="img" aria-label="Kapitein" className={className}>
      <title>Kapitein</title>
      <circle cx="12" cy="12" r="11" fill="var(--color-orange-400)" />
      <circle cx="12" cy="12" r="11" fill="none" stroke="var(--color-white)" strokeWidth="1.5" />
      <text
        x="12"
        y="17"
        textAnchor="middle"
        fontFamily="Anton, Impact, sans-serif"
        fontSize="14"
        fill="var(--color-navy-950)"
      >
        C
      </text>
    </svg>
  )
}
