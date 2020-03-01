import { takeEvery, put } from '@redux-saga/core/effects'
import { TICKET_SHARE_TOOLTIP_SHOWN } from '../../types/ticket.types'
import { reachGoal } from '../../actions/metrics.actions'

export function* ticketHotelStopClick() {
  yield takeEvery(TICKET_SHARE_TOOLTIP_SHOWN, function*() {
    yield put(reachGoal('HOTEL_LINK_CLICK'))
  })
}
