import { AppState } from '../types/root/explosion'
import { SYSState } from 'common/js/sys_controller'

export const getSysState = (state: AppState) => state.sysState

export const isNightMode = (state: AppState) => {
  const sysState = getSysState(state)
  return sysState === SYSState.AutoEnabled || sysState === SYSState.UserEnabled
}
