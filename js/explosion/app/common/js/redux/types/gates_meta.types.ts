export const UPDATE_GATES_META = 'UPDATE_GATES_META'
export const RESET_GATES_META = 'RESET_GATES_META'

export type UpdateGatesMetaAction = {
  type: typeof UPDATE_GATES_META
  data: any
}

export type ResetGatesMetaAction = {
  type: typeof RESET_GATES_META
}

export type GatesMetaActions = UpdateGatesMetaAction | ResetGatesMetaAction

export type GatesMetaState = { [key: string]: any }
