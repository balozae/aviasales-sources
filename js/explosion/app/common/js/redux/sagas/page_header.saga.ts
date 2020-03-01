import i18next from 'i18next'
import { setGeoipOrigin, getPossibleParams } from 'form/utils'
import { fork, takeEvery, select, call, put } from '@redux-saga/core/effects'
import {
  PAGE_HEADER_MOUNT_WITHOUT_ORIGIN,
  PageHeaderMountWithoutOrigin,
} from '../types/page_header.types'
import { getAviaFormParams } from '../selectors/form_params.selectors'
import { getPlace } from 'form/components/avia_form/utils'
import { PlaceField, DateType } from 'form/components/avia_form/avia_form.types'
import { fetchMonthPrices } from '../actions/calendar_prices.actions'
import { updateAviaParams } from '../actions/avia_params.actions'

function* setGeoIp() {
  yield takeEvery(PAGE_HEADER_MOUNT_WITHOUT_ORIGIN, function*({  }: PageHeaderMountWithoutOrigin) {
    const { segments } = yield select(getAviaFormParams)

    let newSegments = yield call(setGeoipOrigin, i18next.language, segments)
    if (
      newSegments &&
      newSegments.length &&
      newSegments[0].origin &&
      newSegments[0].destination &&
      newSegments[0].origin.iata === newSegments[0].destination.iata
    ) {
      newSegments = getPossibleParams(newSegments).segments
    }
    if (newSegments) {
      yield put(updateAviaParams({ segments: newSegments }))
      yield put({
        type: 'GEOIP_ORIGIN_SUBSTITUTION',
        data: { origin: getPlace(newSegments, PlaceField.Origin) },
      })

      const month =
        newSegments[0].origin && newSegments[0].origin.date
          ? newSegments[0].origin.date
          : new Date()

      // NOTE: we should refetch minprices after setting geoIp
      yield put(fetchMonthPrices(DateType.DepartDate, month))
    }
  })
}

export default function* pageHeaderSaga() {
  yield fork(setGeoIp)
}
