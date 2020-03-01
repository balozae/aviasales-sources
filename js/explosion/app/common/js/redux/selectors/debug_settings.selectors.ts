import { AppState } from '../types/root/explosion'

export const getDebugSettings = (state: AppState) => state.debugSettings

export const getDebugBags = (state: AppState) => getDebugSettings(state).debugBags

export const getYasenDebug = (state: AppState) => getDebugSettings(state).yasenDebug

export const getDebugUrl = (state: AppState) => getDebugSettings(state).debugUrl

export const getDebugMetrics = (state: AppState) => getDebugSettings(state).debugMetrics

export const getTurnOffPrerollTimeout = (state: AppState) =>
  getDebugSettings(state).turnOffPrerollTimeout

export const getTurnOffAnnoyingPopups = (state: AppState) =>
  getDebugSettings(state).turnOffAnnoyingPopups

export default {}
