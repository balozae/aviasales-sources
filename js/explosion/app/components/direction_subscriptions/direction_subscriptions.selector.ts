import { createSelector } from 'reselect'
import { getSearchParams } from 'common/js/redux/selectors/search_params.selectors'
import { getCheapestTicket } from 'common/js/redux/selectors/cheapest_ticket.selectors'

export const getDirectionSubscriptionsGoalData = createSelector(
  getSearchParams,
  getCheapestTicket,
  (searchParams, cheapestTicket) => {
    if (!searchParams) {
      return
    }

    const { origin, destination } = searchParams.segments[0]
    const departDate = searchParams.segments[0].date
    const returnDate = searchParams.segments[1] ? searchParams.segments[1].date : null
    let cheapestTicketPrice: number | null = null
    if (cheapestTicket) {
      cheapestTicketPrice = parseInt(cheapestTicket[1][0].unified_price as any, 10)
    }

    return {
      origin,
      destination,
      departDate,
      returnDate,
      minTicketPrice: cheapestTicketPrice,
    }
  },
)
