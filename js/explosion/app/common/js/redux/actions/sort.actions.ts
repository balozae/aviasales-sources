import { SortState, SortActions, UPDATE_SORT, RESET_SORT } from '../types/sort.types'

export const updateSort = (sort: SortState): SortActions => ({ type: UPDATE_SORT, sort })

export const resetSort = (): SortActions => ({ type: RESET_SORT })
