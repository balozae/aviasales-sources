import { AnyAction } from 'redux'
import { ThunkAction } from 'redux-thunk'
import i18next from 'i18next'
import after from 'common/utils/after'
import Cookie from 'common/bindings/cookie'
import cookieDomain from 'utils/cookie_domain.coffee'
import { generateRequestId, formatSegmentDateToString } from 'form/components/avia_form/utils'
import {
  SearchParams as FormParams,
  Segment,
  PlaceField,
  Place,
} from 'form/components/avia_form/avia_form.types'
import { AppState } from '../../types/root/explosion'
import { SearchParams, SearchStatus } from 'shared_components/ticket/ticket.types'
import { updateURLWithSearch } from '../update_url_with_search.actions'
import { isOpenJaw } from '../../selectors/search_params.selectors'
import { updatePageHeader } from '../page_header.actions'
import { updateAviaParams } from '../avia_params.actions'
import { updateMultiwayParams } from '../multiway_params.actions'
import { updateCurrentPage } from '../current_page.actions'
import { updateSearchStatus } from '../search_status.actions'
import { resetGatesMeta } from '../gates_meta.actions'
import { batchActions } from 'redux-batched-actions'
import { resetWoodyCreationStatus } from '../woody_subscriptions.actions'
import { removeTopPlacementShown } from '../is_top_placement_shown.actions'
import { resetFilters } from '../filters.actions'
import { resetSort } from '../sort.actions'
import { updateRequestId } from '../request_id.actions'
import { updateSearchParams } from '../search_params.actions'
import { resetAdvertisement } from '../advertisement.actions'
import { resetPrediction } from '../prediction.actions'
import { sendFacebookParams } from '../metrics.actions'
import { clearFixedFlights } from '../fixed_flights.actions'
import { removeErrorDuringSearch } from '../error_during_search.actions'
import { resetSelectedScheduleTicket } from '../selected_schedule_tickets.actions'
import { resetError } from '../error.actions'
import { removeHighlightedTicketParams } from '../highlighted_ticket_params.actions'
import { closeChinaNotify, setChinaNotifyNotShown } from '../china_notify.actions'

const viewport = require('browser-viewport')

export const startSPASearch = (
  params: FormParams,
  fullUrl: string,
): ThunkAction<any, AppState, any, AnyAction> => (dispatch, getState) => {
  const state = getState()

  const isMainPage = state.currentPage === 'main'

  if (window.IntentMedia && isMainPage) {
    window.IntentMedia.trigger('open_exit_unit')
  }

  window.isMainPage = false
  window.isSearchPage = true

  after(300, viewport.scrollTop.bind(null, 0, 300))

  dispatch(updateURLWithSearch(fullUrl, params))

  if (isOpenJaw(params)) {
    dispatch(updatePageHeader({ activeForm: 'multiway' }))
  } else {
    dispatch(updatePageHeader({ activeForm: 'avia' }))
    dispatch(updateAviaParams(params))
  }

  const requestId = generateRequestId()
  const explosionParams = {
    ...params,
    segments: _formatSegments(params.segments),
    trip_class: params.tripClass,
    locale: i18next.language,
    host: 'search.aviasales.ru',
    currency: state.currency,
    request_id: requestId,
    formParams: params,
  } as any

  const actions: Array<AnyAction> = [
    updateMultiwayParams(params),
    updateCurrentPage('search'),
    resetPrediction(),
    updateSearchStatus(SearchStatus.Started),
    resetGatesMeta(),
    updateSearchParams({ params: explosionParams, request_id: requestId }),
    updateRequestId(requestId),
    resetAdvertisement(),
    resetSort(),
    clearFixedFlights(),
    removeErrorDuringSearch(),
    resetFilters(),
    resetSelectedScheduleTicket(),
    removeTopPlacementShown(),
    resetError(),
    resetWoodyCreationStatus(),
  ]

  if (state.chinaNotify?.warningNotify?.isVisible) {
    actions.push(closeChinaNotify(), setChinaNotifyNotShown())
  }

  if (state.searchId) {
    actions.push(removeHighlightedTicketParams())
  }

  // NOTE: we can not push it to batched actions, cause it's listened by middleware
  dispatch(sendFacebookParams(explosionParams))

  dispatch(batchActions(actions))
}

const _formatSegments = (segments: ReadonlyArray<Segment>): SearchParams['segments'] =>
  segments.map(({ origin, destination, date }) => ({
    ..._formatPlace(PlaceField.Origin, origin!),
    ..._formatPlace(PlaceField.Destination, destination!),
    date: formatSegmentDateToString(date),
  }))

const PLACE_FIELD_MAP: { [key: string]: string } = {
  iata: 'iata',
  cityIata: 'city_iata',
  name: 'name',
  country: 'country',
  countryName: 'country_name',
  cases: 'cases',
}

const _formatPlace = (type: PlaceField, place: Place) => {
  return Object.keys(place).reduce((acc, field) => {
    const value = place[field]
    if (field === 'cityIata' && value === place.iata) {
      return acc
    }
    const key = PLACE_FIELD_MAP[field] || field
    if (field === 'iata') {
      // NOTE: should be like: {origin: MOW, origin_iata: MOW}
      return { ...acc, [`${type}_${key}`]: value, [type]: value }
    }
    return { ...acc, [`${type}_${key}`]: value }
  }, {})
}
