import React from 'react'
import DayPicker, {
  DayPickerProps,
  RangeModifier,
  BeforeModifier,
  AfterModifier,
  DaysOfWeekModifier,
  Modifiers,
  DayModifiers,
} from 'react-day-picker'
import { addMonths } from 'finity-js'
import clssnms from 'clssnms'
import { withTranslation, WithTranslation } from 'react-i18next'
import { getArrayOfTranslationsByKey } from 'finity_facade'
import { getWeekFirstDay } from 'shared_components/l10n/l10n'
import defaultResizer, { MediaQueryTypes } from 'shared_components/resizer'
import { getDateTime } from './calendar.utils'
import CalendarDay from './calendar_day/calendar_day'
import CalendarNavbar, { CalendarNavbarProps } from './calendar_navbar/calendar_navbar'
import CalendarCaption from './calendar_caption/calendar_caption'

import './calendar.scss'

const cn = clssnms('calendar')

const classNames = {
  // The container element
  container: cn(),
  // The wrapper element, used for keyboard interaction
  wrapper: cn('container'),
  // Added to the container when there's no interaction with the calendar
  interactionDisabled: '--is-disabled',
  // The navigation bar with the arrows to switch between months
  navBar: cn('navbar'),
  // Button to switch to the previous month
  navButtonPrev: cn('navbar-button', '--prev'),
  // Button to switch to the next month
  navButtonNext: cn('navbar-button', '--next'),
  // Added to the navbuttons when disabled with fromMonth/toMonth props
  navButtonInteractionDisabled: '--is-disabled',
  // Container of the months table
  months: cn('months'),
  // The month's main table
  month: cn('month'),
  // The caption element, containing the current month's name and year
  caption: cn('caption'),
  // Table header displaying the weekdays names
  weekdays: cn('weekdays'),
  // Table row displaying the weekdays names
  weekdaysRow: cn('weekdays-row'),
  // Cell displaying the weekday name
  weekday: cn('weekday'),
  // Table's body with the weeks
  body: cn('weeks-body'),
  // Table's row for each week
  week: cn('week'),
  // The single day cell
  day: cn('day-cell'),
  // The calendar footer (only with todayButton prop)
  footer: cn('footer'),
  // The today button (only with todayButton prop)
  todayButton: cn('today-button'),
  /* default modifiers */
  // Added to the day's cell for the current day
  today: 'today',
  // Added to the day's cell specified in the "selectedDays" prop
  selected: 'selected',
  // Added to the day's cell specified in the "disabledDays" prop
  disabled: 'disabled',
  // Added to the day's cell outside the current month
  outside: 'outside',
}

const mediaQueryModesMapping = {
  mobile: MediaQueryTypes.Mobile,
  mobileLandscape: MediaQueryTypes.Mobile,
  tablet: MediaQueryTypes.Desktop,
  desktop: MediaQueryTypes.Desktop,
}

export interface ICalendarProps extends DayPickerProps {
  numberOfMonths?: number
  estimated?: Date
  currentMonth?: Date
  onCurrentMonthChanged?: (month: Date) => void
  onPreviousClick?: (month: Date) => void
  onNextClick?: (month: Date) => void
}

interface ICalendarState {
  hoveredDate?: Date | undefined
  currentMonth: Date
  isMobile?: boolean
}

class Calendar extends React.PureComponent<ICalendarProps & WithTranslation, ICalendarState> {
  state: ICalendarState = {
    currentMonth: this.props.currentMonth || new Date(),
    isMobile: defaultResizer.currentMode() === MediaQueryTypes.Mobile,
  }

  mediaQueryModes: string = 'mobile, tablet, desktop'

  componentDidMount() {
    if (this.props.onCurrentMonthChanged) {
      this.props.onCurrentMonthChanged(this.state.currentMonth)
    }
    defaultResizer.onMode(this.mediaQueryModes, this.handleMediaQueryTypeChange)
  }

