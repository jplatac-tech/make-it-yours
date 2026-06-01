export type DesignShape = {
  id: string
  type: 'text' | 'icon' | 'image'
  x: number
  y: number
  text?: string
  fontSize?: number
  fontFamily?: string
  fontWeight?: number
  fontStyle?: 'normal' | 'italic'
  textDecoration?: 'none' | 'underline' | 'line-through'
  letterSpacing?: number
  color?: string
  /** Recorte de imagen (0–0.45 por lado, fracción del tamaño) */
  cropTop?: number
  cropRight?: number
  cropBottom?: number
  cropLeft?: number
  src?: string
  width?: number
  height?: number
  scale?: number
  /** Grados (-180 a 180) */
  rotation?: number
  /** 0 = cuadrado, 50 = redondeado, 50+ = círculo en imágenes */
  borderRadius?: number
  opacity?: number
  /** Voltear horizontalmente (imágenes) */
  flipX?: boolean
  /** Orden de apilamiento: mayor = más arriba */
  layer?: number
}
