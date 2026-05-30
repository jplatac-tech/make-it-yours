# Fase 2 — Vista 3D

## Arquitectura

- **Origen del diseño:** editor 2D (`/disenar`) — fuente de verdad para impresión.
- **Salida visual:** visor Three.js con textura `CanvasTexture` desde el área imprimible.
- **Salida técnica:** PNG del área imprimible a ~300 DPI (`renderTechnicalDataUrl`), independiente del 3D.

## Uso en el editor

1. Diseña en vista **2D** (mockup plano + guías).
2. Cambia a **3D** o **Ambas** para rotar el suéter y ver el diseño aplicado.
3. Al **Enviar diseño para cotizar**, se generan mockup + archivo técnico en el cliente.

## Modelo 3D

- Malla procedural (cuerpo + mangas + plano de estampado).
- Para producción: reemplazar por `public/models/sweater.glb` con UV limpio y cargar con `useGLTF`.

## Dependencias

- `three`, `@react-three/fiber`, `@react-three/drei`
