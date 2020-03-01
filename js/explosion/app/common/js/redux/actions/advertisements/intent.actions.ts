import i18next from 'i18next'
import { AnyAction } from 'redux'
import { ThunkAction } from 'redux-thunk'
import { SearchParams as FormParams, PlaceField } from 'form/components/avia_form/avia_form.types'
import { AppState } from '../../types/root/explosion'
import { isOpenJaw } from '../../selectors/search_params.selectors'
import { getPlace } from 'form/components/avia_form/utils'
import { SYSState } from 'common/js/sys_controller'
import {
  IntentMediaThemes,
  getIntentPageId,
  getSiteCountry,
  getSiteName,
  getIntentTripClass,
} from './intent.utils'
import { format } from 'finity-js'
import rollbar from 'common/utils/rollbar'

declare global {
  interface Window {
    IntentMediaDesign: any
    IntentMediaProperties: any
    IntentMedia: any
  }
}

export const loadIntentScript = (): ThunkAction<any, AppState, any, AnyAction> => async (
  dispatch,
  getState,
) => {
  const state = getState()
  const activeTab = state.pageHeader.activeForm

  if (!(activeTab === 'avia' && !isOpenJaw(state.aviaParams))) {
    return
  }
  try {
    await dispatch(setIntentTargeting())

    let script: HTMLScriptElement | null = document.querySelector('#intent-ad')
    if (!script) {
      script = document.createElement('script')
      script.async = true
      script.id = 'intent-ad'
      script.src = '//a.cdn.intentmedia.net/javascripts/v1/intent_media_core.js'
      return document.body.appendChild(script)
    }
  } catch (error) {
    rollbar.warn('Intent media error', error)
  }
}

const setIntentTargeting = (): ThunkAction<any, AppState, any, AnyAction> => (
  dispatch,
  getState,
) => {
  const state = getState()
  const currentPage = state.currentPage
  const pageId = getIntentPageId(currentPage)
  const searchParams = JSON.parse(JSON.stringify(state.aviaParams)) as FormParams

  const siteCountry = getSiteCountry()
  let intentMediaProperties = {
    site_name: getSiteName(),
    page_id: pageId,
    site_country: siteCountry.toUpperCase(),
    site_language: i18next.language.toUpperCase(),
    site_currency: state.currency.toLowerCase(),
  }

  if (pageId !== 'flight.home' && searchParams && searchParams.segments.length > 0) {
    Object.assign(intentMediaProperties, {
      flight_origin: getPlace(searchParams.segments, PlaceField.Origin).iata,
      flight_destination: getPlace(searchParams.segments, PlaceField.Destination).iata,
    })
    if (pageId !== 'flight.frontdoor' && searchParams.segments[0].date) {
      const departDate = searchParams.segments[0].date as Date
      const returnDate =
        searchParams.segments[1] != null ? (searchParams.segments[1].date as Date) : undefined
      const isOneWay = searchParams.segments.length === 1
      const passengersCount = Object.values(searchParams.passengers).reduce(
        (a: number, b: number) => a + b,
      )
      Object.assign(intentMediaProperties, {
        travel_date_start: format(departDate, 'YYYYMMDD'),
        travel_date_end: returnDate && format(returnDate, 'YYYYMMDD'),
        flight_class_of_service: getIntentTripClass(searchParams.tripClass),
        trip_type: isOneWay ? 'oneway' : 'roundtrip',
        travelers: passengersCount,
        adults: searchParams.passengers.adults,
        children: searchParams.passengers.children,
      })
    }
  }
  window.IntentMediaProperties = intentMediaProperties
}

export const updateIntentTheme = (): ThunkAction<any, AppState, any, AnyAction> => (
  dispatch,
  getState,
) => {
  const state = getState()
  const { sysState } = state

  const nightModeOn: boolean =
    sysState === SYSState.AutoEnabled ||
    sysState === SYSState.UserEnabled ||
    sysState === SYSState.Onboarding

  window.IntentMediaDesign = nightModeOn ? IntentMediaThemes[1] : IntentMediaThemes[0]
}

export const setIntentTargetingAndRefresh = (): ThunkAction<
  any,
  AppState,
  any,
  AnyAction
> => async (dispatch) => {
  await dispatch(setIntentTargeting())
  dispatch(refreshIntent)
}

export const refreshIntent = (): ThunkAction<any, AppState, any, AnyAction> => () => {
  if (window.IntentMedia) {
    try {
      window.IntentMedia.trigger('refresh')
    } catch (error) {
      //
    }
  }
}
