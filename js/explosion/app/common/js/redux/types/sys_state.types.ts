export const SET_SYS_STATE = 'SET_SYS_STATE'

export type SysState = '0' | '1' | '2' | '3' | '4' | '5'

export type SetSysStateAction = {
  type: typeof SET_SYS_STATE
  state: SysState
}

export type SysStateActions = SetSysStateAction

export type SysStateState = SysState
