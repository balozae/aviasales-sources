export const UPDATE_SORT = 'UPDATE_SORT'
export const RESET_SORT = 'RESET_SORT'

interface UpdateSortAction {
  type: typeof UPDATE_SORT
  sort: SortState
}

interface ResetSortAction {
  type: typeof RESET_SORT
}

export type SortActions = UpdateSortAction | ResetSortAction

export type SortState = 'price' | 'duration' | 'rating'
