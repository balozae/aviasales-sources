import { AppState } from '../types/root/explosion'
import { PopupType } from '../types/popups.types'

export const getPopups = (state: AppState) => state.popups

export const getPopupDataByType = (state: AppState, type: PopupType) => getPopups(state)[type]
