import cookie from 'oatmeal-cookie'
import {
  RawProposal,
  TicketTuple,
  TicketData,
  Flight,
} from 'shared_components/ticket/ticket_incoming_data.types'
import { Gates, SearchParams, Airports, Airlines } from 'shared_components/ticket/ticket.types'
import { isFullyTrain } from 'shared_components/ticket/utils/ticket_common.utils'
import flagr from 'common/utils/flagr_client_instance'

const ID_MARKET = '777'
const PASSWORD = '1fe036ad0201fd8621b563aa98ac6eea'
export const UNIQ_COOKIE_KEY = 'click_to_credit_button'

export interface CreditPartner {
  host: string
  max_price: number
  name?: string
}

type CreditFormParams = { key: string; value: string | number }[]

export const shouldShowCredit = (
  creditPartner: CreditPartner,
  proposals: RawProposal[],
): boolean => {
  const mainProposal = proposals[0]
  return (
    mainProposal &&
    creditPartner &&
    flagr.is('avs-feat-creditLink') &&
    (!creditPartner.max_price || mainProposal.unified_price <= creditPartner.max_price)
  )
}

export const creditFormSubmit = (
  ticket: TicketTuple,
  gates: Gates,
  airports: Airports,
  airlines: Airlines,
  searchParams: SearchParams,
  marker: string,
  creditPartner: CreditPartner,
) => {
  const [ticketData, proposals] = ticket
  const params: CreditFormParams = [
    { key: 'id_market', value: ID_MARKET },
    { key: 'password', value: PASSWORD },
    { key: 'count_adult', value: searchParams.passengers.adults },
    { key: 'price', value: proposals[0].unified_price },
    { key: 'marker', value: marker },
  ]
  proposals.forEach((proposal, index) => {
    const gate = gates[proposal.gate_id]
    params.push(
      { key: `links[${index}][link]`, value: '' },
      { key: `links[${index}][price]`, value: proposal.unified_price },
      { key: `links[${index}][provider]`, value: gate.label },
      { key: `links[${index}][gate_name]`, value: gate.label },
    )
  })
  ticketData.segment.forEach((segment, segmentIndex) => {
    segment.flight.forEach((flight, flightIndex) => {
      const prefix = `segments[${segmentIndex}][flight][${flightIndex}]`
      params.push(
        {
          key: `${prefix}[departure_country]`,
          value: airports[flight.departure].country || '',
        },
        { key: `${prefix}[departure_airport_code]`, value: flight.departure },
        {
          key: `${prefix}[departure_airport_name]`,
          value: `${airports[flight.departure].city}, ${airports[flight.departure].name}`,
        },
        {
          key: `${prefix}[departure_datetime]`,
          value: `${flight.departure_date} ${flight.departure_time}`,
        },
        {
          key: `${prefix}[arrival_country]`,
          value: airports[flight.arrival].country || '',
        },
        { key: `${prefix}[arrival_airport_code]`, value: flight.arrival },
        {
          key: `${prefix}[arrival_airport_name]`,
          value: `${airports[flight.arrival].city}, ${airports[flight.arrival].name}`,
        },
        {
          key: `${prefix}[arrival_datetime]`,
          value: `${flight.arrival_date} ${flight.arrival_time}`,
        },
        { key: `${prefix}[carrier_code]`, value: flight.operating_carrier },
        {
          key: `${prefix}[carrier_name]`,
          value: airlines[flight.operating_carrier]
            ? airlines[flight.operating_carrier].name || ''
            : '',
        },
        { key: `${prefix}[flight_duration]`, value: flight.duration },
      )
    })
  })

  submitFormWithParams(params, creditPartner.host)

  const uniqueClick = cookie.contains(UNIQ_COOKIE_KEY) ? false : true
  cookie.set(UNIQ_COOKIE_KEY, { uniqueClick, expires: 60 * 60 * 24, path: '/' })
}

const submitFormWithParams = (params: CreditFormParams, host: string) => {
  const form = document.createElement('form')
  params.forEach(({ key, value }) => {
    const inputElement = document.createElement('input')
    inputElement.type = 'text'
    inputElement.name = key
    inputElement.value = value.toString()
    form.appendChild(inputElement)
  })
  form.class = 'hidden'
  form.action = host
  form.method = 'post'
  form.target = '_blank'
  const child = document.body.appendChild(form)
  form.submit()
  document.body.removeChild(child)
}

export const isScheduleTicket = (ticket: TicketData): boolean =>
  isSapsanTicket(ticket) ||
  (ticket.carriers.length === 1 && ticket.carriers[0].toUpperCase() === 'ГЭ')

export const getScheduleTicketGroupKey = (ticket: TicketData): string | null => {
  const directFlight = getDirectFlight(ticket)
  if (directFlight && ticket.carriers.length === 1) {
    return [ticket.carriers[0], directFlight.departure, directFlight.arrival].join('-')
  }
  return null
}

const isSapsanTicket = (ticket: TicketData): boolean => isFullyTrain(ticket) && !!ticket.is_sapsan

const getDirectFlight = (ticket: TicketData): Flight | false =>
  ticket.segment.length === 1 &&
  ticket.segment[0].flight.length === 1 &&
  ticket.segment[0].flight[0]
