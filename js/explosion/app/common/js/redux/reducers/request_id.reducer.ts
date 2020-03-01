import { UPDATE_REQUEST_ID, RequestIdState, RequestIdActions } from '../types/request_id.types'

export const initialState: RequestIdState = null

export default function(state: RequestIdState = initialState, action: RequestIdActions) {
  switch (action.type) {
    case UPDATE_REQUEST_ID:
      return action.requestId
    default:
      return state
  }
}
