import { OfflineState, SetOfflineAction } from '../types/offline.types'

export const initialState: OfflineState = Object.freeze({
  isOffline: false,
})

export default (state: OfflineState = initialState, action: SetOfflineAction) => {
  switch (action.type) {
    case 'SET_OFFLINE':
      return {
        ...state,
        isOffline: action.payload.isOffline,
      }
    default:
      return state
  }
}
