import { takeEvery, put, select } from '@redux-saga/core/effects'
import { TICKET_CLICKED, TicketClickAction } from '../../types/ticket.types'
import { getSearchFinished } from '../../selectors/search.selectors'
import { reachGoal } from '../../actions/metrics.actions'
import { getSearchParams } from '../../selectors/search_params.selectors'

export function* ticketClick() {
  yield takeEvery(TICKET_CLICKED, function*(action: TicketClickAction) {
    const isSearchFinished: ReturnType<typeof getSearchFinished> = yield select(getSearchFinished)
    const searchParams: ReturnType<typeof getSearchParams> = yield select(getSearchParams)

    if (action.isOpenAction) {
      yield put({ type: 'VIEW_FACEBOOK_CONTENT', ticketData: action.ticketData, searchParams })
      yield put(
        reachGoal('EXPAND_TICKET', {
          ticket_position: action.ticketIndex,
          search_finished: isSearchFinished,
        }),
      )
    } else {
      yield put(
        reachGoal('COLLAPSE_TICKET', {
          ticket_position: action.ticketIndex,
          search_finished: isSearchFinished,
        }),
      )
    }
  })
}
