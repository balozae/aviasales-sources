import { SearchHistoryState, UpdateSearchHistoryAction } from '../types/search_history.types'

export const initialState: SearchHistoryState = []

export default (state: SearchHistoryState = initialState, action: UpdateSearchHistoryAction) => {
  switch (action.type) {
    case 'UPDATE_SEARCH_HISTORY':
      return action.searches
    default:
      return state
  }
}
