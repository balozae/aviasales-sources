import i18next from 'i18next'
import {
  TripDurationTab,
  TripDurationValue,
  TripDurationRange,
  TripDurationMonths,
} from './trip_duration.types'
import { buildMonthPickerValue } from 'shared_components/month_picker/month_picker.utils'
import { format } from 'finity-js'
import { dateToLowerCase } from 'shared_components/l10n/l10n'

export const months = buildMonthPickerValue()

export const getCurrentTabByValue = (
  value?: TripDurationValue | string,
): TripDurationTab | undefined => {
  if (typeof value === 'string') {
    return
  }

  if (!value || value instanceof Date) {
    return 'calendar'
  }

  if ((value as TripDurationRange).min && (value as TripDurationRange).max) {
    return 'range-slider'
  }

  if (Array.isArray(value) && value[0] instanceof Date) {
    return 'months'
  }
}

export const isValidDate = (date: Date, before: Date, after: Date): boolean => {
  return date > before && date < after ? true : false
}

export const formatMonthRange = (range: TripDurationMonths): string => {
  switch (range.length) {
    case 12:
      return i18next.t('common:dateTime.picker.anyMonth')
    case 1:
      return dateToLowerCase(format(range[0], 'MMMM'))
    case 0:
      return ''
    default:
      return dateToLowerCase(
        `${format(range[0], 'MMMM')}...${format(range[range.length - 1], 'MMMM')}`,
      )
  }
}
