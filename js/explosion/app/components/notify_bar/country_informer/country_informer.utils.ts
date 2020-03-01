import guestia from 'guestia/client'
import GoalKeeper from 'common/bindings/goalkeeper'
import localStorageHelper from 'common/bindings/local_storage_helper'
import { CountryInformerState, CountryInformerInfo } from './country_informer.types'

const SOURCES = ['ru', 'kz', 'ua']

export const getCountryInformerInfo = (host: string): CountryInformerInfo => {
  executeForeignCode(host)

  // match get param from url like `http://www.aviasales.ru/?from=kz`
  // or from cookie
  const urlSource = getMatch(location.search, /(\?|&)from=(\w{2})/)
  const cookieSource = getMatch(document.cookie, /(\s|;)from=(\w{2})/)
  const currentInformerState = getCountryInformerState()[host]
  const localStorageSource =
    currentInformerState &&
    Object.keys(currentInformerState).find((key) => currentInformerState[key] === true)

  const source = urlSource || cookieSource
  if (source) {
    const isProperSource = SOURCES.indexOf(source) !== -1
    // default true, if we didn't find value for this source in local storage
    let showSource = true
    if (currentInformerState && currentInformerState[source] !== undefined) {
      showSource = currentInformerState[source]
    }

    return {
      toShow: isProperSource && showSource,
      source: source,
    }
  }

  if (localStorageSource) {
    return {
      toShow: true,
      source: localStorageSource,
    }
  }

  return {
    toShow: false,
    source: '',
  }
}

export const getCountryInformerPath = (host: string): string => {
  let path = location.protocol + '//' + host + location.pathname
  const meta = document.querySelector(`link[rel=alternate][href*="${host}"]`)
  if (meta) {
    path = meta.getAttribute('href') as string
  }
  return path
}

const getCountryInformerState = (): CountryInformerState => {
  const value = localStorageHelper.getItem('country_informer')
  return value == null ? {} : JSON.parse(value)
}

export const setCountryInformerState = (state: CountryInformerState) => {
  const prevValue = getCountryInformerState()
  const newValue = {
    ...prevValue,
    ...state,
  }
  localStorageHelper.setItem('country_informer', JSON.stringify(newValue))
}

const executeForeignCode = (host: string) => {
  const isBack = getMatch(location.search, /(\?|&)back=(\w{4})/)
  if (isBack) {
    guestia.setSettings('prevent_geoip', true)
    GoalKeeper.triggerEvent('country_informer', 'back', 'detect', { host })
  }
}

const getMatch = (source: String, regex: RegExp) => {
  const match = source.match(regex)
  if (Array.isArray(match) && match.length >= 3) {
    return match[2]
  }
  return false
}
