/**
 * Foto van een speler uit public/spelers/. In spelers.json zet je bij "foto" de bestandsnaam,
 * bv. "van-looy.jpg". loading="lazy": de browser laadt de foto pas als hij bijna in beeld komt.
 *
 * Nog geen foto?
 * - zonderFoto "leeg": niets tonen (de kaart legt er zelf een "Coming soon"-tape over)
 * - zonderFoto "logo": het clublogo, voor kleine ronde avatars (podium, coach)
 */
export function SpelerFoto({
  foto,
  alt,
  zonderFoto = 'leeg',
  className = '',
}: {
  foto: string | null
  alt: string
  zonderFoto?: 'leeg' | 'logo'
  className?: string
}) {
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
  if (zonderFoto === 'logo') {
    return (
      <div className={`grid place-items-center ${className}`} aria-hidden="true">
        <img src="/logo.webp" alt="" loading="lazy" decoding="async" className="h-3/5 w-auto" />
      </div>
    )
  }
  return null
}
