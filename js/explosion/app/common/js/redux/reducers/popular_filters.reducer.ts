import { PopularFiltersState } from '../types/popular_filters.types'
import { UPDATE_SEARCH_DATA, SearchParamsActions } from '../types/search_params.types'

export const initialState: PopularFiltersState = []

export default (state: PopularFiltersState = initialState, action: SearchParamsActions) => {
  switch (action.type) {
    case UPDATE_SEARCH_DATA:
      return action.popularFilters || state
    default:
      return state
  }
}
