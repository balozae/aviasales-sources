import localStorageHelper from 'local_storage_helper.coffee'
import { SysStateState, SysStateActions, SET_SYS_STATE } from '../types/sys_state.types'

export const initialState: SysStateState = localStorageHelper.getItem('sysState') || '0'

export default function(state: SysStateState = initialState, action: SysStateActions) {
  switch (action.type) {
    case SET_SYS_STATE:
      return action.state
    default:
      return state
  }
}
