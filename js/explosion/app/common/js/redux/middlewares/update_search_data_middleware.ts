import { AnyAction } from 'redux'
import { batchActions } from 'redux-batched-actions'
import { UPDATE_SEARCH_DATA } from '../types/search_params.types'

const actionFieldToAnotherAction = {
  requestId: 'UPDATE_REQUEST_ID',
  flightInfo: 'ADD_FLIGHT_INFO',
  adsenseQuery: 'ADD_ADSENSE_PARAMS',
  topPlacementTicket: 'ADD_TOP_PLACEMENT_TICKET',
  ticket: 'UPDATE_CHEAPEST_TICKET',
  cityDistance: 'ADD_CITY_DISTANCE',
  savedFiltersHighlighted: 'HIGHLIGHT_SAVED_FILTERS',
  savedFilters: 'ADD_SAVED_FILTERS',
  bestSellerData: 'ADD_BEST_SELLER_DATA',
  heaviestTopPlacementCampaign: 'ADD_HEAVIEST_TOP_PLACEMENT_CAMPAIGN',
  showGatesFeedbackData: 'UPDATE_SHOW_GATES_FEEDBACK_DATA',
  creditPartner: 'UPDATE_CREDIT_PARTNER',
  sort: 'UPDATE_SORT',
  searchId: 'UPDATE_SEARCH_ID',
  airports: 'ADD_AIRPORTS',
  gates: 'ADD_GATES',
  currencies: 'UPDATE_CURRENCIES',
}

const actionFieldToAnotherActionKeys = Object.keys(actionFieldToAnotherAction)

export default (store: any) => (next: any) => (action: any) => {
  if (action.type === UPDATE_SEARCH_DATA) {
    const actions: AnyAction[] = []
    actionFieldToAnotherActionKeys.map((key) => {
      if (action[key]) {
        actions.push({ type: actionFieldToAnotherAction[key], [key]: action[key] })
      }
    })

    store.dispatch(batchActions(actions))
  }

  return next(action)
}
