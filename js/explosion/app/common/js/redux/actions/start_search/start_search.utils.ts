import { Segment, SearchParams } from 'form/components/avia_form/avia_form.types'
import { isEmptyPlace } from 'form/components/avia_form/utils'
import cookieDomain from 'utils/cookie_domain.coffee'
import Cookie from 'common/bindings/cookie'
import rollbar from 'common/utils/rollbar'

const MAX_COOKIE_EXPIRE_MONTHS = 3

export const isValidSegment = (segment: Segment, ensureNames: boolean = false): boolean => {
  if (!segment) {
    return false
  }
  const { date, origin, destination } = segment
  if (!(date && origin && destination)) {
    return false
  }
  if (isEmptyPlace(origin) || isEmptyPlace(destination)) {
    return false
  }
  if (ensureNames) {
    if (!(origin.name && destination.name)) {
      return false
    }
  }
  return true
}

export const isValidParams = (params: SearchParams, ensureNames: boolean = false): boolean => {
  if (!(params.segments && Array.isArray(params.segments))) {
    return false
  }
  return params.segments.every((segment) => isValidSegment(segment, ensureNames))
}

export const setSearchCookies = (url: string, params: SearchParams) => {
  try {
    const date = params.segments[0].date as Date
    const endOfDepartDate = new Date(new Date(date).setHours(23, 59))
    const maxCookieExpireDate = new Date(
      new Date().setMonth(new Date().getMonth() + MAX_COOKIE_EXPIRE_MONTHS),
    )
    Cookie.set('search_init_stamp', Date.now(), {
      domain: cookieDomain,
      path: '/',
      expires: 600,
    })
    Cookie.set('last_search', url.replace('/', ''), {
      domain: cookieDomain,
      path: '/',
      expires: endOfDepartDate > maxCookieExpireDate ? maxCookieExpireDate : endOfDepartDate,
    })
  } catch (error) {
    rollbar.warn("Can't set last_search cookie")
  }
}

export const openInNewTab = (url: string, ifFullLink: boolean = false): void => {
  // NOTE: we have to open window without window.opener cuz it loads 2x memory for tab
  // HACK: window.open with noopener param opens page in new window when new tab expected
  const link = document.createElement('a')
  link.target = '_blank'
  const href = ifFullLink ? url : `${getOriginUrl()}${url}`
  link.href = href
  link.id = 'openinnewtablink'
  link.rel = 'noopener noreferrer'
  document.body.appendChild(link)
  link.click()
}

export const getOriginUrl = (): string => {
  if (window.location.origin) {
    return window.location.origin
  } else {
    const port = window.location.port ? `:${window.location.port}` : ''
    return `${window.location.protocol}//${window.location.hostname}${port}`
  }
}
