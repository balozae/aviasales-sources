import {
  SavedFiltersHighlightedState,
  HighlightSaverFiltersAction,
} from '../types/saved_filters_highlighted.types'

export const initialState: SavedFiltersHighlightedState = false

export default function(
  state: SavedFiltersHighlightedState = initialState,
  action: HighlightSaverFiltersAction,
) {
  switch (action.type) {
    case 'HIGHLIGHT_SAVED_FILTERS':
      return action.savedFiltersHighlighted
    default:
      return state
  }
}
