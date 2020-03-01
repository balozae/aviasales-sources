import { ServerNameState, ServerNameActions, UPDATE_SERVER_NAME } from '../types/server_name.types'

export const initialState: ServerNameState = Object.freeze({
  name: null,
  requestId: null,
})

export default function(state: ServerNameState = initialState, action: ServerNameActions) {
  switch (action.type) {
    case UPDATE_SERVER_NAME: {
      return {
        ...state,
        name: action.serverName,
        requestId: action.requestId,
      }
    }
    default:
      return state
  }
}
