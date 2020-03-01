import { SortState, SortActions, UPDATE_SORT, RESET_SORT } from '../types/sort.types'

export const initialState: SortState = 'price'

export default function(state: SortState = initialState, action: SortActions) {
  switch (action.type) {
    case UPDATE_SORT:
      return action.sort
    case RESET_SORT:
      return initialState
    default:
      return state
  }
}
