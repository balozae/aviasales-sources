import update from 'immutability-helper'
import { PopupsState, ADD_POPUP, REMOVE_POPUP, PopupActions } from '../types/popups.types'

export const initialState: PopupsState = Object.freeze({})

export default function(state: PopupsState = initialState, action: PopupActions) {
  switch (action.type) {
    case ADD_POPUP:
      return update(state, { [action.popupType]: { $set: action.data || {} } })
    case REMOVE_POPUP:
      return update(state, { $unset: [action.popupType] })
    default:
      return state
  }
}
