import {
  DebugSettingsState,
  DebugSettingActions,
  SET_DEBUG_SETTING,
} from '../types/debug_settings.types'
import { getDebugSettingsFromClient } from 'components/yasen_client_debugger/debug_settings'

export const initialState: DebugSettingsState = Object.freeze(
  getDebugSettingsFromClient() as DebugSettingsState,
)

export default function(state: DebugSettingsState = initialState, action: DebugSettingActions) {
  switch (action.type) {
    case SET_DEBUG_SETTING: {
      const newState = { ...state }
      newState[action.name] = action.value
      return newState
    }
    default:
      return state
  }
}
