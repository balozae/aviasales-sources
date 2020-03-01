import { takeEvery, put } from '@redux-saga/core/effects'
import { TICKET_REFRESH_CLICK } from '../../types/ticket.types'
import { restartSearch } from '../../actions/start_search/start_search.actions'

export function* ticketRefreshClick() {
  yield takeEvery(TICKET_REFRESH_CLICK, function*() {
    // @ts-ignore
    yield put(restartSearch())
  })
}
