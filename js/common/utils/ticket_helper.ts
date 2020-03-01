import { Ticket, Terms, Flight } from 'common/types'

export function getCheapestTicket([ticket, terms]: [Ticket, Terms]) {
  const cheapestTerm = getCheapestTerm(terms)
  return {
    ...ticket,
    terms: { [cheapestTerm.gate_id]: cheapestTerm },
    xterms: { [cheapestTerm.gate_id]: cheapestTerm },
  }
}

const getCheapestTerm = (terms: Terms) => {
  const termsArray = Object.keys(terms).map((key) => terms[key])

  return termsArray.reduce((cheapest, term) => {
    return term.unified_price < cheapest.unified_price ? term : cheapest
  }, termsArray[0])
}

export function getChespestPrice(terms: Terms) {
  return getCheapestTerm(terms).unified_price
}

export function getFirstFlight(ticket: Ticket): Flight {
  return ticket.segment[0].flight[0]
}

export function getReturnFlight(ticket: Ticket): Flight {
  return ticket.segment[ticket.segment.length - 1].flight[0]
}
