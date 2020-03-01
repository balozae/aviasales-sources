import { TicketShortUrlsActions, ADD_TICKET_SHORT_URL } from '../types/ticket_short_urls.types'

export const addTicketShortUrl = (sign: string, url: string): TicketShortUrlsActions => ({
  type: ADD_TICKET_SHORT_URL,
  sign,
  url,
})
