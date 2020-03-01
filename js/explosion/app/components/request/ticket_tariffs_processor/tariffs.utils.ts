import { RawProposal } from 'shared_components/ticket/ticket_incoming_data.types'
import { Tariffs, NO_BAGS, UNKNOWN, TariffType } from 'shared_components/types/tariffs'

/**
 * Раскидываем пропзал по двум группам
 */
export const pushProposalToTariffs = (tariffs: Tariffs, proposal: RawProposal) => {
  tariffs.otherBaggage.push(proposal)
  if (
    proposal.worstBags!.baggage.code !== NO_BAGS &&
    proposal.worstBags!.baggage.code !== UNKNOWN
  ) {
    tariffs.hasBaggage.push(proposal)
    // если самый дешевый пропозал с багажом попал в обе вкладки то удаляем,
    // чтобы не было одинаково пропозала на кнопке
    if (tariffs.otherBaggage.length === 1) {
      tariffs.otherBaggage = []
    }
  }
}

/**
 * Высчитываем разинцу в цене и считаем какой из тарифоф дешевле
 */
export const extendTariffs = (tariffs: Tariffs): Tariffs => {
  // вычисляем дешевый тариф и разницу в цене если больше 1 тарифа
  if (tariffs.otherBaggage.length && tariffs.hasBaggage.length) {
    tariffs.priceDifference =
      tariffs.hasBaggage[0].unified_price - tariffs.otherBaggage[0].unified_price

    if (tariffs.otherBaggage[0].unified_price < tariffs.hasBaggage[0].unified_price) {
      tariffs.cheaperTariffKey = TariffType.OtherBaggage
    } else {
      tariffs.cheaperTariffKey = TariffType.HasBaggage
    }
  } else if (tariffs.otherBaggage.length) {
    tariffs.cheaperTariffKey = TariffType.OtherBaggage
  } else {
    tariffs.cheaperTariffKey = TariffType.HasBaggage
  }

  return tariffs
}

export const getDefaultTariffs = () => ({
  otherBaggage: [],
  hasBaggage: [],
  priceDifference: 0,
  cheaperTariffKey: TariffType.OtherBaggage,
})
