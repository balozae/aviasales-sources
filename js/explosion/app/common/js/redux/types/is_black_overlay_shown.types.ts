export const SHOW_BLACK_OVERLAY = 'SHOW_BLACK_OVERLAY'
export const HIDE_BLACK_OVERLAY = 'HIDE_BLACK_OVERLAY'

interface ShowBlackOverlayAction {
  type: typeof SHOW_BLACK_OVERLAY
}

interface HideBlackOverlayAction {
  type: typeof HIDE_BLACK_OVERLAY
}

export type IsBlackOverlayShownActions = ShowBlackOverlayAction | HideBlackOverlayAction

export type IsBlackOverlayShownState = boolean
