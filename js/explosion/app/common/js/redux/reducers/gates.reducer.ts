import { GatesState, AddGatesAction } from '../types/gates.types'

export const initialState: GatesState = Object.freeze({})

export default function(state: GatesState = initialState, action: AddGatesAction) {
  switch (action.type) {
    case 'ADD_GATES':
      return action.gates
    default:
      return state
  }
}
