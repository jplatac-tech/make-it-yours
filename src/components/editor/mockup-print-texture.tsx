'use client'

/** Grano sutil encima del diseño para simular textura de tela */
export function MockupPrintTexture() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[500] opacity-[0.11] mix-blend-soft-light"
      aria-hidden
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        backgroundSize: '160px 160px',
      }}
    />
  )
}
