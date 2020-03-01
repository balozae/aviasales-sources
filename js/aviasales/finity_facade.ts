import finity from 'finity-js'
import i18next from 'i18next'

export function getArrayOfTranslationsByKey(translationsKey: string) {
  const obj = i18next.t(`common:dateTime.${translationsKey}`, { returnObjects: true })

  if (!obj) {
    return []
  }

  return Object.keys(obj).map((key) => {
    return obj[key]
  })
}

export function setCurrentLocale() {
  finity.setLocale({
    months: getArrayOfTranslationsByKey('months'),
    monthsGenitive: getArrayOfTranslationsByKey('monthsGenitive'),
    monthsShort: getArrayOfTranslationsByKey('monthsShort'),
    monthsShortGenitive: getArrayOfTranslationsByKey('monthsShortGenitive'),
    weekdays: getArrayOfTranslationsByKey('weekdays'),
    weekdaysShort: getArrayOfTranslationsByKey('weekdaysShort'),
  })
}

export default function() {
  setCurrentLocale()
}
