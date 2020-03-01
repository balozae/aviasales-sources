import { fork } from '@redux-saga/core/effects'
import { ticketClick } from './ticket_click'
import { ticketTariffChange } from './ticket_tariff'
import { ticketBuyClick } from './ticket_buy_click'
import { findAgencyCheapearAirlinePlateMetric } from './find_agency_cheapear_airline_plate'
import { ticketShare, ticketShareTooltipShown, ticketUrlCopy } from './ticket_share'
import { ticketHotelStopClick } from './ticket_hotel_stop'
import { ticketFlightInfoClicked } from './ticket_flight_info'
import { ticketWarningBadgeTooltipShown } from './ticket_badge'
import { ticketCreditClick } from './ticket_credit'
import { ticketRefreshClick } from './ticket_refresh'
import { ticketOpenModal, ticketCloseModal } from './ticket_modal'
import { ticketPinClick } from './ticket_pin'
import { ticketScheduleClick } from './ticket_schedule'

export default function* ticketSaga() {
  yield fork(ticketClick)
  yield fork(ticketTariffChange)
  yield fork(ticketBuyClick)
  yield fork(findAgencyCheapearAirlinePlateMetric)
  yield fork(ticketShare)
  yield fork(ticketShareTooltipShown)
  yield fork(ticketUrlCopy)
  yield fork(ticketHotelStopClick)
  yield fork(ticketFlightInfoClicked)
  yield fork(ticketWarningBadgeTooltipShown)
  yield fork(ticketCreditClick)
  yield fork(ticketRefreshClick)
  yield fork(ticketOpenModal)
  yield fork(ticketCloseModal)
  yield fork(ticketPinClick)
  yield fork(ticketScheduleClick)
}
