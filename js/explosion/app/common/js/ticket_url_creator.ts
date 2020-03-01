import Rollbar from 'common/utils/rollbar'
import { format } from 'finity-js'
import { stringify } from 'query-string'
import markerable from 'common/bindings/markerable'
import axios, { AxiosResponse } from 'axios'
import { Gate, ShortURLResponse } from './ticket_deeplink_creator/ticket_deeplink_creator.types'
import { getMarketDefaultCurrency, DEFAULT_CURRENCY } from 'common/utils/currencies'
import { RawProposal } from 'shared_components/ticket/ticket_incoming_data.types'

const footprint = require('common/utils/ticket_footprint')

export const createUrl = ({
  gate,
  baseSearchUrl,
  ticket,
  proposal,
  unified_price,
  currencyRates,
  searchId = '',
  expected_price_source = 'share',
  utm_source = 'ticket_sharing',
  utm_medium,
  utm_campaign,
}: {
  gate?: Gate
  baseSearchUrl?: string
  ticket: any
  proposal?: RawProposal
  unified_price: number | null
  currencyRates: { [key: string]: number }
  searchId?: string
  expected_price_source?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
}) => {
  const { protocol, port, hostname, pathname } = window.location
  const currentCurrency = getMarketDefaultCurrency() || DEFAULT_CURRENCY
  const currentRate = currencyRates[currentCurrency] || 1
  const currentPrice = unified_price ? Math.round(unified_price / currentRate) : null

  const queryString = stringify({
    t: footprint.create(ticket) + (unified_price ? `_${unified_price}` : ''),
    search_date: format(new Date(), 'DDMMYYYY'),
    marker: markerable.marker(),
    fare_codes_key: proposal ? proposal.fare_codes_key : '',
    search_label: gate ? gate.search_label : '',
    expected_price: currentPrice,
    expected_price_uuid: searchId,
    expected_price_currency: currentCurrency,
    expected_price_source,
    utm_source,
    utm_medium,
    utm_campaign,
  })

  if (baseSearchUrl) {
    return `${protocol}//${hostname}${port ? ':' + port : ''}/search${baseSearchUrl}?${queryString}`
  }

  return `${protocol}//${hostname}${port ? ':' + port : ''}${pathname}?${queryString}`
}

export const createShortUrl = ({ url, title }: { url: string; title: string }) => {
  if (!url) {
    return
  }

  const link = encodeURIComponent(url)
  return axios
    .get(`/shorten?url=${link}&title=${encodeURIComponent(title) || link}`)
    .then((response: AxiosResponse<ShortURLResponse>) => response.data.shorturl)
    .catch((error) => Rollbar.error('Error with link shortening', error))
}
