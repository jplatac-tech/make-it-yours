# Galería de diseños

## Licencias (uso en pedidos de esta tienda)

| Origen | Licencia | Notas |
|--------|----------|--------|
| `presets/*.svg` | Creados para Make It Yours | Uso libre en esta app y pedidos |
| Wikimedia Commons (posters) | Dominio público (US) o ver archivo | Atribución en `design-gallery.ts` |
| Google Fonts (editor) | SIL Open Font License | Uso comercial en texto estampado |

**No incluido:** plantillas de [Vexels](https://www.vexels.com/) o [Canva](https://www.canva.com/) — requieren su propia suscripción/licencia. Esta app usa recursos propios y de dominio público.

## Diseños Canva (PNG)

1. Exporta el diseño **terminado** desde Canva (PNG con fondo transparente si aplica).
2. Guarda el archivo en `imagenes/`.
3. Añade el nombre del archivo al array `CANVA_IMAGE_FILES` en `src/lib/catalog-designs.ts`.
4. La categoría (Anime, Retro, Streetwear, etc.) se infiere del nombre; puedes ajustar `inferDesignCategory()` si hace falta.

No uses `Front.png` / `Back.png` en el catálogo (son mockups, no diseños).

## Añadir más gráficos locales (galería SVG/posters)

1. Guarda SVG o PNG en `presets/` o `uploads/`
2. Regístralos en `src/lib/design-gallery.ts`
