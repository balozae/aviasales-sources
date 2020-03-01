import { takeEvery, put } from '@redux-saga/core/effects'
import {
  TICKET_WARNING_BADGE_TOOLTIP_SHOWN,
  TicketWarningBadgeTooltipShownAction,
} from '../../types/ticket.types'
import { reachGoal } from '../../actions/metrics.actions'

export function* ticketWarningBadgeTooltipShown() {
  yield takeEvery(TICKET_WARNING_BADGE_TOOLTIP_SHOWN, function*({
    key,
  }: TicketWarningBadgeTooltipShownAction) {
    yield put(reachGoal('SMALL_RATING_INFO_SHOWN', { type: key }))
  })
}
