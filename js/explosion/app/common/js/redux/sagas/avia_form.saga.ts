import { fork, takeEvery, put, select, takeLatest, delay } from '@redux-saga/core/effects'
import { PRICE_SWITCHER_CHECK, PriceSwitcherCheck } from '../types/calendar_prices.types'
import {
  updateOneWayPrices,
  fetchYearPrices,
  fetchMonthPrices,
  resetMonthCalendarPrices,
} from '../actions/calendar_prices.actions'
import {
  convertDateFieldName,
  updateSegmentDate,
  updateSegmentPlace,
  isOpenSearchPlace,
  isEmptyPlace,
  isOpenSearchDate,
  getDate,
  getPlace,
} from 'form/components/avia_form/utils'
import {
  SET_HISTORY_ITEM,
  SetHistoryItem,
  AVIA_PLACE_CHANGE,
  AviaPlaceChange,
  SWAP_AVIA_PLACES,
  SwapAviaPlaces,
  AVIA_FORM_MONTHS_MOUNT,
  ACTIVE_DATE_INPUT_CHANGE,
  ActiveDateInputChange,
  CHANGE_DATE_INPUT_MONTH,
  DateInputMonthChange,
  AVIA_DATE_CHANGE,
  AviaDateChange,
} from '../types/avia_params.types'
import { getAviaFormParams } from '../selectors/form_params.selectors'
import { Place, PlaceType, DateType, PlaceField } from 'form/components/avia_form/avia_form.types'
import update from 'immutability-helper'
import { updateAviaParams } from '../actions/avia_params.actions'
import { reachGoal } from '../actions/metrics.actions'
import { HistoryItem } from 'form/components/autocomplete/search_history'
import { setHistoryItem, setActiveDateInput } from '../actions/avia_form.actions'
import { DEFAULT_PLACE } from 'form/components/avia_form/avia_form.constants'
import { getCalendarPrices } from '../selectors/calendar_prices.selectors'
import { isMobile } from 'shared_components/resizer'
import { historyAPI } from 'form/history_api'
import { UPDATE_BROWSER_HISTORY } from '../types/browser_history.types'
import { getAviaParamsActiveDateInput } from '../selectors/avia_params.selector'
import { BrowserHistoryActions } from '../types/browser_history.types'

function* priceSwitcherCheckSaga() {
  yield takeEvery(PRICE_SWITCHER_CHECK, function*({
    checked,
    activeInput,
    tab,
    month,
  }: PriceSwitcherCheck) {
    yield put(updateOneWayPrices(checked))
    const type = convertDateFieldName(activeInput)
    if (tab === 'months') {
      yield put(fetchYearPrices())
    }
    if (tab === 'calendar' && month) {
      yield put(fetchMonthPrices(type!, month))
    }
  })
}

function* setHistoryItemSaga() {
  yield takeEvery(SET_HISTORY_ITEM, function*({ item, placeType }: SetHistoryItem) {
    const formParams = yield select(getAviaFormParams)

    const origin: Place = {
      iata: item.originCityIata,
      name: item.originName || '',
      type: PlaceType.City,
    }
    const destination: Place = {
      iata: item.destinationCityIata,
      name: item.destinationName || '',
      type: PlaceType.City,
    }

    let segments = updateSegmentDate(DateType.DepartDate, item.departureDate, formParams.segments)

    segments = updateSegmentDate(DateType.ReturnDate, item.returnDate, segments)
    segments = updateSegmentPlace(PlaceField.Origin, origin, segments)
    segments = updateSegmentPlace(PlaceField.Destination, destination, segments)

    yield put(reachGoal(`avia_form--autocomplete-history-item-${placeType}--click`))
    yield put(
      updateAviaParams({ segments, passengers: item.passengers, tripClass: item.tripClass }),
    )
  })
}

function* changeAviaPlaceSaga() {
  yield takeLatest(AVIA_PLACE_CHANGE, function*({ place, placeType }: AviaPlaceChange) {
    yield put(resetMonthCalendarPrices())
    if (place && place.type === 'history') {
      yield put(setHistoryItem(placeType, place as HistoryItem))
      return
    }

    const formParams = yield select(getAviaFormParams)

    let segments = updateSegmentPlace(placeType, place as Place, formParams.segments)
    if (
      placeType === PlaceField.Destination &&
      (!isOpenSearchPlace(place as Place) && !isEmptyPlace(place as Place))
    ) {
      if (isOpenSearchDate(getDate(segments, DateType.DepartDate))) {
        segments = updateSegmentDate(DateType.ReturnDate, undefined, segments)
        segments = updateSegmentDate(DateType.DepartDate, undefined, segments)
      }
      if (isOpenSearchDate(getDate(segments, DateType.ReturnDate))) {
        segments = updateSegmentDate(DateType.ReturnDate, undefined, segments)
      }
    }
    yield put(updateAviaParams({ segments }))
  })
}

