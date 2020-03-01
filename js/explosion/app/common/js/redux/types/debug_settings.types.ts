export const SET_DEBUG_SETTING = 'SET_DEBUG_SETTING'

interface SetDebugSettingAction {
  type: typeof SET_DEBUG_SETTING
  name: string
  value: any
}

export type DebugSettingsState = {
  yasenDebug: boolean
  debugUrl: boolean
  debugMetrics: boolean
  debugBags: boolean
  turnOffAnnoyingPopups: boolean
  turnOffPrerollTimeout: boolean
}
export type DebugSettingActions = SetDebugSettingAction
