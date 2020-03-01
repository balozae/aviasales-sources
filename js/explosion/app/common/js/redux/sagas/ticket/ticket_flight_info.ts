import { takeEvery, put } from '@redux-saga/core/effects'
import { TICKET_FLIGHT_INFO_CLICKED, TicketFlightInfoClickedAction } from '../../types/ticket.types'
import { reachGoal } from '../../actions/metrics.actions'

export function* ticketFlightInfoClicked() {
  yield takeEvery(TICKET_FLIGHT_INFO_CLICKED, function*({
    isOpened,
  }: TicketFlightInfoClickedAction) {
    if (isOpened) {
      yield put(reachGoal('FLIGHT_INFO_SHOWN'))
    } else {
      yield put(reachGoal('FLIGHT_INFO_CLOSED'))
    }
  })
}
