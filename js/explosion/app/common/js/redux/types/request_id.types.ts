export const UPDATE_REQUEST_ID = 'UPDATE_REQUEST_ID'

export type UpdateRequestIdAction = {
  type: typeof UPDATE_REQUEST_ID
  requestId: RequestIdState
}

export type RequestIdActions = UpdateRequestIdAction

export type RequestIdState = string | null
