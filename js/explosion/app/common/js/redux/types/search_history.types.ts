import { SearchHistoryItem } from 'guestia_client/lib/types'

export const UPDATE_SEARCH_HISTORY = 'UPDATE_SEARCH_HISTORY'

export type Searches = SearchHistoryItem[]

export type UpdateSearchHistoryAction = {
  type: 'UPDATE_SEARCH_HISTORY'
  searches: Searches
}

export type SearchHistoryActions = UpdateSearchHistoryAction

export type SearchHistoryState = Searches
