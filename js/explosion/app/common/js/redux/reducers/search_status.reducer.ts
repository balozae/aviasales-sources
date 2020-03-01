import { SearchStatus } from 'common/base_types'
import {
  SearchStatusState,
  UpdateSearchStatusAction,
  UPDATE_SEARCH_STATUS,
} from '../types/search_status.types'

export const initialState: SearchStatus = SearchStatus.Inited

export default function(state: SearchStatusState = initialState, action: UpdateSearchStatusAction) {
  switch (action.type) {
    case UPDATE_SEARCH_STATUS: {
      return action.status
    }
    default:
      return state
  }
}
