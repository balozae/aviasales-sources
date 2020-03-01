import {
  IsBlackOverlayShownState,
  IsBlackOverlayShownActions,
  SHOW_BLACK_OVERLAY,
  HIDE_BLACK_OVERLAY,
} from '../types/is_black_overlay_shown.types'

export const initialState: IsBlackOverlayShownState = false

export default function(
  state: IsBlackOverlayShownState = initialState,
  action: IsBlackOverlayShownActions,
) {
  switch (action.type) {
    case SHOW_BLACK_OVERLAY:
      return true
    case HIDE_BLACK_OVERLAY:
      return false
    default:
      return state
  }
}
