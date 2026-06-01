/** Altura del header sticky (alineado con site-header) */
export const EDITOR_HEADER_H_MOBILE_PX = 56
export const EDITOR_HEADER_H_DESKTOP_PX = 60

/** Área útil del editor bajo el header (preferir clase `.editor-shell-height` en CSS). */
export function editorViewportHeightCss(desktop: boolean): string {
  const header = desktop ? EDITOR_HEADER_H_DESKTOP_PX : EDITOR_HEADER_H_MOBILE_PX
  return desktop
    ? `calc(100dvh - ${header}px)`
    : `calc(100svh - ${header}px)`
}
