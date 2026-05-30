/** Mockup crewneck unisex — una foto por color y vista (frente / espalda) */

export type MockupColorKey = 'BLACK' | 'WHITE' | 'BEIGE' | 'HEATHER_GRAY'

export type MockupViewKey = 'FRONT' | 'BACK'

export type CrewneckMockupSet = {
  label: string
  front: string
  back: string
}

/** Mockups blanco — pecho = frente, espalda = atrás (public/gallery/presets) */
const WHITE_MOCKUP_FRONT = '/gallery/presets/pecho%20blanco.jpg'
const WHITE_MOCKUP_BACK = '/gallery/presets/espalda%20blanco.jpg'

export const CREWNECK_UNISEX_MOCKUPS: Record<MockupColorKey, CrewneckMockupSet> = {
  WHITE: {
    label: 'Blanco unisex',
    front: WHITE_MOCKUP_FRONT,
    back: WHITE_MOCKUP_BACK,
  },
  BLACK: {
    label: 'Negro unisex',
    front: '/mockup/unisex/black-front.jpg',
    back: '/mockup/unisex/black-back.jpg',
  },
  BEIGE: {
    label: 'Beige unisex',
    front: '/mockup/unisex/beige-front.jpg',
    back: '/mockup/unisex/beige-back.jpg',
  },
  HEATHER_GRAY: {
    label: 'Gris jaspe unisex',
    front: '/mockup/unisex/gray-front.jpg',
    back: '/mockup/unisex/gray-back.jpg',
  },
}

/** @deprecated Usar CREWNECK_UNISEX_MOCKUPS */
export const MOCKUP_PHOTO = {
  front: CREWNECK_UNISEX_MOCKUPS.WHITE.front,
  back: CREWNECK_UNISEX_MOCKUPS.WHITE.back,
} as const

export function getCrewneckMockupSrc(
  color: MockupColorKey,
  view: MockupViewKey,
): string {
  const set = CREWNECK_UNISEX_MOCKUPS[color]
  return view === 'BACK' ? set.back : set.front
}

/** Alineado al mockup fotográfico 400×520 */
export const MOCKUP_PRINT_AREAS = {
  FRONT: { x: 130, y: 268, width: 140, height: 140 },
  BACK: { x: 125, y: 272, width: 150, height: 150 },
} as const
