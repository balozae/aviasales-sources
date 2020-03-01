import axios, { AxiosPromise } from 'axios'

import {
  TicketSubscriptionsListFetcherSuccess,
  SaveTicketSubscriptionParams,
  SaveTicketSubscriptionSuccess,
  TicketSubscriptionData,
} from './subscriptions.types'
import { TicketTuple, TicketData } from 'shared_components/ticket/ticket_incoming_data.types'
import { SearchParams } from 'shared_components/ticket/ticket.types'

const host = (function() {
  const defaultHost = 'www.aviasales.ru'

  if (typeof window === 'undefined') {
    return defaultHost
  }

  return /localhost/.test(window.location.host) ? defaultHost : window.location.host
})()

export function mapTicketToTicketSubscription(
  [ticketData, proposals]: TicketTuple,
  searchParams: SearchParams,
  cheapestTicketPrice: number,
  marker: string,
  auid: string,
): SaveTicketSubscriptionParams {
  const subscriptionSegments = searchParams.segments.map((segment: any, i) => {
    const ticketSegment = ticketData.segment[i]
    const first = ticketSegment.flight[0]
    const last = ticketSegment.flight[ticketSegment.flight.length - 1]
    return {
      date: segment.date,
      destination_airport: last.arrival,
      origin_airport: first.departure,
      destination_city: segment.destination,
      origin_city: segment.origin,
    }
  })

  return {
    token: auid,
    marker: marker,
    ticket_subscription: {
      ...searchParams.passengers,
      trip_class: ticketData.trip_class || 'Y',
      segments: subscriptionSegments,
      ticket: {
        charter: ticketData.is_charter,
        validating_carrier: ticketData.validating_carrier,
        // /shrug
        segments: ticketData.segment.map((segment) => ({ flights: segment.flight })),
      },
      price: {
        value: proposals[0].unified_price,
        host,
      },
      direction_price: {
        value: cheapestTicketPrice,
        host,
      },
    },
  }
}

export function findTicketSubscriptionDataBySign(
  ticketSign: TicketData['sign'],
  ticketSubscriptions: TicketSubscriptionData[],
): TicketSubscriptionData | undefined {
  return ticketSubscriptions.find((sub) => sub.actual && ticketSign === sub.sign)
}

export function fetchSubscriptions(jwt: string): Promise<TicketSubscriptionsListFetcherSuccess> {
  const url = `/subscriptions/subscription_domain.json`
  const request = axios.create({
    headers: { Authorization: `Bearer ${jwt}` },
    params: { host },
  })

  return new Promise((resolve, reject) => {
    request
      .get<TicketSubscriptionsListFetcherSuccess>(url, {})
      .then((response) => {
        if (response.data) {
          resolve(response.data)
          return
        }
        reject(response)
      })
      .catch(reject)
  })
}

export function saveTicketSubscription(
  ticket: TicketTuple,
  searchParams: SearchParams,
  cheapestTicketPrice: number,
  marker: string,
  auid: string,
  jwt: string,
): AxiosPromise<SaveTicketSubscriptionSuccess> {
  const request = axios.create({
    headers: { Authorization: `Bearer ${jwt}` },
    params: { host },
  })

  return request.post<SaveTicketSubscriptionSuccess>(
    '/subscriptions/ticket_subscriptions.json',
    mapTicketToTicketSubscription(ticket, searchParams, cheapestTicketPrice, marker, auid),
  )
}

export function removeTicketSubscription(ticketId: string, auid: string, jwt: string) {
  const request = axios.create({
    headers: { Authorization: `Bearer ${jwt}` },
    params: { host },
  })

  const url = `/subscriptions/subscribers/${btoa(auid)}/ticket_subscriptions/${ticketId}.json`
  return request.delete(url)
}

export function actualizeSubscriber(
  currency: string,
  lang: string,
  marker: string,
  auid: string,
  jwt: string,
) {
  const url = `/subscriptions/subscribers/${btoa(auid)}/actualize.json`
  const request = axios.create({
    headers: { Authorization: `Bearer ${jwt}` },
    params: { host },
  })

  const options = {
    subscriber: {
      marker,
      currency_code: currency,
      locale: lang, // TODO: locale to IETF format
      host,
    },
  }

  return request.patch(url, options)
}

export default {}