  componentWillUnmount() {
    defaultResizer.offMode(this.mediaQueryModes, this.handleMediaQueryTypeChange)
  }

  componentDidUpdate(prevProps: ICalendarProps & WithTranslation, prevState: ICalendarState) {
    const { currentMonth, onCurrentMonthChanged } = this.props

    // NOTE: update value on input change for example
    if (
      currentMonth &&
      +currentMonth !== +prevState.currentMonth &&
      prevProps.currentMonth &&
      +currentMonth !== +prevProps.currentMonth
    ) {
      this.setState({
        currentMonth,
      })
    }

    if (
      onCurrentMonthChanged &&
      (this.state.currentMonth !== prevState.currentMonth || !currentMonth)
    ) {
      onCurrentMonthChanged(this.state.currentMonth)
    }
  }

  handleMediaQueryTypeChange = (meadiaQueryKey: string) => {
    this.setState({ isMobile: mediaQueryModesMapping[meadiaQueryKey] === MediaQueryTypes.Mobile })
  }

  onDayClick = (
    date: Date,
    modifiers: DayModifiers,
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ): void => {
    const { disabled } = modifiers

    if (disabled) {
      return
    }

    if (this.props.onDayClick) {
      date.setHours(0, 0, 0, 0)
      this.props.onDayClick(date, modifiers, e)
    }
  }

  onDayMouseEnter = (
    hoveredDate: Date,
    modifiers: DayModifiers,
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ): void => {
    const { disabled } = modifiers

    if (disabled) {
      return
    }

    this.setState({ hoveredDate }, () => {
      if (this.props.onDayMouseEnter) {
        this.props.onDayMouseEnter(hoveredDate, modifiers, e)
      }
    })
  }

  onDayMouseLeave = (
    hoveredDate: Date,
    modifiers: DayModifiers,
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ): void => {
    const { disabled } = modifiers

    if (disabled) {
      return
    }

    if (this.props.onDayMouseLeave) {
      this.props.onDayMouseLeave(hoveredDate, modifiers, e)
    }
  }

  handleCaptionMonthChange = (month: Date) => {
    this.setState({
      currentMonth: month,
    })

    if (this.props.onMonthChange) {
      this.props.onMonthChange(month)
    }
  }

  // NOTE: clear state values and ui
  handleMouseLeaveCalendar = () => {
    if (this.state.hoveredDate) {
      this.setState({ hoveredDate: undefined })
    }
  }

  estimated = (date: Date): boolean => {
    const { hoveredDate } = this.state
    const { estimated } = this.props

    if (!hoveredDate || !estimated) {
      return false
    }

    const followFromFormatted = getDateTime(estimated, '12:00')

    if (
      (date >= hoveredDate && date <= followFromFormatted) ||
      (date <= hoveredDate && date >= followFromFormatted)
    ) {
      return true
    }

    return false
  }

  bounded = (date: Date): boolean => {
    const { selectedDays } = this.props
    let arrayOfSelectedDays = Array.isArray(selectedDays) ? selectedDays : [selectedDays]
    const intDate = +date
    const day = 86400000

    if (!selectedDays) {
      return false
    }

    for (const selectedDay of arrayOfSelectedDays) {
      if (!selectedDay) {
        return false
      }

      if (selectedDay instanceof Date && +getDateTime(selectedDay) === intDate) {
        return true
      }

      if (typeof selectedDay === 'object') {
        // type of RangeModifier
        if (
          ((selectedDay as RangeModifier).from instanceof Date &&
            +getDateTime((selectedDay as RangeModifier).from) === intDate) ||
          ((selectedDay as RangeModifier).to instanceof Date &&
            +getDateTime((selectedDay as RangeModifier).to) === intDate)
        ) {
          return true
        }

        // type of BeforeAfterModifier
        if (
          ((selectedDay as BeforeModifier).before instanceof Date &&
            +getDateTime((selectedDay as BeforeModifier).before) - day === intDate) ||
          ((selectedDay as AfterModifier).after instanceof Date &&
            +getDateTime((selectedDay as AfterModifier).after) + day === intDate)
        ) {
          return true
        }

        // type of DaysOfWeekModifier
        if (
          (selectedDay as DaysOfWeekModifier).daysOfWeek &&
          (selectedDay as DaysOfWeekModifier).daysOfWeek.includes(date.getDay())
        ) {
          return true
        }
      }

      if (typeof selectedDay === 'function' && selectedDay(date)) {
        return true
      }
    }

    return false
  }

