import {getTripClassNameFromCode} from 'common/utils/trip_class_helper'
import {TripClass} from 'common/types'

PIXEL_ID = '1766865490309293'

CHECK_INTERVAL = 700
queue = []
int = null
tripClassCodesMapForFbPixel = {
  [TripClass.Economy]: 'economy',
  [TripClass.PremiumEconomy]: 'premium',
  [TripClass.Business]: 'business',
  [TripClass.FirstClass]: 'first',
}

queueUp = (fn) ->
  # add to queue
  queue.push(fn)
  unless int
    # initiate waiting interval
    int = setInterval(->
      if window.fbq
        #  All done! Call and cleanup
        queue.forEach((q) -> q())
        queue = []
        clearInterval(int)
        int = null
    , CHECK_INTERVAL)

sendPixel = (event, params) ->
  if window.fbq
    window.fbq('trackSingle', PIXEL_ID, event, params)
  else
    queueUp(-> window.fbq('trackSingle', PIXEL_ID, event, params))

getPixelParamsFromSearch = (params) ->
  departure_segment = params.segments[0]
  segments_count = params.segments.length
  return_segment = if segments_count > 1 then params.segments[segments_count - 1]
  passengers = params.passengers

  {
    content_type: 'flight'
    origin_airport: departure_segment.origin
    destination_airport: departure_segment.destination
    departing_departure_date: departure_segment.date
    departing_arrival_date: departure_segment.date
    returning_departure_date: return_segment?.date
    returning_arrival_date: return_segment?.date
    num_adults: passengers.adults
    num_children: passengers.children
    num_infants: passengers.infants
    travel_class: getTripClassNameFromCode(params.tripClass, tripClassCodesMapForFbPixel)
  }

getPixelParamsFromTicketData = (ticketData) ->
  departure_segment = ticketData.segment[0].flight
  segments_count = ticketData.segment.length
  return_segment = if segments_count > 1 then ticketData.segment[segments_count - 1].flight

  {
    content_ids: [ticketData.sign]
    origin_airport: departure_segment[0].departure
    destination_airport: departure_segment[departure_segment.length - 1].arrival
    departing_departure_date: departure_segment[0].departure_date
    departing_arrival_date: departure_segment[departure_segment.length - 1].arrival_date
    returning_departure_date: return_segment?[0]?.departure_date
    returning_arrival_date: return_segment?[0]?.arrival_date
  }


export search = (explosionParams) ->
  sendPixel('Search', getPixelParamsFromSearch(explosionParams))

export viewContent = (ticketData, searchParams) ->
  sendPixel('ViewContent', Object.assign({},
    getPixelParamsFromSearch(searchParams),
    getPixelParamsFromTicketData(ticketData)
  ))

export initiateCheckout = (ticketData, params, searchParams) ->
  sendPixel('InitiateCheckout', Object.assign({},
    getPixelParamsFromSearch(searchParams),
    getPixelParamsFromTicketData(ticketData),
    {price: params.price, currency: params.currency}
  ))
