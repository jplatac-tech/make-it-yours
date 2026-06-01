import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  hasDesignElements,
  parseStoredDesign,
} from './design-storage'

describe('hasDesignElements', () => {
  it('returns false for null', () => {
    assert.equal(hasDesignElements(null), false)
  })

  it('detects shapes in zones', () => {
    const json = JSON.stringify({
      canvas: { width: 400, height: 520 },
      shapesByZone: { FRONT: [{ id: '1' }], BACK: [] },
    })
    assert.equal(hasDesignElements(json), true)
  })

  it('returns false for empty zones', () => {
    const json = JSON.stringify({
      shapesByZone: { FRONT: [], BACK: [] },
    })
    assert.equal(hasDesignElements(json), false)
  })
})

describe('parseStoredDesign', () => {
  it('reads productSlug', () => {
    const json = JSON.stringify({
      productSlug: 'crewneck-unisex',
      shapesByZone: { FRONT: [], BACK: [] },
    })
    assert.equal(parseStoredDesign(json)?.productSlug, 'crewneck-unisex')
  })
})
