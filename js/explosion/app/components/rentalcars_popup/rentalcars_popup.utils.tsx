import { TicketData } from 'shared_components/ticket/ticket_incoming_data.types'
import { stringify } from 'query-string'

const BASE_RENTALCARS_URL = 'https://www.rentalcars.com/SearchLoaderRC.do'

export const buildRentalcarsDeepLink = (data: TicketData): string => {
  const departureSegment = data.segment[0]
  const lastDepartureFlight = departureSegment.flight[departureSegment.flight.length - 1]
  const arrivalIata = lastDepartureFlight.arrival
  const { arrival_date, arrival_time } = lastDepartureFlight
  const pickUpDateWithTime = new Date(`${arrival_date.replace('-', '/')} ${arrival_time}`) // NOTE: replace for safari
  pickUpDateWithTime.setHours(pickUpDateWithTime.getHours() + 1)

  const returnSegment = data.segment[1]
  const returnFlight = returnSegment && returnSegment.flight[0]
  const dropOffDateWithTime = returnFlight
    ? // NOTE: replace for safari
      new Date(`${returnFlight.departure_date.replace('-', '/')} ${returnFlight.departure_time}`)
    : // NOTE: set drop off time in 1 week
      new Date(pickUpDateWithTime.getTime() + 7 * 24 * 60 * 60 * 1000)

  dropOffDateWithTime.setHours(dropOffDateWithTime.getHours() - 2)

  const params = {
    affiliateCode: 'aviasalesr191',
    adplat: 'exitunit',
    adcamp: 'searchresults',
    to: arrivalIata,
    from: arrivalIata,
    puDay: pickUpDateWithTime.getDate(),
    puMonth: pickUpDateWithTime.getMonth() + 1,
    puYear: pickUpDateWithTime.getFullYear(),
    puHour: pickUpDateWithTime.getHours(),
    puMinute: pickUpDateWithTime.getMinutes(),
    doDay: dropOffDateWithTime.getDate(),
    doMonth: dropOffDateWithTime.getMonth() + 1,
    doYear: dropOffDateWithTime.getFullYear(),
    doHour: dropOffDateWithTime.getHours(),
    doMinute: dropOffDateWithTime.getMinutes(),
    driversAge: 25,
  }

  return `${BASE_RENTALCARS_URL}?${stringify(params)}`
}
