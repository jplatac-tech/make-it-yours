import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { applyLayerMove, getShapeZIndex, sortShapesByLayer } from './shape-layers'
import type { DesignShape } from '../types/design'

function shape(id: string, layer: number): DesignShape {
  return { id, type: 'text', text: id, x: 0, y: 0, layer }
}

describe('applyLayerMove', () => {
  const stack = [
    shape('back', 1),
    shape('mid', 2),
    shape('front', 3),
  ]

  it('forward moves one step toward front', () => {
    const next = applyLayerMove(stack, 'back', 'forward')
    const order = sortShapesByLayer(next).map((s) => s.id)
    assert.deepEqual(order, ['mid', 'back', 'front'])
  })

  it('backward moves one step toward back', () => {
    const next = applyLayerMove(stack, 'front', 'backward')
    const order = sortShapesByLayer(next).map((s) => s.id)
    assert.deepEqual(order, ['back', 'front', 'mid'])
  })

  it('toFront moves to top', () => {
    const next = applyLayerMove(stack, 'back', 'toFront')
    assert.equal(sortShapesByLayer(next).at(-1)?.id, 'back')
  })

  it('toBack moves to bottom', () => {
    const next = applyLayerMove(stack, 'front', 'toBack')
    assert.equal(sortShapesByLayer(next).at(0)?.id, 'front')
  })
})

describe('getShapeZIndex', () => {
  it('uses layer for stacking order', () => {
    assert.ok(getShapeZIndex(shape('a', 1)) < getShapeZIndex(shape('b', 3)))
  })
})
