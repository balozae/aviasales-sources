import { SearchIdState, UpdateSearchIdAction } from '../types/search_id.types'

export const initialState: SearchIdState = null

export default function(state: SearchIdState = initialState, action: UpdateSearchIdAction) {
  switch (action.type) {
    case 'UPDATE_SEARCH_ID':
      return action.searchId
    default:
      return state
  }
}
