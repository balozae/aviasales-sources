import { actualizeTicketsSubscriberSERP } from '../actions/ticket_subscriptions.actions'
import { UPDATE_MARKER } from '../types/marker.types'
import { CHANGE_USER_LANGUAGE } from '../types/i18n.types'
import { UPDATE_USER_SETTING } from 'user_account/types/user_settings.types'
import { FETCH_TICKET_SUBSCRIPTIONS_SUCCESS_EXPLOSION } from '../types/ticket_subscriptions.types'
import { fetchTicketSubscriptions } from 'common/js/redux/actions/ticket_subscriptions.actions'
import { USER_INFO_SUCCESS } from 'user_account/types/user_info.types'
import { UPDATE_CURRENCY } from '../types/currency.types'
import { UPDATE_SEARCH_STATUS } from '../types/search_status.types'

export default ({ dispatch }) => (next) => async (action) => {
  switch (action.type) {
    case UPDATE_CURRENCY:
      await next(action)
      dispatch(actualizeTicketsSubscriberSERP())
      break
    case UPDATE_MARKER:
      await next(action)
      dispatch(actualizeTicketsSubscriberSERP())
      break
    case CHANGE_USER_LANGUAGE:
      await next(action)
      dispatch(actualizeTicketsSubscriberSERP())
      break
    case FETCH_TICKET_SUBSCRIPTIONS_SUCCESS_EXPLOSION:
      await next(action)
      dispatch(actualizeTicketsSubscriberSERP())
      break
    case UPDATE_SEARCH_STATUS:
      await next(action)
      if (action.status === 'SHOWN') {
        dispatch(fetchTicketSubscriptions())
      }
      break
    case USER_INFO_SUCCESS:
      await next(action)
      if (window.isSearchPage) {
        dispatch(fetchTicketSubscriptions())
      }
      break
    default:
      return next(action)
  }
}
