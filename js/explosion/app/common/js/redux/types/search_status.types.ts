import { SearchStatus } from 'common/base_types'

export const UPDATE_SEARCH_STATUS = 'UPDATE_SEARCH_STATUS'

export type UpdateSearchStatusAction = {
  type: typeof UPDATE_SEARCH_STATUS
  status: SearchStatus
}

export type SearchStatusActions = UpdateSearchStatusAction

export type SearchStatusState = SearchStatus
