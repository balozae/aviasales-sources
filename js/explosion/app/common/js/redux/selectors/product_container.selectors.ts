import { createSelector } from 'reselect'
import { fixedFlightsMatch, isHighlightedTicket } from 'shared_components/ticket/utils/common.utils'
import { TicketTuple } from 'shared_components/ticket/ticket_incoming_data.types'
import patchTicketTarrifs from 'components/request/ticket_tariffs_processor/ticket_tariffs_processor'
import { ProductContainerTicketsProps } from 'components/product_container/product_container'
import { getTickets, sortTickets } from 'common/js/redux/selectors/tickets.selectors'
import { getHighlightedTicketParams } from 'common/js/redux/selectors/highlighted_ticket_params.selectors'
import { getSortState } from 'common/js/redux/selectors/sort.selectors'
import { getFilters } from 'common/js/redux/selectors/filters.selectors'
import { getFixedFlights } from 'common/js/redux/selectors/fixed_flights.selectors'
import { getSelectedScheduleTickets } from 'common/js/redux/selectors/selected_schedule_tickets.selectors'
import { getFilteredTicketsBadges } from 'common/js/redux/selectors/tickets_badges.selector'
import { ScheduleTicketsIterator } from '../types/selected_schedule_tickets.types'
import {
  isScheduleTicket,
  getScheduleTicketGroupKey,
} from 'components/product_list/product_list.utils'

const getFilteredTickets = createSelector(
  getTickets,
  getFilters,
  getFixedFlights,
  getHighlightedTicketParams,
  getSelectedScheduleTickets,
  (
    tickets,
    filters,
    fixedFlights,
    highlightedTicketParams,
    selectedScheduleTickets,
  ): ProductContainerTicketsProps => {
    const results: TicketTuple[] = []
    const scheduleTickets: ScheduleTicketsIterator<TicketTuple[]> = {}
    let highlightedTicket: TicketTuple | undefined = undefined

    for (let i = 0; i < tickets.length; i++) {
      const ticket = tickets[i]
      let resultTicket: TicketTuple | null = ticket

      // NOTE: skip skip ticket if not match with fixed flights
      if (fixedFlights && !fixedFlightsMatch(resultTicket, fixedFlights)) {
        continue
      }

      // NOTE: apply filters to ticket
      if (filters.filterFunc) {
        resultTicket = filters.filterFunc(ticket)
        if (!resultTicket) {
          continue
        }
        // NOTE: we have to recalc ticket tariffs if proposals were partially filtered
        if (ticket[1].length !== resultTicket[1].length) {
          resultTicket = patchTicketTarrifs([{ ...resultTicket[0] }, resultTicket[1]])
        }
      }

      const isSchedule = isScheduleTicket(resultTicket[0])
      // NOTE: process schedule ticket
      if (isSchedule) {
        const groupKey = getScheduleTicketGroupKey(resultTicket[0])!
        // NOTE: create schedule ticket group if not exists
        if (!scheduleTickets[groupKey]) {
          scheduleTickets[groupKey] = []
        }
        // NOTE: push ticket to schedule ticket grouped list
        scheduleTickets[groupKey]!.push(resultTicket)
      }

      // NOTE: extract highlighted ticket
      if (isHighlightedTicket(resultTicket, highlightedTicketParams)) {
        highlightedTicket = resultTicket
        continue
      }

      // NOTE: do not "continue" in first same cond to extract highlighted ticket for schedule ticket
      if (isSchedule) {
        continue
      }

      // NOTE: push to main list if ticket were not filtered, highlighted or schedule
      results.push(resultTicket)
    }

    const highlightedGroupKey = highlightedTicket && getScheduleTicketGroupKey(highlightedTicket[0])
    const scheduleTicketsProps = Object.keys(scheduleTickets).reduce(
      (acc, groupKey) => {
        // NOTE: sort tickets by departure time
        const group = scheduleTickets[groupKey]!.slice().sort(
          (a, b) => a[0].segments_time[0][0] - b[0].segments_time[0][0],
        )

        // NOTE: find chepest ticket in schedule
        const cheapestTicket = group.reduce(
          (prev, curr) => (curr[1][0].unified_price < prev[1][0].unified_price ? curr : prev),
          group[0],
        )

        // NOTE: add schedule tickets list to result scheduleTickets grouped list
        acc.scheduleTickets[groupKey] = group

        // NOTE: find highlighted schedule ticket if exists
        const scheduleHighlightedTicket =
          highlightedTicket && isScheduleTicket(highlightedTicket[0]) ? highlightedTicket : null

        // NOTE: calculate selected ticket.
        // 1. Selected ticket by user from store
        // 2. If user has not selected ticket use highlightedTicket
        // 3. Use cheapest one if no highlighted schedule ticket
        acc.selectedScheduleTickets[groupKey] =
          selectedScheduleTickets[groupKey] || scheduleHighlightedTicket || cheapestTicket

        // NOTE: Do not push ticket to main array if ticket group is highlighted group
        if (groupKey !== highlightedGroupKey) {
          results.push(cheapestTicket)
        }

        return acc
      },
      { scheduleTickets: {}, selectedScheduleTickets: {} },
    )

    return {
      ...scheduleTicketsProps,
      highlightedTicket,
      filteredTickets: results,
    }
  },
)

export const prepareAllTypesTickets = createSelector(
  getFilteredTickets,
  getSortState,
  getFilteredTicketsBadges,
  (ticketsResults, sort, badges): ProductContainerTicketsProps => ({
    ...ticketsResults,
    filteredTickets: sortTickets(ticketsResults.filteredTickets, sort, badges),
  }),
)
