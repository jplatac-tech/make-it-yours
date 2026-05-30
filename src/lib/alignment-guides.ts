export type GuideLines = {
  vertical: number[]
  horizontal: number[]
}

export type Rect = {
  x: number
  y: number
  width: number
  height: number
}

const SNAP_THRESHOLD = 8

function snapEdge(
  value: number,
  size: number,
  lines: number[],
): { snapped: number; activeLines: number[] } {
  const candidates = [
    { edge: value, offset: 0 },
    { edge: value + size / 2, offset: -size / 2 },
    { edge: value + size, offset: -size },
  ]

  let best: { dist: number; snapped: number; line: number } | null = null

  for (const line of lines) {
    for (const c of candidates) {
      const dist = Math.abs(c.edge - line)
      if (dist <= SNAP_THRESHOLD && (best === null || dist < best.dist)) {
        best = { dist, snapped: line + c.offset, line }
      }
    }
  }

  if (!best) {
    return { snapped: value, activeLines: [] }
  }

  return { snapped: best.snapped, activeLines: [best.line] }
}

export function computeAlignmentSnap(
  x: number,
  y: number,
  width: number,
  height: number,
  printArea: Rect,
  canvas: { width: number; height: number },
  others: Rect[],
): { x: number; y: number; guides: GuideLines } {
  const verticalLines = [
    printArea.x,
    printArea.x + printArea.width / 2,
    printArea.x + printArea.width,
    canvas.width / 2,
    ...others.flatMap((o) => [o.x, o.x + o.width / 2, o.x + o.width]),
  ]

  const horizontalLines = [
    printArea.y,
    printArea.y + printArea.height / 2,
    printArea.y + printArea.height,
    canvas.height / 2,
    ...others.flatMap((o) => [o.y, o.y + o.height / 2, o.y + o.height]),
  ]

  const snapX = snapEdge(x, width, verticalLines)
  const snapY = snapEdge(y, height, horizontalLines)

  return {
    x: snapX.snapped,
    y: snapY.snapped,
    guides: {
      vertical: snapX.activeLines,
      horizontal: snapY.activeLines,
    },
  }
}

/** Líneas de referencia visibles mientras se arrastra (cerca del snap) */
export function getProximityGuides(
  x: number,
  y: number,
  width: number,
  height: number,
  printArea: Rect,
  canvas: { width: number; height: number },
  others: Rect[],
): GuideLines {
  const PROX = 12
  const vertical = new Set<number>()
  const horizontal = new Set<number>()

  const xChecks = [
    { edge: x, lines: vertical },
    { edge: x + width / 2, lines: vertical },
    { edge: x + width, lines: vertical },
  ]
  const yChecks = [
    { edge: y, lines: horizontal },
    { edge: y + height / 2, lines: horizontal },
    { edge: y + height, lines: horizontal },
  ]

  const vTargets = [
    printArea.x,
    printArea.x + printArea.width / 2,
    printArea.x + printArea.width,
    canvas.width / 2,
    ...others.flatMap((o) => [o.x, o.x + o.width / 2, o.x + o.width]),
  ]
  const hTargets = [
    printArea.y,
    printArea.y + printArea.height / 2,
    printArea.y + printArea.height,
    canvas.height / 2,
    ...others.flatMap((o) => [o.y, o.y + o.height / 2, o.y + o.height]),
  ]

  for (const check of xChecks) {
    for (const line of vTargets) {
      if (Math.abs(check.edge - line) <= PROX) vertical.add(line)
    }
  }
  for (const check of yChecks) {
    for (const line of hTargets) {
      if (Math.abs(check.edge - line) <= PROX) horizontal.add(line)
    }
  }

  return {
    vertical: [...vertical],
    horizontal: [...horizontal],
  }
}
