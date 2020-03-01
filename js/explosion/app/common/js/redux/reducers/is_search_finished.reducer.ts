import { IsSearchFinishedState } from '../types/is_search_finished.types'
import { UPDATE_SEARCH_STATUS, UpdateSearchStatusAction } from '../types/search_status.types'
import { SearchStatus } from 'common/base_types'

export const initialState: IsSearchFinishedState = false

export default function(
  state: IsSearchFinishedState = initialState,
  action: UpdateSearchStatusAction,
) {
  switch (action.type) {
    case UPDATE_SEARCH_STATUS: {
      if (action.status === SearchStatus.Finished || action.status === SearchStatus.Expired) {
        return true
      }

      return state
    }
    default:
      return state
  }
}
