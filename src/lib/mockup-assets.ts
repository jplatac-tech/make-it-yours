/** Mockup crewneck unisex — una foto por color y vista (frente / espalda) */

export type MockupColorKey = 'BLACK' | 'WHITE' | 'BEIGE' | 'HEATHER_GRAY'

export type MockupViewKey = 'FRONT' | 'BACK'

export type CrewneckMockupSet = {
  label: string
  front: string
  back: string
}

const MOCKUP_BASE = '/mockup/unisex'

export const CREWNECK_UNISEX_MOCKUPS: Record<MockupColorKey, CrewneckMockupSet> = {
  WHITE: {
    label: 'Blanco unisex',
    front: `${MOCKUP_BASE}/white-front.webp`,
    back: `${MOCKUP_BASE}/white-back.webp`,
  },
  BLACK: {
    label: 'Negro unisex',
    front: `${MOCKUP_BASE}/black-front.webp`,
    back: `${MOCKUP_BASE}/black-back.webp`,
  },
  BEIGE: {
    label: 'Beige unisex',
    front: `${MOCKUP_BASE}/beige-front.webp`,
    back: `${MOCKUP_BASE}/beige-back.webp`,
  },
  HEATHER_GRAY: {
    label: 'Gris jaspe unisex',
    front: `${MOCKUP_BASE}/gray-front.webp`,
    back: `${MOCKUP_BASE}/gray-back.webp`,
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
