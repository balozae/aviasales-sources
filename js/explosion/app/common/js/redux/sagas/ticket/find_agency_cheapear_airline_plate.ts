import { takeEvery, select, call, put } from '@redux-saga/core/effects'
import { UPDATE_SEARCH_STATUS } from '../../types/search_status.types'
import { getTickets } from '../../selectors/tickets.selectors'
import { getSearchFinished, getSearchId } from '../../selectors/search.selectors'
import { getWithAgencyCheaperAirlinePlate } from '../../selectors/ticket.selectors'
import { TicketTuple } from 'shared_components/ticket/ticket_incoming_data.types'
import { AppState } from '../../types/root/explosion'
import { TariffType } from 'shared_components/types/tariffs'
import { reachGoalOnce } from '../../actions/metrics.actions'

function* checkTicketAgency(ticket: TicketTuple) {
  const hasBaggae = yield select((state: AppState) =>
    getWithAgencyCheaperAirlinePlate(state, ticket[0], TariffType.HasBaggage),
  )
  const otherBaggae = yield select((state: AppState) =>
    getWithAgencyCheaperAirlinePlate(state, ticket[0], TariffType.OtherBaggage),
  )
  if (hasBaggae || otherBaggae) {
    const searchId = yield select(getSearchId)
    yield put(reachGoalOnce('SEARCH_HAVE_TICKET_WITH_PRICE_PLATE', { searchId }))
  }
}

export function* findAgencyCheapearAirlinePlateMetric() {
  yield takeEvery(UPDATE_SEARCH_STATUS, function*() {
    const tickets = yield select(getTickets)
    const isSearchFinished = yield select(getSearchFinished)
    if (isSearchFinished) {
      yield tickets.forEach((ticket) => call(checkTicketAgency, ticket))
    }
  })
}
