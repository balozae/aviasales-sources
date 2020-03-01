import i18next from 'i18next'
import { TariffTitleType } from './ticket_tariffs.types'
import {
  TariffType,
  Bags,
  NO_BAGS,
  UNKNOWN,
  BagType,
  BagInfo,
} from 'shared_components/types/tariffs'

export const getTariffTitleType = (
  tariffType: TariffType,
  worstBags: Bags,
  priceDifference: number,
): TariffTitleType => {
  if (tariffType === TariffType.OtherBaggage) {
    if (worstBags.baggage.code === NO_BAGS) {
      return TariffTitleType.NoBaggage
    } else if (worstBags.handbags.code === NO_BAGS) {
      return TariffTitleType.NoHandbags
    }
    if (worstBags.baggage.code === UNKNOWN && worstBags.handbags.code === UNKNOWN) {
      return TariffTitleType.UnknownAll
    } else if (worstBags.baggage.code === UNKNOWN) {
      return TariffTitleType.UnknownBaggage
    } else {
      return TariffTitleType.UnknownHandbags
    }
  } else {
    if (priceDifference === 0) {
      return TariffTitleType.NoDiff
    } else if (priceDifference > 0) {
      return TariffTitleType.PriceIncrease
    } else {
      // NOTE: priceDifference < 0
      return TariffTitleType.PriceDecrease
    }
  }
}

// получаем описание багажа для оторабжения
export const genDescription = ({
  t,
  amount,
  type,
  isShort,
  dimensions,
  weight,
}: {
  t: i18next.TFunction
  type: BagType
  isShort: boolean
  amount: number
  dimensions?: string
  weight?: string | number
}) => {
  let i18nKey: string = type
  const values: {
    amount: number
    weight?: string | number
    dimensions?: string
  } = {
    amount,
  }

  if (dimensions) {
    values.dimensions = dimensions

    if (weight === UNKNOWN) {
      i18nKey += '.withDimensions.anyWeight'
    } else {
      i18nKey += '.withDimensions.withWeight'
      values.weight = weight
    }
  } else if (weight !== UNKNOWN) {
    i18nKey += '.withWeight'
    values.weight = weight
  } else {
    i18nKey += '.withAmount'
  }

  if (isShort) {
    i18nKey = `${i18nKey}_short`
  }

  return t(`ticket:tariffTooltip.${i18nKey}`, { ...values })
}

export const getBagDescription = (
  t: i18next.TFunction,
  type: BagType,
  bag: BagInfo,
  isShort: boolean = true,
) => {
  const { code, amount, weight, dimensions } = bag

  if (code === UNKNOWN) {
    return t(`ticket:tariffTooltip.${type}.unknown`)
  } else if (code === NO_BAGS) {
    return t(`ticket:tariffTooltip.${type}.notIncluded`)
  }

  if (code.indexOf('PC') !== -1) {
    return genDescription({ t, amount, type, isShort, dimensions, weight })
  }

  return t(`ticket:tariffTooltip.${type}.default`, { code })
}
