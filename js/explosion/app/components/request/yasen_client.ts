import FetchWrapper, { extendCookieParams } from 'common/utils/fetch'
import { AbortError, TimeoutError } from 'common/utils/errors'
import Guestia from 'guestia/client'
const { getPassengersAmount } = require('common/js/trip_helper')
import { UNSAFE_reachGoal } from 'common/js/redux/actions/DEPRECATED_metrics.actions'
// tslint:disable:typedef

// const MOCK_ERROR_URL = {
//   400: 'http://www.mocky.io/v2/58381a6511000089058fd2ba',
//   403: 'http://www.mocky.io/v2/5838186f11000015058fd2b0',
//   500: 'http://www.mocky.io/v2/58381b0c1100008f058fd2bb?mocky-delay=60000ms',
//   empty_tickets: 'http://www.mocky.io/v2/58381f7311000006068fd2c2',
//   wrong_dates: 'http://www.mocky.io/v2/5afbe48c31000078007c5b76',
// }

const ENTIRE_SEARCH_TIMEOUT = 300000 // 5 min
const RETRY_DELAY = 2000
const TRIES_LIMIT = 3
const START_SEARCH_ENDPOINT = '/search-api/adaptors/chains/rt_search_native_format'
const GET_RESULTS_ENDPOINT = '/search-api/searches_results_united'

export default class YasenClient {
  searchId: any
  callbacks: {
    [name: string]: Function
  }
  headers: {
    'Content-Type'?: string
    Authorization?: string
  }
  requestParams: any
  requestTimeout: number | null
  triesCount: number
  aborted: boolean
  fetch: any

  static searchStopMarker(searchResults) {
    return searchResults.some((item, index) => {
      const isSearchMarker = Object.keys(item).length === 1 && item.search_id

      if (isSearchMarker && index !== searchResults.length - 1) {
        UNSAFE_reachGoal('SEARCH_MARKER_ISNT_LAST', { search_id: item.search_id })
      }

      return isSearchMarker
    })
  }

  constructor(requestParams, rawCallbacks = {}) {
    const callbacks = {
      // tslint:disable-next-line:no-empty
      on_update() {},
      // tslint:disable-next-line:no-empty
      on_finish() {},
      // tslint:disable-next-line:no-empty
      on_error() {},
      // tslint:disable-next-line:no-empty
      on_abort() {},
      ...rawCallbacks,
    }

    // NOTE: to prevent error from outside we add setTimeout
    this.callbacks = {}
    Object.entries(callbacks).forEach(([key]) => {
      this.callbacks[key] = (...rest) => {
        setTimeout(() => {
          callbacks[key](...rest)
        }, 0)
      }
    })

    this.headers = {
      'Content-Type': 'application/json',
    }

    const jwt = Guestia.getJWT()
    if (jwt) {
      this.headers.Authorization = `Bearer ${jwt}`
    }

    this.requestParams = extendCookieParams(requestParams, ['_ga', 'marker', 'auid'])
    this.requestTimeout = null
    this.triesCount = 0
    this.aborted = false
    this.fetch = new FetchWrapper()

    this.startSearch()
  }

  async startSearch() {
    try {
      const metaData = await this.startSearchOnYasen()
      this.callbacks.on_update([metaData])
      this.searchId = metaData.meta.uuid
    } catch (err) {
      if (err instanceof AbortError) {
        this.callbacks.on_abort()
      } else {
        this.error(err)
      }
      return
    }

    UNSAFE_reachGoal('SEARCH_REALLY_STARTED', {
      search_id: this.searchId,
      passengers_amount: getPassengersAmount(this.requestParams),
      trip_class: this.requestParams.trip_class,
    })
    const searchStartTime = Date.now()

    let stopMarker
    while (!stopMarker && !this.aborted) {
      try {
        const searchResults = await this.collectSeachResults() // eslint-disable-line

        if (Array.isArray(searchResults) && searchResults.length) {
          stopMarker = YasenClient.searchStopMarker(searchResults)
          this.callbacks.on_update(searchResults, stopMarker)
        }

        if (!stopMarker) {
          if (Date.now() - searchStartTime > ENTIRE_SEARCH_TIMEOUT) {
            this.error(
              new TimeoutError(
                `entire search was timed out with timeout ${ENTIRE_SEARCH_TIMEOUT}ms`,
              ),
            )
            break
          }
          await this.delay() // eslint-disable-line
        } else {
          this.callbacks.on_finish()
        }

        this.triesCount = 0
      } catch (err) {
        if (this.triesCount >= TRIES_LIMIT) {
          if (err instanceof AbortError) {
            this.callbacks.on_abort()
          } else {
            this.error(err)
          }
          break
        } else {
          await this.delay() // eslint-disable-line
          this.triesCount += 1
        }
      }
    }
  }

  delay() {
    return new Promise((resolve) => {
      this.requestTimeout = window.setTimeout(resolve, RETRY_DELAY)
    })
  }

  async startSearchOnYasen() {
    const endpoint = `${YASEN_HOSTNAME}${START_SEARCH_ENDPOINT}`
    const response = await this.fetch.post(endpoint, {
      data: this.requestParams,
      headers: this.headers,
      withCredentials: true,
    })
    const results = response.data

    if (!(results && results.meta && results.meta.uuid)) {
      throw new Error('rt_search_native_format returned empty uuid')
    }

    return results
  }

  async collectSeachResults() {
    const endpoint = `${YASEN_HOSTNAME}${GET_RESULTS_ENDPOINT}?uuid=${
      this.searchId
    }&${Math.random()}`
    const response = await this.fetch.get(endpoint)

    // FIXME: temproray test chunk patch
    // const result = response.data.map((chunk) => ({
    //   ...chunk,
    //   uuid: Math.random()
    //     .toString(36)
    //     .substring(7),
    // }))

    // return result
    return response.data
  }

  error(err) {
    this.callbacks.on_error({ err, searchId: this.searchId, requestParams: this.requestParams })
  }

  abort() {
    this.aborted = true
    window.clearTimeout(this.requestTimeout!)
    this.fetch.abort()
  }
}