  handlePreviousNavClick = () => {
    const currentMonth = addMonths(this.state.currentMonth, -1)

    this.setState({ currentMonth })

    if (this.props.onPreviousClick) {
      this.props.onPreviousClick(currentMonth)
    }
  }

  handleNextNavClick = () => {
    const currentMonth = addMonths(this.state.currentMonth, 1)

    this.setState({ currentMonth })

    if (this.props.onNextClick) {
      this.props.onNextClick(currentMonth)
    }
  }

  renderDay = (date: Date, modifiers: Modifiers) => {
    if (this.props.renderDay) {
      return this.props.renderDay(date, modifiers)
    }

    return <CalendarDay day={date.getDate()} {...modifiers} />
  }

  renderNavbar = (navbarProps: CalendarNavbarProps) => {
    return (
      <CalendarNavbar
        {...navbarProps}
        fromMonth={this.props.fromMonth}
        toMonth={this.props.toMonth}
        onPreviousClick={this.handlePreviousNavClick}
        onNextClick={this.handleNextNavClick}
      />
    )
  }

  renderCaption = ({ date }: { date: Date }) => {
    const monthsTranslations = getArrayOfTranslationsByKey('months') as any
    const { currentMonth, isMobile } = this.state
    const { numberOfMonths, fromMonth, toMonth } = this.props

    if (isMobile || !(fromMonth && toMonth)) {
      return (
        <div className={cn('caption')}>{`${
          monthsTranslations[date.getMonth()]
        } ${date.getFullYear()}`}</div>
      )
    }

    const captionIndex =
      date.getMonth() -
      currentMonth.getMonth() +
      12 * (date.getFullYear() - currentMonth.getFullYear())

    return (
      <CalendarCaption
        // NOTE: see CalendarCaption component to reveal captionIndex and numberOfMonths usage
        minDate={fromMonth}
        maxDate={toMonth}
        numberOfMonths={numberOfMonths || 1}
        captionIndex={captionIndex}
        date={date}
        onMonthChange={this.handleCaptionMonthChange}
      />
    )
  }

  render() {
    const monthsTranslations = getArrayOfTranslationsByKey('months') as any
    const weekdays = getArrayOfTranslationsByKey('weekdays') as any
    const weekdaysShort = getArrayOfTranslationsByKey('weekdaysShort') as any

    return (
      <div className="calendar-wrapper" onMouseLeave={this.handleMouseLeaveCalendar}>
        <DayPicker
          {...this.props}
          locale={this.props.i18n && this.props.i18n.language ? this.props.i18n.language : 'ru'}
          months={monthsTranslations}
          weekdaysLong={weekdays}
          weekdaysShort={weekdaysShort}
          firstDayOfWeek={getWeekFirstDay()}
          renderDay={this.renderDay}
          navbarElement={this.props.navbarElement || this.renderNavbar}
          captionElement={this.props.captionElement || this.renderCaption}
          numberOfMonths={this.props.numberOfMonths || 1}
          month={this.state.currentMonth}
          onDayClick={this.onDayClick}
          classNames={this.props.classNames || classNames}
          modifiers={{
            ...this.props.modifiers,
            estimated: this.estimated,
            bounded: this.bounded,
          }}
          onDayMouseEnter={this.onDayMouseEnter}
          onDayMouseLeave={this.onDayMouseLeave}
        />
      </div>
    )
  }
}

export default withTranslation()(Calendar)
