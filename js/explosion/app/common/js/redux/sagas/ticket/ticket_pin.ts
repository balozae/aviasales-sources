import { takeEvery, put } from '@redux-saga/core/effects'
import { TICKET_PIN_CLICK, TicketPinClickAction } from '../../types/ticket.types'
import { getFlightSignature } from 'shared_components/ticket/utils/common.utils'
import { reachGoal } from '../../actions/metrics.actions'
import { toggleFixedFlights } from '../../actions/fixed_flights.actions'

export function* ticketPinClick() {
  yield takeEvery(TICKET_PIN_CLICK, function*({
    trips,
    isActive,
    target,
    segmentIndex,
  }: TicketPinClickAction) {
    const tripsSigns = trips.map((trip) => getFlightSignature(trip))
    yield put(toggleFixedFlights(tripsSigns, isActive))

    if (target === 'segment') {
      const metricsName = isActive ? 'SEGMENT_UNFIXED' : 'SEGMENT_FIXED'
      yield put(reachGoal(metricsName, { index: segmentIndex }))
    } else {
      const metricsName = isActive ? 'FLIGHT_UNFIXED' : 'FLIGHT_FIXED'
      yield put(reachGoal(metricsName, { target }))
    }
  })
}
