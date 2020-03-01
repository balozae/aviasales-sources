import {
  BrowserHistoryState,
  BrowserHistoryActions,
  UPDATE_BROWSER_HISTORY,
} from '../types/browser_history.types'

export const initialState: BrowserHistoryState = []

export default function(state: BrowserHistoryState = initialState, action: BrowserHistoryActions) {
  switch (action.type) {
    case UPDATE_BROWSER_HISTORY:
      return [...state, action.data]
    default:
      return state
  }
}
