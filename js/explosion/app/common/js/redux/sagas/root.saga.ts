import { all, spawn, call } from '@redux-saga/core/effects'
import rollbar from 'common/utils/rollbar'
import ticketSaga from './ticket/ticket.saga'
import topPlacementTicketSaga from './top_placement_ticket.saga'
import calendarPricesSaga from './calendar_prices.saga'
import aviaFormSaga from './avia_form.saga'
import pageHeaderSaga from './page_header.saga'
import ticketSubscriptionEmailPopupSaga from './activate_email.saga'
import ticketSubscriptionsSaga from './ticket_subscriptions.saga'
import directionSubscriptionsSaga from './direction_subscriptions.saga'
import userSaga from './user.saga'
import errorSaga from './error.saga'
import formParamsSaga from './form_params.saga'
import { filtersSaga } from './filters.saga'
import { chinaNotifySaga } from './china_notify.saga'

export default function* rootSaga() {
  const sagas = [
    ticketSaga,
    topPlacementTicketSaga,
    calendarPricesSaga,
    aviaFormSaga,
    pageHeaderSaga,
    ticketSubscriptionEmailPopupSaga,
    ticketSubscriptionsSaga,
    directionSubscriptionsSaga,
    userSaga,
    errorSaga,
    formParamsSaga,
    filtersSaga,
    chinaNotifySaga,
  ]

  yield all(
    sagas.map((saga) =>
      spawn(function*() {
        while (true) {
          try {
            yield call(saga)
            break
          } catch (e) {
            rollbar.error(`Saga ${saga.name} error`, e)
            console.error(`Saga ${saga.name} error`, e)
          }
        }
      }),
    ),
  )
}
