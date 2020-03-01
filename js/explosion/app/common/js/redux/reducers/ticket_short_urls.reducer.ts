import {
  TicketShortUrlsState,
  TicketShortUrlsActions,
  ADD_TICKET_SHORT_URL,
} from '../types/ticket_short_urls.types'

const initialState = Object.freeze({})

export default (state: TicketShortUrlsState = initialState, action: TicketShortUrlsActions) => {
  switch (action.type) {
    case ADD_TICKET_SHORT_URL:
      return { ...state, [action.sign]: action.url }

    default:
      return state
  }
}
