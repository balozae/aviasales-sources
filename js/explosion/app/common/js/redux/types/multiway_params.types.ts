import { SearchParams } from 'form/components/avia_form/avia_form.types'

export const UPDATE_MULTIWAY_PARAMS = 'UPDATE_MULTIWAY_PARAMS'
export const RESET_MULTIWAY_PARAMS = 'RESET_MULTIWAY_PARAMS'

export type UpdateMultiwayParamsAction = {
  type: typeof UPDATE_MULTIWAY_PARAMS
  params: Partial<SearchParams>
}

export type ResetMultiwayParamsAction = {
  type: typeof RESET_MULTIWAY_PARAMS
}

export type MultiwayParamsActions = UpdateMultiwayParamsAction | ResetMultiwayParamsAction

export type MultiwayParamsState = SearchParams
