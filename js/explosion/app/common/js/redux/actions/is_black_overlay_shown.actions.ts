import {
  SHOW_BLACK_OVERLAY,
  IsBlackOverlayShownActions,
  HIDE_BLACK_OVERLAY,
} from '../types/is_black_overlay_shown.types'

export const showBlackOverlay = (): IsBlackOverlayShownActions => ({ type: SHOW_BLACK_OVERLAY })
export const hideBlackOverlay = (): IsBlackOverlayShownActions => ({ type: HIDE_BLACK_OVERLAY })
