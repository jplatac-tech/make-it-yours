/** Índices de slides a montar: anterior, actual y siguiente (crossfade). */
export function getCarouselSlideIndexes(
  index: number,
  total: number,
): number[] {
  if (total <= 1) return [0]
  const prev = (index - 1 + total) % total
  const next = (index + 1) % total
  return [prev, index, next]
}

export function shouldMountCarouselSlide(
  slideIndex: number,
  index: number,
  total: number,
): boolean {
  return getCarouselSlideIndexes(index, total).includes(slideIndex)
}
