import { takeEvery, put, select } from '@redux-saga/core/effects'
import { TICKET_SCHEDULE_CLICK, TicketScheduleClickAction } from '../../types/ticket.types'
import { getScheduleTicketGroupKey } from 'components/product_list/product_list.utils'
import { AppState } from '../../types/root/explosion'
import { getTicketBySign } from '../../selectors/tickets.selectors'
import { updateSelectedScheduleTicket } from '../../actions/selected_schedule_tickets.actions'

export function* ticketScheduleClick() {
  yield takeEvery(TICKET_SCHEDULE_CLICK, function*({ ticket, sign }: TicketScheduleClickAction) {
    const groupKey = getScheduleTicketGroupKey(ticket[0])
    const selectedTicket = yield select((state: AppState) => getTicketBySign(state, sign))
    if (selectedTicket && groupKey) {
      yield put(updateSelectedScheduleTicket(groupKey, selectedTicket))
    }
  })
}
