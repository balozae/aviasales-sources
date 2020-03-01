import { SysStateActions, SysState, SET_SYS_STATE } from '../types/sys_state.types'

export const setSysState = (state: SysState): SysStateActions => ({
  type: SET_SYS_STATE,
  state,
})

export const toggleNightMode = (toggle: boolean): SysStateActions => {
  const state: SysState = toggle ? '4' : '5'
  return { type: 'SET_SYS_STATE', state }
}
