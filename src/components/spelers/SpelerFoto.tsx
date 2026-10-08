/**
 * Foto van een speler uit public/spelers/. In spelers.json zet je bij "foto" de bestandsnaam,
 * bv. "van-looy.jpg". Geen foto? Dan tonen we een silhouet met het clublogo op de borst.
 * loading="lazy": de browser laadt de foto pas als hij bijna in beeld komt.
 */
export function SpelerFoto({ foto, alt, className = '' }: { foto: string | null; alt: string; className?: string }) {
  if (foto) {
    return (
      <img
        src={`/spelers/${foto}`}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={`object-cover object-top ${className}`}
      />
    )
  }
  return <Silhouet className={className} />
}

function Silhouet({ className }: { className: string }) {
  // Buitenste div krijgt de plaatsing van de ouder (bv. absolute), de binnenste is het referentiekader voor het logo
  return (
    <div className={className} aria-hidden="true">
      <div className="relative h-full w-full">
      <svg viewBox="0 0 100 110" preserveAspectRatio="xMidYMax meet" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="silhouet" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0848b8" />
            <stop offset="1" stopColor="#081858" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="32" r="19" fill="url(#silhouet)" />
        <path d="M8 110c0-30 18-50 42-50s42 20 42 50z" fill="url(#silhouet)" />
      </svg>
      <img
        src="/logo.png"
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute bottom-[12%] left-1/2 w-[22%] -translate-x-1/2 rounded-sm opacity-90"
      />
      </div>
    </div>
  )
}
