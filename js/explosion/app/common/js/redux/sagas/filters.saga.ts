import { takeEvery, fork } from 'redux-saga/effects'
import Cookie from 'oatmeal-cookie'
import { UPDATE_FILTERS, UpdateFiltersAction } from '../types/filters.types'
import { CHINA_FILTER_COOKIE_KEY } from 'components/filters/types/china_filter.types'

function* setFiltersStateInCookie() {
  yield takeEvery(UPDATE_FILTERS, function*(action: UpdateFiltersAction) {
    const chinaFilterState: true | undefined = action.filters.filters.china.china

    if (chinaFilterState) {
      Cookie.set(CHINA_FILTER_COOKIE_KEY, chinaFilterState, {
        expires: 60 * 60 * 24 * 7 /* 7 days */,
        path: '/',
      })
    } else {
      Cookie.expire(CHINA_FILTER_COOKIE_KEY, {
        path: '/',
      })
    }

    const newCachedVisaFilter = Object.keys(action.filters.filters.visa)
    Cookie.set('cache_visa_filter', JSON.stringify(newCachedVisaFilter), {
      expires: 60 * 60 * 24 /* 24 hours */,
      path: '/',
    })
  })
}

export function* filtersSaga() {
  yield fork(setFiltersStateInCookie)
}
