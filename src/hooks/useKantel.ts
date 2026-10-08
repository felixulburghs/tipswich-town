import { useEffect, type PointerEvent } from 'react'
import { useMotionValue, useSpring, useTransform } from 'framer-motion'

const klem = (v: number) => Math.min(1, Math.max(0, v))

/**
 * 3D-kanteling die de muis volgt (desktop) of de gyroscoop (gsm).
 * We werken met "motion values": die veranderen zonder dat React opnieuw rendert,
 * dus ook met 8 kaarten tegelijk blijft het vloeiend.
 *
 * px/py = positie van de muis op de kaart, van 0 (links/boven) tot 1 (rechts/onder).
 */
export function useKantel(actief: boolean) {
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const veer = { stiffness: 180, damping: 18 }
  const sx = useSpring(px, veer)
  const sy = useSpring(py, veer)

  const rotateY = useTransform(sx, [0, 1], [-14, 14])
  const rotateX = useTransform(sy, [0, 1], [12, -12])
  const glansX = useTransform(sx, (v) => `${v * 100}%`)
  const glansY = useTransform(sy, (v) => `${v * 100}%`)

  // Gyroscoop: gamma = links/rechts kantelen, beta = voor/achter (je houdt een gsm meestal ±45° schuin)
  useEffect(() => {
    if (!actief) return
    const opDraai = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return
      px.set(klem(0.5 + e.gamma / 50))
      py.set(klem(0.5 + (e.beta - 45) / 50))
    }
    window.addEventListener('deviceorientation', opDraai)
    return () => window.removeEventListener('deviceorientation', opDraai)
  }, [actief, px, py])

  const handlers = {
    onPointerMove: (e: PointerEvent<HTMLElement>) => {
      if (!actief || e.pointerType === 'touch') return // op gsm doet de gyroscoop het werk
      const r = e.currentTarget.getBoundingClientRect()
      px.set((e.clientX - r.left) / r.width)
      py.set((e.clientY - r.top) / r.height)
    },
    onPointerLeave: () => {
      px.set(0.5)
      py.set(0.5)
    },
  }

  return { rotateX, rotateY, glansX, glansY, handlers }
}

/**
 * iPhones geven de gyroscoop pas door na toestemming, en die mag je alleen vragen
 * na een tik van de gebruiker. Daarom roepen we dit op bij de eerste tik op een kaart.
 */
export function vraagGyroscoopToestemming() {
  const D = window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }
  D?.requestPermission?.().catch(() => {})
}
