import rollbar from 'common/utils/rollbar'
import {
  TicketTuple,
  RawProposal,
  Segment,
} from 'shared_components/ticket/ticket_incoming_data.types'
import { BagType } from 'shared_components/types/tariffs'
import { pushProposalToTariffs, extendTariffs, getDefaultTariffs } from './tariffs.utils'
import { parseBag, chooseWorstBags } from './bags.utils'

/**
 * Функция прасинга инофрмации о багаже и создания группировки пропозалов
 * по двум тарифам:
 * багажный (мы 100% знаем какой багаж на перелётах)
 * и безбагажный (он же "все") сюда попадают все пропозалый в т.ч. багажные
 *
 * Т.к. эта функция содержит себе тяжелую синхронную опирацию и вызывается крайне часто,
 * то мутируем приходящий TicketTuple, избегаем копирования объектов
 * Функция мутирует объекты пропозалов добавляет в них:
 * bags: см. interface Bags (сумки по каждому флайту)
 * worstBags: минимальный багаж по всем флайтам
 *
 * Функция мутирует объект билета добавляя в него:
 * tariffs: см. interface Tariffs (отредерятся вкладками на билете)
 */

const patchTicketTariffs = (ticketTuple: TicketTuple): TicketTuple => {
  // Создаём объект тарифов билета. Далее будет мутироваться
  const tariffs = getDefaultTariffs()

  // Основной цикл по всем пропозалам
  for (let i = 0; i < ticketTuple[1].length; i++) {
    const proposal = ticketTuple[1][i]
    if (proposal.hasOwnProperty('worstBags')) {
      // Если уже есть worstBags, значит уже считали. Пропускаем.
      // Но перезаполняем тарифы билета, т.к. билет может пересоздаваться заново
      pushProposalToTariffs(tariffs, proposal)
      continue
    }
    patchProposal(ticketTuple[0].segment, proposal)
    pushProposalToTariffs(tariffs, proposal)
  }

  // Приминяем конечный новый объект tariffs к билету
  ticketTuple[0].tariffs = extendTariffs(tariffs)
  return ticketTuple
}

/**
 * Мутируем объект пропозала, добавляем bags и worstBags
 */
const patchProposal = (segments: Segment[], proposal: RawProposal) => {
  for (let segmentIndex = 0; segmentIndex < segments.length; segmentIndex++) {
    const segment = segments[segmentIndex]

    for (let flightIndex = 0; flightIndex < segment.flight.length; flightIndex++) {
      const flight = segment.flight[flightIndex]

      const baggage = parseBag(BagType.Baggage, proposal, segmentIndex, flightIndex, flight)
      const handbags = parseBag(BagType.Handbags, proposal, segmentIndex, flightIndex, flight)

      const worst = {
        baggage: chooseWorstBags(baggage, proposal.worstBags && proposal.worstBags.baggage),
        handbags: chooseWorstBags(handbags, proposal.worstBags && proposal.worstBags.handbags),
      }

      proposal.worstBags = worst

      if (!proposal.bags) {
        proposal.bags = []
      }
      if (!proposal.bags[segmentIndex]) {
        proposal.bags[segmentIndex] = []
      }

      proposal.bags[segmentIndex][flightIndex] = { baggage, handbags }
    }
  }
}

export default (ticket: TicketTuple) => {
  try {
    return patchTicketTariffs(ticket)
  } catch (error) {
    console.warn(JSON.stringify(ticket))
    rollbar.critical('An error occured during ticket tariffs processing', error)
    // TODO: handle with some defaults
    return ticket
  }
}
