import {
  UPDATE_CURRENT_PAGE,
  CurrentPageActionTypes,
  CurrentPageState,
} from '../types/current_page.types'

declare global {
  interface Window {
    currentPage: CurrentPageState
  }
}

export const initialState: CurrentPageState = window.currentPage || 'content'

export default (state = initialState, action: CurrentPageActionTypes) => {
  switch (action.type) {
    case UPDATE_CURRENT_PAGE:
      return action.page
    default:
      return state
  }
}
