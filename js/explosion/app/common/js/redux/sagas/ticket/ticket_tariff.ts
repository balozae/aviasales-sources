import { TICKET_TARIFF_CHANGE, TicketTariffChangeAction } from '../../types/ticket.types'
import { takeEvery, put } from '@redux-saga/core/effects'
import { reachGoal } from '../../actions/metrics.actions'

export function* ticketTariffChange() {
  yield takeEvery(TICKET_TARIFF_CHANGE, function*({ currentTariff }: TicketTariffChangeAction) {
    yield put(reachGoal('TICKET_TARIFF_TAB_CLICK', { tariff_key: currentTariff }))
  })
}
