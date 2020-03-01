import { RawProposal, Flight } from 'shared_components/ticket/ticket_incoming_data.types'
import { BagType, BagCodeType, UNKNOWN, NO_BAGS, BagInfo } from 'shared_components/types/tariffs'

const POBEDA_IATA = 'DP'

// Кэщируем попаршеный код
const codeInfoCache = {}

/**
 * Парсим код багажа и формируем строку дебага
 */
export const parseBag = (
  type: BagType,
  proposal: RawProposal,
  segmentIndex: number,
  flightIndex: number,
  flight: Flight,
) => {
  let code = normalizeBagCode(proposal[`flights_${type}`][segmentIndex][flightIndex])

  const source = proposal[`${type}_source`]
    ? proposal[`${type}_source`][segmentIndex][flightIndex]
    : -1

  let fareCode
  if (proposal.fare_codes && proposal.fare_codes[segmentIndex]) {
    fareCode = proposal.fare_codes[segmentIndex][flightIndex]
  }

  let debug = parseBagSource(
    source,
    type,
    code,
    fareCode,
    proposal.gate_id,
    flight.operating_carrier,
  )

  // HACK: for Pobeda airlines we need to show handbags with dimensions
  if (flight.operating_carrier === POBEDA_IATA && type === 'handbags') {
    code = '1PCx36x30x27'
    debug = 'костыль для ручной клади победы'
  }

  // Сначала пробуем отдать из кэша
  const info = codeInfoCache[code] || bagCodeToInfo(code)
  if (!codeInfoCache[code]) {
    codeInfoCache[code] = info
  }

  return Object.assign({}, info, { code, debug })
}

/**
 * Сравниваем 2 сумки
 */
export const chooseWorstBags = (a, b) => {
  if (!b) {
    return a
  }
  if (a.code === NO_BAGS || b.code === NO_BAGS) {
    return a.code === NO_BAGS ? a : b
  } else if (a.code === UNKNOWN || b.code === UNKNOWN) {
    return a.code === UNKNOWN ? a : b
  } else if (a.code !== b.code) {
    const aBagVal = bagCodeValuation(a)
    const bBagVal = bagCodeValuation(b)

    if (aBagVal < bBagVal) {
      return a
    }
    return b
  }

  return a
}

/**
 * вычисляем ценность багажа для сравнения между собой
 */
const bagCodeValuation = (info: BagInfo) => {
  if (info.amount === 0 && info.weight === UNKNOWN) {
    return -1 // Неизвестен
  } else if (info.amount === 0 && !info.weight) {
    return 0 // Нету
  } else if (info.amount && info.weight === UNKNOWN) {
    return info.amount // Известно только кол-во
  } else if (info.amount && info.weight) {
    return info.amount * (info.weight as number) // Известно все
  }

  return -1
}

const bagCodeToInfo = (code: BagCodeType) => {
  if (code === UNKNOWN) {
    return {
      weight: UNKNOWN,
      amount: 0,
    }
  } else if (code === NO_BAGS) {
    return {
      amount: 0,
    }
  }

  if (code.indexOf('PC') !== -1) {
    const codeArray = code.split('PC')
    const [amount, weight, dimensions] = [codeArray[0], ...codeArray[1].split(/x(.+)/)]

    return {
      weight: !weight ? UNKNOWN : parseInt(weight, 10),
      dimensions,
      amount: ~~amount,
    }
  }

  return {
    weight: parseInt(code, 10),
    amount: 1,
  }
}

const normalizeBagCode = (rawCode?: string | false): BagCodeType => {
  if (rawCode === false) {
    return NO_BAGS
  } else if (!rawCode) {
    return UNKNOWN
  }
  return rawCode.replace('х', 'x')
}

const parseBagSource = (
  source: number,
  type: BagType,
  code: BagCodeType,
  fareCode: string,
  gateId: string,
  operatingCarrier: string,
): string => {
  switch (source) {
    case -1:
      // tslint:disable-next-line:max-line-length
      return `источник багажа неизвестен от '${operatingCarrier}' с farecode '${fareCode}' и гейтом ${gateId} код (${code})`
    case 1:
    case 2:
      return `из словарика для '${operatingCarrier}' с farecode '${fareCode}' и гейтом ${gateId} код (${code})`
    case 3:
      return `из словарика для ${operatingCarrier} код (${code})`
    case 4:
      if (code !== UNKNOWN) {
        return `дефолтное значение для всех ${type} код (${code})`
      }
      break
    case 0:
    default:
      break
  }

  return `от гейта ${gateId} код (${code})`
}
