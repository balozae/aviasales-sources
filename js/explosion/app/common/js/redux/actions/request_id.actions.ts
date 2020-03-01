import { UPDATE_REQUEST_ID, RequestIdState, RequestIdActions } from '../types/request_id.types'

export const updateRequestId = (requestId: RequestIdState): RequestIdActions => ({
  type: UPDATE_REQUEST_ID,
  requestId,
})
