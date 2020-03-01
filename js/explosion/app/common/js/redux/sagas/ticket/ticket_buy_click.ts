import i18next from 'i18next'
import { takeEvery, select, put, all, take } from '@redux-saga/core/effects'
import {
  getBuyClickSearchEventData,
  getFirstTicketArrivedAt,
} from '../../selectors/search.selectors'
import { TICKET_BUY_CLICK, TicketBuyClickAction, BuyEvents } from '../../types/ticket.types'
import { getBuyClickTicketEventData } from '../../selectors/ticket.selectors'
import {
  getBuyClickProposalEventData,
  getAllProposalEventData,
  prepareTicketProposals,
} from '../../selectors/proposals.selectors'
import { reachGoal, reachGoalOnUrl, sendTiming } from '../../actions/metrics.actions'
import { isNeedVisaCountries } from 'shared_components/ticket/utils/ticket_common.utils'
import { AppState } from '../../types/root/explosion'
import { getGates } from '../../selectors/gates.selectors'
import { getAirlines } from '../../selectors/airlines.selectors'
import { getSearchParams } from '../../selectors/search_params.selectors'
import { getTurnOffAnnoyingPopups } from '../../selectors/debug_settings.selectors'
import { addPopup } from '../../actions/popups.actions'
import { Proposal } from 'shared_components/ticket/ticket.types'
import { PopupType, REMOVE_POPUP, RemovePopupAction } from '../../types/popups.types'
import { isMobile } from 'shared_components/resizer'
import flagr from 'common/utils/flagr_client_instance'
import { openUncheckVisaFilterNotify } from '../../actions/uncheck_visa_filter_notify.actions'
import VKRetargeting from 'goalkeeper/vk_retargeting.coffee'
import { updateFilter } from '../../actions/filters.actions'

export function* ticketBuyClick() {
  yield takeEvery(TICKET_BUY_CLICK, function*({ event, data }: TicketBuyClickAction) {
    const { ticket, ticketIndex, currentTariff, isOpen, wasOpened, eventType, reachGoalData } = data
    const proposal = data.proposal as Proposal
    const [ticketData] = ticket

    const turnOffAnnoyingPopups: ReturnType<typeof getTurnOffAnnoyingPopups> = yield select(
      getTurnOffAnnoyingPopups,
    )
    const visaCountries = isNeedVisaCountries(ticketData)
    if (!turnOffAnnoyingPopups && visaCountries.length) {
      event.preventDefault()

      let hasTransit = false
      let countryNames = visaCountries.map((country) => {
        if (!hasTransit && !!country.isTransit) {
          hasTransit = true
        }
        return i18next.t(`ticket:visaCountries.${country.country}`)
      })

      yield put(
        addPopup({
          popupType: PopupType.VisaConfirm,
          params: { hasTransit, country: countryNames },
        }) as any,
      )

      const closedPopup: RemovePopupAction = yield take(REMOVE_POPUP)

      if (closedPopup.data === 'cancelled') {
        let countries: string[] = []
        if (visaCountries && visaCountries.length > 0 && visaCountries[0].country) {
          countries = visaCountries.map(({ country }) => country)
        }
        const isNeverShowUncheckVisaFilterNotify = yield select(
          (state: AppState) => state.uncheckVisaFilterNotify.isNeverShow,
        )
        /* We do not update filters when notify isNeverShow === true
         * because user refused to hide tickets in uncheck_visa_filter notify
         */
        if (!isNeverShowUncheckVisaFilterNotify) {
          yield put(openUncheckVisaFilterNotify(countries))
          yield all(
            countries.map((country) => {
              return put(
                updateFilter({
                  filterName: 'visa',
                  filterField: country,
                  filterValue: true,
                }),
              )
            }),
          )
        }

        return
      }

      window.open(proposal.deeplink, '_blank')
    }

    const searchEventData = yield select(getBuyClickSearchEventData)
    const ticketEventData = yield select(
      getBuyClickTicketEventData,
      ticket,
      currentTariff,
      ticketIndex,
      isOpen,
      wasOpened,
    )
    const proposalEventData = yield select(getBuyClickProposalEventData, ticketData, proposal)
    const allProposalEventData = yield select(getAllProposalEventData, ticketData, currentTariff)
    const searchParams = yield select(getSearchParams)

    const metricsData = {
      ...searchEventData,
      ...ticketEventData,
      ...proposalEventData,
      ...allProposalEventData,
      ...(reachGoalData || {}),
    }

    if (eventType === BuyEvents.ContextMenu) {
      yield put(reachGoal('TICKET_BUY_BUTTON_CONTEXTMENU', metricsData))
      return
    }

    const deeplink = proposal && proposal.deeplink ? proposal.deeplink : undefined
    const firstTicketArrivedAt = yield select(getFirstTicketArrivedAt)
    VKRetargeting.Event('ticket_buy_button_click')
    yield put(reachGoal(`TICKET_${eventType}_CLICK`, metricsData))
    yield put(reachGoalOnUrl(`DEFERRED_TICKET_${eventType}_CLICK`, metricsData, deeplink!))
    yield put({
      type: 'INITIATE_FACEBOOK_CHECKOUT',
      ticket: ticketData,
      params: metricsData,
      searchParams,
    })
    yield put(sendTiming('buy_click', Date.now() - firstTicketArrivedAt))

    const feedbackData = yield select((state: AppState) => state.showGatesFeedbackData)
    const gates = yield select(getGates)
    const airlines = yield select(getAirlines)

    if (
      feedbackData.isShowForAll ||
      (proposal.gateId && feedbackData.gateIds.indexOf(proposal.gateId.toString()) >= 0)
    ) {
      let gateId: string
      let label: string
      if (proposal.gateId) {
        gateId = proposal.gateId.toString()
        label = gates[proposal.gateId].label
      } else {
        let airline = airlines[ticketData.validating_carrier]

        gateId = `${airline.name} (${airline.iata})`
        label = airline.siteName || airline.name || ''
      }
      const [proposals] = yield select(prepareTicketProposals, ticketData)
      yield put(
        addPopup({
          popupType: PopupType.GateFeedback,
          params: { gateLabel: label, proposals, ticket, gateId, proposal },
        }) as any,
      )
    } else {
      if (flagr.is('avs-exp-rentalcarsPopup')) {
        if (!isMobile()) {
          yield put(addPopup({ popupType: PopupType.RentalCars, params: ticketData }) as any)
        }
      } else {
        yield put(addPopup({ popupType: PopupType.Hotel }) as any)
      }
    }
  })
}
