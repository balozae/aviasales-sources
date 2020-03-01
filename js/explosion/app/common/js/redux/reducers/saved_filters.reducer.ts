import { SavedFiltersState, AddSavedFiltersAction } from '../types/saved_filters.types'

export const initialState: SavedFiltersState = null

export default function(state: SavedFiltersState = initialState, action: AddSavedFiltersAction) {
  switch (action.type) {
    case 'ADD_SAVED_FILTERS':
      return action.savedFilters
    default:
      return state
  }
}
