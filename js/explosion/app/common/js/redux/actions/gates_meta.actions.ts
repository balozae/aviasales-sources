import { UPDATE_GATES_META, GatesMetaActions, RESET_GATES_META } from '../types/gates_meta.types'

export const updateGatesMeta = (data): GatesMetaActions => ({
  type: UPDATE_GATES_META,
  data,
})

export const resetGatesMeta = (): GatesMetaActions => ({
  type: RESET_GATES_META,
})
