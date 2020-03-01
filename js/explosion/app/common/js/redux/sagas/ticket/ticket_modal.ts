import { takeEvery, put } from '@redux-saga/core/effects'
import {
  TICKET_OPEN_MODAL_CLICK,
  TicketCloseModalClickAction,
  TICKET_CLOSE_MODAL_CLICK,
  TicketOpenModalClickAction,
} from '../../types/ticket.types'
import { openHistoryModal, closeHistoryModal } from '../../actions/browser_history.actions'

export function* ticketOpenModal() {
  yield takeEvery(TICKET_OPEN_MODAL_CLICK, function*({
    ticketIndex,
    ticketData,
    modal,
  }: TicketOpenModalClickAction) {
    // @ts-ignore
    yield put(openHistoryModal(ticketIndex, ticketData, modal))
  })
}

export function* ticketCloseModal() {
  yield takeEvery(TICKET_CLOSE_MODAL_CLICK, function*({
    ticketIndex,
    ticketData,
    modal,
  }: TicketCloseModalClickAction) {
    // @ts-ignore
    yield put(closeHistoryModal(ticketIndex, ticketData, modal))
  })
}
