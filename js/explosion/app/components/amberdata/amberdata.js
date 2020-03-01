import cookies from 'oatmeal-cookie'
import getShortUrl from 'short_url'
import { format } from 'finity-js'
import { dateWithoutTimezone } from 'utils_date'
import store from 'common/js/redux/store'

if (!window.adcm_config) {
  window.adcm_config = {
    id: 127,
    platformId: 127,
    profileId: cookies.get('auid'),
    tags: [],
  }
}

const getAmberdataParams = (searchParams) => {
  const departDate = dateWithoutTimezone(searchParams.segments[0].date)
  let returnDate = null
  if (searchParams.segments.length > 1) {
    returnDate = dateWithoutTimezone(searchParams.segments[1].date)
  }

  return {
    ddate: format(departDate, 'YYYYMMDD'),
    rdata: returnDate ? format(returnDate, 'YYYYMMDD') : null,
    dest_ctry: searchParams.segments[0].destination_country,
    dest_city: searchParams.segments[0].destination,
    orgn_ctry: searchParams.segments[0].origin_country,
    orgn_city: searchParams.segments[0].origin,
    inf: searchParams.passengers ? searchParams.passengers.infants : 0,
    trp_cls: searchParams.tripClass,
  }
}

const includeScript = () => {
  if (document.getElementById('amberdata-loader')) {
    return
  }

  const script = document.createElement('script')
  script.id = 'amberdata-loader'
  script.async = true
  script.src = 'https://tag.digitaltarget.ru/adcm.js'
  document.body.appendChild(script)
}

const isEnoughData = (searchParams) => {
  if (
    !(
      searchParams &&
      searchParams.passengers &&
      searchParams.passengers.adults &&
      searchParams.segments &&
      searchParams.segments.length &&
      searchParams.segments[0].destination_country &&
      searchParams.segments[0].origin_country
    )
  ) {
    return false
  }
  return true
}

const pushTags = (tags) => {
  window.adcm.call({ tags })
}

const tryAmberdata = function tryAmberdata(fn, ...args) {
  try {
    fn(...args)
  } catch (error) {
    //
  }
}

class Amberdata {
  constructor() {
    this.oldRequestId = ''
    this.oldShortUrl = ''

    tryAmberdata(includeScript)

    store.subscribe(() => {
      const { requestId, searchParams } = store.getState()
      this.handleSearchParams(requestId, searchParams)
    })
  }

  handleSearchParams(requestId, searchParams) {
    if (
      isEnoughData(searchParams) &&
      this.oldShortUrl !== getShortUrl(searchParams) &&
      this.oldRequestId !== requestId
    ) {
      // NOTE: нужно сохранять параметры одновременно,
      // чтобы исключить эйч кейсы когда они сохраняются
      // раздельно и амбердата не стартует при первом поиске
      this.oldShortUrl = getShortUrl(searchParams)
      this.oldRequestId = requestId

      const tags = []
      Object.entries(getAmberdataParams(searchParams)).forEach(([key, value]) => {
        if (!value && value !== 0) {
          return
        }
        tags.push(`${key}__${value}`)
      })

      if (window.adcm && window.adcm.call) {
        tryAmberdata(pushTags, tags)
      } else {
        window.adcm_config.init = () => tryAmberdata(pushTags, tags)
      }
    }
  }
}

export default () => {
  // eslint-disable-next-line no-new
  new Amberdata()
}
