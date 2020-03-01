import {
  GatesMetaState,
  GatesMetaActions,
  UPDATE_GATES_META,
  RESET_GATES_META,
} from '../types/gates_meta.types'

export const initialState: GatesMetaState = Object.freeze({})

export default function(state: GatesMetaState = initialState, action: GatesMetaActions) {
  switch (action.type) {
    case UPDATE_GATES_META: {
      return { ...state, ...action.data }
    }

    case RESET_GATES_META: {
      return initialState
    }

    default:
      return state
  }
}
