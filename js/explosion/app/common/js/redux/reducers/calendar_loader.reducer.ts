import {
  CalendarLoaderState,
  HideCalendarLoaderAction,
  ShowCalendarLoaderAction,
} from '../types/calendar_loader.types'

export const initialState: CalendarLoaderState = false

export default function(
  state: CalendarLoaderState = initialState,
  action: HideCalendarLoaderAction | ShowCalendarLoaderAction,
) {
  switch (action.type) {
    case 'SHOW_CALENDAR_LOADER':
      return true
    case 'HIDE_CALENDAR_LOADER':
      return false
    default:
      return state
  }
}