function* swapAviaPlacesSaga() {
  yield takeEvery(SWAP_AVIA_PLACES, function*(action: SwapAviaPlaces) {
    const formParams = yield select(getAviaFormParams)

    let destination = getPlace(formParams.segments, PlaceField.Destination)
    destination = isOpenSearchPlace(destination) ? DEFAULT_PLACE : destination

    let segments = updateSegmentPlace(PlaceField.Origin, destination, formParams.segments)
    segments = updateSegmentPlace(
      PlaceField.Destination,
      getPlace(formParams.segments, PlaceField.Origin),
      segments,
    )
    if (isOpenSearchDate(getDate(segments, DateType.DepartDate))) {
      segments = updateSegmentDate(DateType.ReturnDate, undefined, segments)
      segments = updateSegmentDate(DateType.DepartDate, undefined, segments)
    }
    if (isOpenSearchDate(getDate(segments, DateType.ReturnDate))) {
      segments = updateSegmentDate(DateType.ReturnDate, undefined, segments)
    }

    yield put(resetMonthCalendarPrices())
    yield put(updateAviaParams({ segments }))
    yield put(reachGoal(`avia_form--swapPlaces--click`))
  })
}

function* monthsMountSaga() {
  yield takeEvery(AVIA_FORM_MONTHS_MOUNT, function*() {
    yield put(fetchYearPrices())
  })
}

function* fetchMonthPricesOnDateInputChange() {
  yield takeEvery(ACTIVE_DATE_INPUT_CHANGE, function*({
    activeInput,
    month,
  }: ActiveDateInputChange) {
    if (activeInput && month) {
      const type = convertDateFieldName(activeInput)
      yield put(fetchMonthPrices(type!, month))
    }
  })
}

function* tripDurationModal() {
  yield takeLatest(ACTIVE_DATE_INPUT_CHANGE, function*({ activeInput }: ActiveDateInputChange) {
    const wasOpened = yield select(getAviaParamsActiveDateInput)
    if (isMobile()) {
      if (activeInput && !wasOpened) {
        historyAPI.push({ state: { type: 'datepickerModal', activeInput } })
      } else if (!activeInput && wasOpened) {
        historyAPI.goBack()
      } else {
        yield put(setActiveDateInput(activeInput))
      }
    } else {
      yield put(setActiveDateInput(activeInput))
    }
  })

  yield takeEvery(UPDATE_BROWSER_HISTORY, function*(action: BrowserHistoryActions) {
    if (action.data && action.data.data && action.data.data.type === 'datepickerModal') {
      yield put(setActiveDateInput(action.data.data.activeInput))
    } else {
      yield put(setActiveDateInput())
    }
  })
}

function* dateInputMonthChange() {
  yield takeLatest(CHANGE_DATE_INPUT_MONTH, function*({
    month,
    direction,
    activeInput,
  }: DateInputMonthChange) {
    yield delay(400)
    if (direction) {
      yield put(reachGoal('avia_form--departDateMonthChange--click', { month, type: direction }))
    } else {
      yield put(reachGoal('avia_form--departDateMonthChange--select', { month }))
    }
    const type = convertDateFieldName(activeInput)
    yield put(fetchMonthPrices(type!, month))
  })
}

function* dateChange() {
  yield takeEvery(AVIA_DATE_CHANGE, function*({ dateType, date }: AviaDateChange) {
    const formParams = yield select(getAviaFormParams)
    const calendarPrices = yield select(getCalendarPrices)

    let segments = updateSegmentDate(dateType, date, formParams.segments)
    yield put(updateAviaParams({ segments }))

    if (
      dateType === DateType.DepartDate &&
      Object.keys(calendarPrices.months.returnDate.withDepart).length
    ) {
      yield put(resetMonthCalendarPrices(DateType.ReturnDate))
    }
  })
}

export default function* aviaFormSaga() {
  yield fork(priceSwitcherCheckSaga)
  yield fork(setHistoryItemSaga)
  yield fork(changeAviaPlaceSaga)
  yield fork(swapAviaPlacesSaga)
  yield fork(monthsMountSaga)
  yield fork(tripDurationModal)
  yield fork(fetchMonthPricesOnDateInputChange)
  yield fork(dateInputMonthChange)
  yield fork(dateChange)
}
