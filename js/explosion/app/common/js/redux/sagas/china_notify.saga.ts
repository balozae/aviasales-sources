import { takeEvery, fork, put, takeLeading, select } from 'redux-saga/effects'
import Cookie from 'oatmeal-cookie'
import { UPDATE_SEARCH_DATA } from '../types/search_params.types'
import { UpdateTicketsAction } from '../types/tickets.types'
import {
  openChinaNotify,
  notShowChinaNotifyForWeek,
  openChinaInfoNotify,
  closeChinaNotify,
  setChinaNotifyShown,
} from '../actions/china_notify.actions'
import {
  NOT_SHOW_CHINA_NOTIFY_FOR_WEEK,
  CHINA_NOTIFY_BUTTON_CLICK,
} from '../types/china_notify.types'
import { updateFilter, expandFilter } from '../actions/filters.actions'
import { getIsChinaNotifyShown } from '../selectors/china_filter.selectors'
import { reachGoal } from 'common/js/redux/actions/metrics.actions'
import {
  CHINA_FILTER_COOKIE_KEY,
  CHINA_COUNTRY_CODE,
  NOT_SHOW_CHINA_NOTIFY_FOR_WEEK_COOKIE_KEY,
} from 'components/filters/types/china_filter.types'

function* openChinaNotifyOnTicketsUpdates() {
  yield takeEvery(UPDATE_SEARCH_DATA, function*({ tickets }: UpdateTicketsAction) {
    if (!tickets || tickets.length === 0) {
      return
    }
    const isChinaNotifyShown = yield select(getIsChinaNotifyShown)

    if (isChinaNotifyShown) {
      return
    }

    const isChinaTicketInTickets = () => {
      for (const [ticketData] of tickets) {
        for (const segment of ticketData.segment) {
          if (segment.transfers) {
            for (const transfer of segment.transfers) {
              if (transfer.country_code === CHINA_COUNTRY_CODE) {
                return true
              }
            }
          }
        }
      }
      return false
    }

    const isShowChinaNotify = () => {
      const isNotShowChinaNotifyForWeek = Cookie.get(NOT_SHOW_CHINA_NOTIFY_FOR_WEEK_COOKIE_KEY)
      const chinaFilterCache = Cookie.get(CHINA_FILTER_COOKIE_KEY)

      if (
        isNotShowChinaNotifyForWeek !== 'true' &&
        chinaFilterCache !== 'true' &&
        isChinaTicketInTickets()
      ) {
        return true
      }
      return false
    }

    if (isShowChinaNotify()) {
      yield put(openChinaNotify())
      yield put(setChinaNotifyShown())
    }
  })
}

function* setNotShowChinaNotifyForWeek() {
  yield takeLeading(NOT_SHOW_CHINA_NOTIFY_FOR_WEEK, function*() {
    Cookie.set(NOT_SHOW_CHINA_NOTIFY_FOR_WEEK_COOKIE_KEY, true, {
      expires: 60 * 60 * 24 * 7 /* 7 days */,
      path: '/',
    })
  })
}

function* handleChinaNotifyButtonClick() {
  yield takeLeading(CHINA_NOTIFY_BUTTON_CLICK, function*() {
    Cookie.set(CHINA_FILTER_COOKIE_KEY, true, {
      expires: 60 * 60 * 24 * 7 /* 7 days */,
      path: '/',
    })
    yield put(
      updateFilter({
        filterName: 'china',
        filterValue: {
          china: true,
        },
      }),
    )
    yield put(closeChinaNotify())
    yield put(expandFilter('china'))
    yield put(reachGoal('UNCHECK_CHINA_FILTER', { sender: 'notify_china' }))
    yield put(notShowChinaNotifyForWeek())
    yield put(openChinaInfoNotify())
  })
}

export function* chinaNotifySaga() {
  yield fork(openChinaNotifyOnTicketsUpdates)
  yield fork(setNotShowChinaNotifyForWeek)
  yield fork(handleChinaNotifyButtonClick)
}
