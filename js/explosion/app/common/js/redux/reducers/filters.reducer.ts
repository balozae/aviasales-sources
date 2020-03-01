import update from 'immutability-helper'
import {
  FiltersState,
  FiltersActions,
  UPDATE_FILTERS,
  UPDATE_FILTER,
  RESET_FILTERS,
  RESET_FILTER,
  RESET_FILTER_SUCCESS,
  EXPAND_FILTER,
  EXPAND_FILTER_SUCCESS,
  OPEN_FILTER,
  CLOSE_FILTER,
} from '../types/filters.types'

const initialState: FiltersState = Object.freeze({
  changedFilters: [],
  precheckedFilters: [],
  openedFilters: [],
  isFiltersChangedByUser: false,
  filtersChangedByUser: [],
  // resetFilter: null,
  // expandFilter: null,
  // filters: {},
})

export default function(state: FiltersState = initialState, action: FiltersActions) {
  switch (action.type) {
    case UPDATE_FILTERS: {
      const filters = Object.assign(action.filters)
      if (state.resetFilter) {
        filters.resetFilter = state.resetFilter
      }
      if (state.expandFilter) {
        filters.expandFilter = state.expandFilter
      }
      if (state.openedFilters) {
        filters.openedFilters = state.openedFilters
      }
      return filters
    }
    case UPDATE_FILTER:
      if (action.filterField) {
        return update(state, {
          filters: {
            [action.filterName]: {
              [action.filterField]: { $set: action.filterValue },
            },
          },
        })
      }
      return update(state, {
        filters: {
          [action.filterName]: { $set: action.filterValue },
        },
      })
    case RESET_FILTERS:
      return initialState
    case RESET_FILTER:
      return update(state, { resetFilter: { $set: action.filter } })
    case RESET_FILTER_SUCCESS:
      return update(state, { $unset: ['resetFilter'] })
    case EXPAND_FILTER:
      return update(state, { expandFilter: { $set: action.filter } })
    case EXPAND_FILTER_SUCCESS:
      return update(state, { $unset: ['expandFilter'] })
    case OPEN_FILTER:
      if (state.openedFilters.indexOf(action.filter) !== -1) {
        return state
      }
      return update(state, {
        openedFilters: {
          $push: [action.filter],
        },
      })
    case CLOSE_FILTER: {
      const index = state.openedFilters.indexOf(action.filter)
      if (index === -1) {
        return state
      }
      return update(state, {
        openedFilters: {
          $splice: [[index, 1]],
        },
      })
    }
    default:
      return state
  }
}
