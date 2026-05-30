# Auditoría Fase 0 y Fase 1

## Fase 0 — Alcance MVP

| Requisito | Estado | Notas |
|-----------|--------|-------|
| Documento de alcance MVP | ✅ | Este archivo + reglas operativas abajo |
| Sin descarga de diseño al cliente | ✅ | No hay export público |
| Sin pago automático | ✅ | Flujo cotización / pedido |
| Sin 3D en Fase 1 | ✅ | 3D entra en Fase 2 (capa opcional) |

## Fase 1 — Checklist funcional

| Área | Estado | Notas |
|------|--------|-------|
| Next.js + TS + Tailwind + App Router | ✅ | |
| Prisma + PostgreSQL (schema) | ✅ | Requiere `DATABASE_URL` activo |
| Zod validaciones | ✅ | |
| Cloudinary (estructura) | ⚠️ | Stub de firma; uploads locales + data URL |
| **3 productos** (camiseta, hoodie, crewneck) | ✅ | Restaurado en catálogo |
| 4 colores | ✅ | |
| Tallas S–XL | ✅ | Selector en compra |
| Zonas imprimibles | ⚠️ | Frente + espalda (sin pecho izquierdo; decisión UX) |
| Catálogo / home | ✅ | `/` + `/catalogo` |
| Página de producto | ✅ | `/productos/[slug]` |
| Editor 2D | ✅ | `/disenar` — texto, iconos, imagen, guías, zoom |
| Límite área imprimible | ✅ | Overlay + snap |
| Subida PNG/JPG | ✅ | + galería Subidos |
| Enviar diseño para cotizar | ✅ | `/comprar` + `/comprar/entrega` |
| Campos: nombre, email/WhatsApp, cantidad, fecha, comentarios | ✅ | Formulario entrega |
| Mockup + archivo técnico al enviar | ✅ | Generación PNG en cliente, guardado en `designJson` |
| Panel admin listado | ✅ | `/admin/quotes` |
| Panel admin detalle + estados | ✅ | Pendiente, en revisión, cotizado, aprobado, rechazado |
| Historial de estado | ✅ | `QuoteStatusLog` al cambiar estado |
| Build producción | ✅ | `npm run build` |

## Fase 2 — En curso

| Requisito | Estado |
|-----------|--------|
| Editor 2D estable como fuente de verdad | ✅ |
| Visor 3D (Three.js) | ✅ Implementado |
| Textura desde canvas 2D (CanvasTexture) | ✅ |
| Exportación técnica separada del 3D | ✅ |
| Modelo GLB optimizado | ⚠️ Malla procedural + hook para `/models/sweater.glb` |

## Regla operativa

El usuario **diseña en 2D** y **envía para cotización**. La vista 3D es **previsualización comercial**, no sustituye el archivo plano para impresión.
