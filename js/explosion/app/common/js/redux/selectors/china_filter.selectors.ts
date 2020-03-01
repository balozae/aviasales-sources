import { AppState } from '../types/root/explosion'

export const getChinaNotifyIsVisible = (state: AppState) =>
  state.chinaNotify.warningNotify.isVisible

export const getChinaInfoNotifyIsVisible = (state: AppState) =>
  state.chinaNotify.infoNotify.isVisible

export const getIsChinaNotifyShown = (state: AppState) => state.chinaNotify.warningNotify.isShown
