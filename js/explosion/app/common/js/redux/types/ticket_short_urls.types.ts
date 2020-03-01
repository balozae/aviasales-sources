export const ADD_TICKET_SHORT_URL = 'ADD_TICKET_SHORT_URL'

export interface TicketAddShortUrlAction {
  type: typeof ADD_TICKET_SHORT_URL
  sign: string
  url: string
}

export type TicketShortUrlsState = { [sign: string]: string }

export type TicketShortUrlsActions = TicketAddShortUrlAction
