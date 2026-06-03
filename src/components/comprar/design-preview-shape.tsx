'use client'

import { getShapeZIndex } from '../../lib/shape-layers'
import {
  getImageBorderRadius,
  getImageCropStyle,
  getTextStyleProps,
} from '../../lib/shape-transform'
import { getShapeScales } from '../../lib/shape-scales'
import type { DesignShape } from '../../types/design'

function getShapeBounds(shape: DesignShape) {
  const { scaleX, scaleY } = getShapeScales(shape)
  if (shape.type === 'image') {
    return {
      width: (shape.width ?? 140) * scaleX,
      height: (shape.height ?? 140) * scaleY,
    }
  }
  const fontSize = shape.fontSize ?? 28
  const chars = shape.text?.length ?? 4
  return {
    width: Math.min(chars * fontSize * 0.55, 220) * scaleX,
    height: fontSize * 1.25 * scaleY,
  }
}

export function DesignPreviewShape({ shape }: { shape: DesignShape }) {
  const bounds = getShapeBounds(shape)
  const { scaleX, scaleY } = getShapeScales(shape)
  const rotation = shape.rotation ?? 0
  const baseW =
    shape.type === 'image'
      ? (shape.width ?? 140)
      : bounds.width / Math.max(scaleX, 0.01)
  const baseH =
    shape.type === 'image'
      ? (shape.height ?? 140)
      : bounds.height / Math.max(scaleY, 0.01)

  return (
    <div
      className="pointer-events-none absolute touch-none"
      style={{
        left: shape.x,
        top: shape.y,
        transform: `rotate(${rotation}deg)`,
        transformOrigin: 'center center',
        zIndex: getShapeZIndex(shape),
        opacity: shape.opacity ?? 1,
      }}
    >
      <div
        className="relative"
        style={{ width: bounds.width, height: bounds.height }}
      >
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{
            width: baseW,
            height: baseH,
            transform: `scale(${scaleX}, ${scaleY})`,
          }}
        >
          {shape.type === 'image' && shape.src ? (
            <div
              className="relative inline-block leading-none"
              style={shape.flipX ? { transform: 'scaleX(-1)' } : undefined}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={shape.src}
                alt=""
                draggable={false}
                className="block max-w-none select-none"
                style={{
                  width: shape.width,
                  height: shape.height,
                  borderRadius: getImageBorderRadius(shape),
                  ...getImageCropStyle(shape),
                }}
              />
            </div>
          ) : (
            <span className="inline-block select-none" style={getTextStyleProps(shape)}>
              {shape.text}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
