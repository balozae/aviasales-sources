import Cookie from 'oatmeal-cookie'
import { takeEvery, put, select, call } from '@redux-saga/core/effects'
import { TicketCreditClickAction, TICKET_CREDIT_CLICK } from '../../types/ticket.types'
import { reachGoal } from '../../actions/metrics.actions'
import { getCreditPartner } from '../../selectors/credit_partner.selectors'
import { getMarker } from '../../selectors/marker.selectors'
import { UNIQ_COOKIE_KEY, creditFormSubmit } from 'components/product_list/product_list.utils'
import { getGates } from '../../selectors/gates.selectors'
import { getAirports } from '../../selectors/airports.selectors'
import { getAirlines } from '../../selectors/airlines.selectors'
import { getSearchParams } from '../../selectors/search_params.selectors'

export function* ticketCreditClick() {
  yield takeEvery(TICKET_CREDIT_CLICK, function*({ ticket }: TicketCreditClickAction) {
    const creditPartner = yield select(getCreditPartner)
    const marker = yield select(getMarker)
    const partnerName = (creditPartner && creditPartner.name) || 'unknown'
    const uniqueClick = Cookie.contains(UNIQ_COOKIE_KEY) ? false : true

    yield put(
      reachGoal('CREDIT_IN_TICKET_BUY_BUTTON_CLICK', {
        unique_click: uniqueClick,
        partner_name: partnerName,
        marker,
      }),
    )

    const gates = yield select(getGates)
    const airports = yield select(getAirports)
    const airlines = yield select(getAirlines)
    const searchParams = yield select(getSearchParams)

    try {
      yield call(
        creditFormSubmit,
        ticket,
        gates,
        airports,
        airlines,
        searchParams,
        marker,
        creditPartner,
      )
    } catch {
      /* ? */
    }
  })
}
