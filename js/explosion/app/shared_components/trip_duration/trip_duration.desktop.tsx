import React from 'react'
import { parse } from 'finity-js'
import { withTranslation, WithTranslation } from 'react-i18next'
import { TripDuration } from 'form/components/avia_form/avia_form.types'
import DateInput from 'shared_components/trip_duration/date_input/date_input'
import DropdownHeader from 'shared_components/trip_duration/dropdown_header/dropdown_header'
import DropdownTabs from 'shared_components/trip_duration/dropdown_tabs/dropdown_tabs'
import Calendar from 'shared_components/calendar/calendar'
import MonthPicker, {
  IMonthPickerWithFixedMonthsProps,
} from 'shared_components/month_picker/month_picker_with_fixed_months'
import TripDurationRangeSlider from 'shared_components/trip_duration/range_slider/trip_duration_range_slider' // tslint:disable-line
import Button from 'shared_components/button/button'
import { ButtonMod } from 'shared_components/button/button.types'
import Switcher from 'shared_components/switcher/switcher'
import {
  TripDurationInput,
  TripDurationValue,
  TripDurationTab,
  TripDurationRange,
  TripDurationMonths,
} from './trip_duration.types'
import { getCurrentTabByValue, isValidDate, months, formatMonthRange } from './trip_duration.utils'
import { TripDurationProps, cn } from './trip_duration'
import { formatDateToString } from 'shared_components/utils/datetime'
import flagr from 'common/utils/flagr_client_instance'

import './trip_duration.scss'

export type TripDurationDesktopProps = TripDurationProps

export interface TripDurationDesktopState {
  activeTab: TripDurationTab
  departureInputValue: TripDurationValue | string
  returnInputValue: TripDurationValue | string
  hoverDepartureInputValue: Date | undefined
  hoverReturnInputValue: Date | undefined
  returnInputProgress: boolean
  departureInputProgress: boolean
  currentCalendarMonth?: Date
}

type IGetStateFuncResult = Pick<TripDurationDesktopState, 'activeTab'>

class TripDurationDesktop extends React.PureComponent<
  TripDurationDesktopProps & WithTranslation,
  TripDurationDesktopState
> {
  static defaultProps = {
    departureValue: undefined,
    returnValue: undefined,
    rangeDaysDurationBoundaries: { min: 1, max: 30 },
    rangeDaysDurationMin: 5,
    rangeDaysDurationMax: 14,
  }

  state: TripDurationDesktopState = {
    activeTab: 'calendar',
    departureInputValue: this.props.departureValue,
    returnInputValue: this.props.returnValue,
    hoverDepartureInputValue: undefined,
    hoverReturnInputValue: undefined,
    departureInputProgress: false,
    returnInputProgress: false,
  }

  private departureInputRef: HTMLInputElement
  private returnInputRef: HTMLInputElement
  private dropdownRef: React.RefObject<HTMLDivElement> = React.createRef<HTMLDivElement>()
  private containerRef: React.RefObject<HTMLDivElement> = React.createRef<HTMLDivElement>()
  private activeInputBackup: TripDurationInput | undefined

  componentDidMount() {
    document.addEventListener('mousedown', this.handleOuterClick, { capture: true })
    if (this.props.onComponentDidMount) {
      this.props.onComponentDidMount(this.dropdownRef)
    }
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleOuterClick)
  }

  componentDidUpdate(
    prevProps: TripDurationDesktopProps & WithTranslation,
    prevState: TripDurationDesktopState,
  ): void {
    const { activeInput: prevActiveInput } = prevProps
    const { activeInput: currentActiveInput } = this.props

    if (currentActiveInput !== prevActiveInput) {
      //     if (currentActiveInput === 'departure') {
      //       this.departureInputRef.focus()
      //     }

      //     if (currentActiveInput === 'return') {
      //       this.returnInputRef.focus()
      //     }

      if (!currentActiveInput) {
        //     if (prevActiveInput === 'departure') {
        //       this.departureInputRef.blur()
        //     }

        //     if (prevActiveInput === 'return') {
        //       this.returnInputRef.blur()
        //     }

        this.activeInputBackup = undefined
        this.setState({ currentCalendarMonth: undefined })
      }
    }
  }

  // Helpers

  setDepartureInputRef = (el: HTMLInputElement) => (this.departureInputRef = el)

  setReturnInputRef = (el: HTMLInputElement) => (this.returnInputRef = el)

  getDisabledState = (): IGetStateFuncResult => {
    return {
      activeTab: 'calendar',
    }
  }

  getActiveDepartureState = (): IGetStateFuncResult => {
    const { departureValue } = this.props

    return {
      activeTab: getCurrentTabByValue(departureValue) || 'calendar',
    }
  }

  getActiveReturnState = (): IGetStateFuncResult => {
    const { departureValue, returnValue } = this.props

    const neededActiveTab =
      departureValue && getCurrentTabByValue(departureValue) === 'months'
        ? 'range-slider'
        : getCurrentTabByValue(returnValue) || 'calendar'

    return {
      activeTab: neededActiveTab,
    }
  }

  getValueByActiveInput() {
    const { activeInput } = this.props

    if (activeInput === 'departure') {
      return this.props.departureValue
    }
    if (activeInput === 'return') {
      return this.props.returnValue
    }
  }

  formatInputValue = (value?: TripDurationValue): string => {
    if (this.props.formatInputValue) {
      return this.props.formatInputValue(value)
    }

    if (!value) {
      return ''
    }

    const currentTab = getCurrentTabByValue(value)

    if (currentTab === 'calendar') {
      const pattern = !!this.props.activeInput ? 'DD.MM.YYYY' : 'D MMMM, ddd'
      return formatDateToString(value as Date, pattern)
    }

    if (currentTab === 'range-slider') {
      return this.props.t('trip_duration:range.both', {
        from: (value as TripDurationRange).min,
        to: (value as TripDurationRange).max,
      })
    }

    if (currentTab === 'months') {
      return formatMonthRange(value as TripDurationMonths)
    }

    return ''
  }

  handleActiveInputChanged = (
    activeInput?: TripDurationInput,
    shouldBackupActiveInput: boolean = false,
  ) => {
    if (shouldBackupActiveInput) {
      this.activeInputBackup = activeInput
    }

    if (this.props.onActiveInputChanged) {
      const { departureValue, fromMonth } = this.props

      const currentDepartureValue =
        departureValue && getCurrentTabByValue(departureValue) === 'calendar'
          ? departureValue
          : undefined

      const currentMonth = this.state.currentCalendarMonth
        ? this.state.currentCalendarMonth
        : currentDepartureValue || fromMonth

      if (this.props.activeInput !== activeInput) {
        this.props.onActiveInputChanged(
          activeInput,
          this.state.activeTab === 'calendar' ? (currentMonth as Date) : undefined,
        )
      }
    }
  }

  // Departure input handlers

  handleDepartureInputClick = () => {
    this.handleActiveInputChanged('departure', true)
    this.setState({
      ...this.getActiveDepartureState(),
      hoverDepartureInputValue: undefined,
    })
  }

  handleDepartureInputBlur = () => {
    this.setState({ departureInputProgress: false })
  }

  // NOTE: feature for future
  handleDepartureInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ departureInputValue: e.target.value, departureInputProgress: true })
  }

  // NOTE: feature for future
  handleDepartureInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const { departureInputValue, returnInputValue } = this.state
    const { fromMonth, toMonth } = this.props
    const isHandledKey = e.key === 'Enter' || e.key === 'Tab'

    if (isHandledKey && typeof departureInputValue === 'string') {
      e.preventDefault()

      try {
        // const pattern = !!activeInput ? 'DD.MM.YYYY' : 'DD MMMM'
        const pattern = 'DD.MM.YYYY'
        const date = parse(departureInputValue, pattern)

        if (isValidDate(date, fromMonth, toMonth) && !returnInputValue) {
          this.handleActiveInputChanged('return')
          this.setState({
            departureInputValue: date,
            departureInputProgress: false,
          })
          this.props.onDepartureDateSelect(date)
        } else if (
          isValidDate(date, fromMonth, toMonth) &&
          returnInputValue &&
          returnInputValue < date
        ) {
          this.handleActiveInputChanged('return')
          this.setState({
            departureInputValue: date,
            returnInputValue: undefined,
            departureInputProgress: false,
          })
          this.props.onDepartureDateSelect(date)
          this.props.onReturnDateSelect()
        } else {
          this.setState({
            departureInputValue: undefined,
            departureInputProgress: false,
          })
        }
      } catch {
        this.setState({
          departureInputValue: undefined,
          departureInputProgress: false,
        })
      }
    }

    if (isHandledKey && !departureInputValue) {
      e.preventDefault()
      this.setState(this.getDisabledState())
    }
  }

  renderDepartureInput = (createRefFunc: (el: HTMLInputElement) => HTMLInputElement) => {
    const { departureInputValue, departureInputProgress, hoverDepartureInputValue } = this.state
    const { departureValue, errors, departurePlaceholder, testIds } = this.props

    const hoverValue = hoverDepartureInputValue
      ? this.formatInputValue(hoverDepartureInputValue)
      : null
    const currentValue = departureInputProgress ? departureInputValue : departureValue
    const preparedValue =
      typeof currentValue === 'string' ? currentValue : this.formatInputValue(currentValue)

    return (
      <DateInput
        type="departure"
        value={hoverValue || preparedValue}
        active={this.props.activeInput === 'departure'}
        readonly={true}
        placeholder={departurePlaceholder}
        onClick={this.handleDepartureInputClick}
        onBlur={this.handleDepartureInputBlur}
        error={errors && errors.departure}
        ref={createRefFunc}
        testId={testIds && testIds.departure}
      />
    )
  }

  // Return input handlers

  handleReturnInputClick = () => {
    this.handleActiveInputChanged('return', true)
    this.setState({
      ...this.getActiveReturnState(),
      hoverReturnInputValue: undefined,
    })
  }

  handleReturnInputBlur = () => {
    this.setState({ returnInputProgress: false })
  }

  // NOTE: feature for future
  handleReturnInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ returnInputValue: e.target.value, returnInputProgress: true })
  }

  // NOTE: feature for future
  handleReturnInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const { returnInputValue, departureInputValue } = this.state
    const { fromMonth, toMonth } = this.props
    const isHandledKey = e.key === 'Enter' || e.key === 'Tab'

    if (isHandledKey && typeof returnInputValue === 'string') {
      e.preventDefault()

      try {
        // const pattern = !!activeInput ? 'DD.MM.YYYY' : 'DD MMMM'
        const pattern = 'DD.MM.YYYY'
        const date = parse(returnInputValue, pattern)

        if (
          (!departureInputValue && isValidDate(date, fromMonth, toMonth)) ||
          (departureInputValue && departureInputValue < date)
        ) {
          const possibleFields = departureInputValue ? this.getDisabledState() : {}

          if (departureInputValue) {
            this.handleActiveInputChanged('departure')
          }

          this.setState({
            ...possibleFields,
            returnInputValue: date,
            returnInputProgress: false,
          })

          this.props.onReturnDateSelect(date)
        } else {
          this.setState({
            returnInputValue: undefined,
            returnInputProgress: false,
          })
        }
      } catch {
        this.setState({
          returnInputValue: undefined,
          returnInputProgress: false,
        })
      }
    }

    if (isHandledKey && !returnInputValue) {
      e.preventDefault()
      this.setState(this.getDisabledState())
    }
  }

  handleReturnResetClick = () => {
    this.handleActiveInputChanged()
    this.setState({
      ...this.getDisabledState(),
      returnInputValue: undefined,
      hoverReturnInputValue: undefined,
    })

    if (this.props.onReturnResetClick) {
      this.props.onReturnResetClick()
    }
  }

  renderReturnInput(createRefFunc: (el: HTMLInputElement) => HTMLInputElement) {
    const { returnInputValue, returnInputProgress, hoverReturnInputValue } = this.state
    const { returnValue, errors, returnPlaceholder, testIds } = this.props

    const hoverValue = hoverReturnInputValue ? this.formatInputValue(hoverReturnInputValue) : null
    const currentValue = returnInputProgress ? returnInputValue : returnValue
    const preparedValue =
      typeof currentValue === 'string' ? currentValue : this.formatInputValue(currentValue)

    return (
      <DateInput
        type="return"
        value={hoverValue || preparedValue}
        active={this.props.activeInput === 'return'}
        readonly={true}
        placeholder={returnPlaceholder}
        onClick={this.handleReturnInputClick}
        onBlur={this.handleReturnInputBlur}
        onClear={this.handleReturnResetClick}
        required={this.props.returnDateIsRequired}
        ref={createRefFunc}
        error={errors && errors.return}
        testId={testIds && testIds.return}
      />
    )
  }

  // Calendar methods
  handleOnDayClick = (date: Date) => {
    const { onDepartureDateSelect, onReturnDateSelect, returnValue, activeInput } = this.props
    const { departureInputValue, hoverReturnInputValue } = this.state

    if (activeInput === 'departure') {
      onDepartureDateSelect(date)

      // NOTE: Clear returnValue if current departure value is later
      if (returnValue && date > returnValue) {
        // HACK OR FEATURE?: waiting for update of segments in store
        setTimeout(() => onReturnDateSelect(), 0)
      }

      // NOTE: Update after swap values on hover
      if (hoverReturnInputValue) {
        // HACK OR FEATURE?: waiting for update of segments in store
        setTimeout(() => onReturnDateSelect(hoverReturnInputValue), 0)

        this.handleActiveInputChanged()
        this.setState({
          ...this.getDisabledState(),
          departureInputValue: date,
          returnInputValue: hoverReturnInputValue,
          hoverDepartureInputValue: undefined,
          hoverReturnInputValue: undefined,
        })
      } else {
        this.handleActiveInputChanged('return', true)
        this.setState({
          activeTab: 'calendar',
          departureInputValue: date,
          hoverDepartureInputValue: undefined,
          hoverReturnInputValue: undefined,
          returnInputValue: undefined,
        })
      }
    }

    if (activeInput === 'return') {
      const possibleFields = departureInputValue ? this.getDisabledState() : {}

      if (departureInputValue) {
        this.handleActiveInputChanged()
      }

      this.setState({
        ...possibleFields,
        returnInputValue: date,
        hoverDepartureInputValue: undefined,
        hoverReturnInputValue: undefined,
      })
      onReturnDateSelect(date)
    }
  }

  handleDayMouseEnter = (date: Date) => {
    const { hoverReturnInputValue } = this.state
    const { departureValue, returnValue, activeInput } = this.props

    if (activeInput === 'departure') {
      // NOTE: handle and swap values
      if (
        hoverReturnInputValue &&
        (hoverReturnInputValue < date ||
          (departureValue instanceof Date &&
            departureValue <= date &&
            departureValue < hoverReturnInputValue))
      ) {
        this.handleActiveInputChanged('return')
        this.setState({
          hoverDepartureInputValue: departureValue as Date,
          hoverReturnInputValue: date,
        })
      } else {
        this.setState({
          hoverDepartureInputValue: date,
        })
      }
    }

    if (activeInput === 'return') {
      // NOTE: handle and swap values
      if (departureValue instanceof Date && departureValue > date) {
        this.handleActiveInputChanged('departure')
        this.setState({
          hoverReturnInputValue: returnValue instanceof Date ? returnValue : departureValue,
          hoverDepartureInputValue: date,
        })
      } else {
        this.setState({
          hoverReturnInputValue: date,
        })
      }
    }
  }

  handleMouseLeaveCalendar = () => {
    if (this.activeInputBackup) {
      this.handleActiveInputChanged(this.activeInputBackup)
    }

    this.setState({
      hoverDepartureInputValue: undefined,
      hoverReturnInputValue: undefined,
    })
  }

  handleMonthChange = (month: Date) => {
    if (this.props.onMonthChange) {
      this.props.onMonthChange(month, undefined)
    }
  }

  handlePrevMonthClick = (month: Date) => {
    if (this.props.onMonthChange) {
      this.props.onMonthChange(month, 'prev')
    }
  }

  handleNextMonthClick = (month: Date) => {
    if (this.props.onMonthChange) {
      this.props.onMonthChange(month, 'next')
    }
  }

  setCurrentCalendarMonth = (month: Date) => {
    this.setState({ currentCalendarMonth: month })
  }

  getCalendar() {
    const {
      departureValue,
      returnValue,
      fromMonth,
      toMonth,
      showPriceSwitcher,
      activeInput,
    } = this.props
    const { activeTab, hoverDepartureInputValue, hoverReturnInputValue } = this.state

    const currentDepartureValue =
      departureValue && getCurrentTabByValue(departureValue) === 'calendar'
        ? departureValue
        : undefined

    const currentReturnValue =
      returnValue && getCurrentTabByValue(returnValue) === 'calendar' ? returnValue : undefined

    let selectedDays
    let estimatedValue

    if (activeTab === 'calendar') {
      if (currentDepartureValue) {
        selectedDays = {
          from: currentDepartureValue,
          to: currentReturnValue || currentDepartureValue,
        }
      } else if (currentReturnValue) {
        selectedDays = {
          from: currentReturnValue,
          to: currentReturnValue,
        }
      }

      if (currentDepartureValue && activeInput === 'return') {
        estimatedValue = hoverDepartureInputValue || currentDepartureValue
      }

      if (activeInput === 'departure') {
        if (hoverDepartureInputValue && currentReturnValue) {
          if (hoverReturnInputValue) {
            estimatedValue = hoverReturnInputValue
          } else {
            estimatedValue =
              currentReturnValue < hoverDepartureInputValue ? undefined : currentReturnValue
          }
        } else {
          estimatedValue = hoverReturnInputValue || currentReturnValue
        }
      }
    }

    const currentMonth = this.state.currentCalendarMonth
      ? this.state.currentCalendarMonth
      : currentDepartureValue || fromMonth

    return (
      <div className={cn('calendar-wrapper')} onMouseLeave={this.handleMouseLeaveCalendar}>
        <Calendar
          fromMonth={fromMonth}
          toMonth={toMonth}
          currentMonth={currentMonth as Date | undefined}
          onDayClick={this.handleOnDayClick}
          numberOfMonths={2}
          estimated={estimatedValue}
          selectedDays={selectedDays}
          onDayMouseEnter={this.handleDayMouseEnter}
          onMonthChange={this.handleMonthChange}
          onNextClick={this.handleNextMonthClick}
          onPreviousClick={this.handlePrevMonthClick}
          onCurrentMonthChanged={this.setCurrentCalendarMonth}
          disabledDays={{
            before: fromMonth,
            after: toMonth,
          }}
          renderDay={this.props.renderCalendarDay}
        />
        {/* {showPriceSwitcher && flagr.is('avs-feat-showCalendarPriceSwitcher') ? (
          <div className={cn('calendar-price-switcher')}>{this.renderPriceSwitcher()}</div>
        ) : null} */}
      </div>
    )
  }

  // Price switcher methods

  handlePriceSwitcherChange = (checked: boolean) => {
    if (this.props.onPriceSwitcherChange) {
      this.props.onPriceSwitcherChange(
        checked,
        this.state.activeTab,
        this.state.currentCalendarMonth,
      )
    }
  }

  renderPriceSwitcher = () => {
    return (
      <Switcher
        onChange={this.handlePriceSwitcherChange}
        label={this.props.t('trip_duration:priceSwitcher')}
        checked={this.props.priceSwitcherChecked}
      />
    )
  }

  // Monthpicker methods

  handleMonthSelect = (arrMonths: TripDurationMonths) => {
    const { onDepartureDateSelect, onReturnDateSelect } = this.props

    if (arrMonths.length >= 1) {
      const { returnValue } = this.props
      const returnValueIsRange = getCurrentTabByValue(returnValue) === 'range-slider'

      if (returnValue && !returnValueIsRange) {
        // HACK OR FEATURE?: waiting for update of segments in store
        setTimeout(() => onReturnDateSelect(), 0)
      }

      onDepartureDateSelect(arrMonths)

      this.setState({
        departureInputValue: arrMonths,
        returnInputValue: returnValueIsRange ? returnValue : undefined,
      })
    } else {
      onDepartureDateSelect()
      this.setState({ departureInputValue: undefined })
    }
  }

  handleMonthsConfirm = () => {
    const { returnValue, onMonthsConfirmClick } = this.props
    const { departureInputValue, activeTab } = this.state

    if (onMonthsConfirmClick) {
      onMonthsConfirmClick()
    }

    if (returnValue && getCurrentTabByValue(returnValue) !== 'range-slider') {
      this.props.onReturnDateSelect()
    }

    if (departureInputValue && activeTab === 'months') {
      this.handleActiveInputChanged('return')
      this.setState({
        activeTab: 'range-slider',
      })
    } else {
      this.setState(this.getDisabledState())
    }
  }

  handleMonthsMount = () => {
    if (this.props.onMonthsMount) {
      this.props.onMonthsMount()
    }
  }

  getMonthPicker() {
    const { t, showPriceSwitcher } = this.props
    const value = this.getValueByActiveInput() as IMonthPickerWithFixedMonthsProps['value'] // ???
    const isMonths = getCurrentTabByValue(value) === 'months'

    return (
      <>
        <MonthPicker
          value={isMonths ? value : []}
          initialMonths={months}
          onSelect={this.handleMonthSelect}
          onToggleAllClick={this.handleMonthSelect}
          onComponentDidMount={this.handleMonthsMount}
          getItemChild={this.props.renderMonthPrice}
        />
        {showPriceSwitcher && (
          <div className={cn('months-price-switcher')}>{this.renderPriceSwitcher()}</div>
        )}
        <Button
          className={cn('months-confirm')}
          mod={ButtonMod.Secondary}
          onClick={this.handleMonthsConfirm}
        >
          {t('trip_duration:ready')}
        </Button>
      </>
    )
  }

  // Range slider methods

  handleRangeSliderChange = (value: number[]) => {
    const tripDuration = new TripDuration(value[0], value[1])
    this.props.onReturnDateSelect(tripDuration)
    this.setState({ returnInputValue: tripDuration })
  }

  handleRangeSliderConfirm = () => {
    const { returnInputValue } = this.state
    const { onReturnDateSelect, rangeDaysDurationMax, rangeDaysDurationMin } = this.props

    if (!returnInputValue && rangeDaysDurationMin && rangeDaysDurationMax) {
      const tripDuration = new TripDuration(rangeDaysDurationMin, rangeDaysDurationMax)
      onReturnDateSelect(tripDuration)
    }

    this.close()
  }

  getRangeSlider() {
    const {
      rangeDaysDurationBoundaries,
      rangeDaysDurationMin,
      rangeDaysDurationMax,
      clearBtnText,
    } = this.props
    const data = this.getValueByActiveInput()

    return (
      <TripDurationRangeSlider
        clearBtnText={clearBtnText}
        minValue={data && data[0] ? data[0] : rangeDaysDurationMin}
        maxValue={data && data[1] ? data[1] : rangeDaysDurationMax}
        range={rangeDaysDurationBoundaries!}
        onChange={this.handleRangeSliderChange}
        onCancelClick={this.handleWithoutReturnClick}
        onConfirmClick={this.handleRangeSliderConfirm}
      />
    )
  }

  // other handlers

  handleTabChage = (tab: TripDurationTab) => {
    this.setState({
      activeTab: tab,
    })

    if (this.props.onTabChange) {
      this.props.onTabChange(tab)
    }
  }

  handleWithoutReturnClick = () => {
    this.handleActiveInputChanged()
    this.setState(this.getDisabledState())

    if (this.props.onWithoutReturnClick) {
      this.props.onWithoutReturnClick()
    }
  }

  close = () => {
    this.handleActiveInputChanged()
    // reset after close
    setTimeout(() => {
      this.setState({
        ...this.getDisabledState(),
        hoverDepartureInputValue: undefined,
        hoverReturnInputValue: undefined,
      })
    }, 10)
  }

  handleOuterClick = (e: MouseEvent) => {
    if (
      !!this.props.activeInput &&
      this.containerRef.current &&
      !this.containerRef.current.contains(e.target as Node)
    ) {
      setTimeout(() => {
        this.close()
      })
    }
  }

  render() {
    const { activeTab } = this.state
    const {
      returnDateIsRequired,
      dropdownHeaderTitle,
      clearBtnText,
      className,
      activeInput,
    } = this.props
    const availableTabs = activeInput
      ? activeInput === 'departure'
        ? this.props.departureTabs
        : this.props.returnTabs
      : []

    return (
      <div className={cn(null, className)} ref={this.containerRef}>
        {this.renderDepartureInput(this.setDepartureInputRef)}
        {this.renderReturnInput(this.setReturnInputRef)}
        <div
          className={cn('dropdown', {
            '--with-tabs': availableTabs.length > 1,
          })}
          ref={this.dropdownRef}
        >
          {!!activeInput && (
            <div className={cn('wrap')}>
              {availableTabs.length > 1 && (
                <DropdownTabs
                  tabs={availableTabs}
                  currentTab={activeTab}
                  onTabClick={this.handleTabChage}
                />
              )}
              <div className={cn('content')}>
                {activeTab === 'calendar' && (
                  <DropdownHeader
                    title={dropdownHeaderTitle}
                    clearBtnText={returnDateIsRequired ? undefined : clearBtnText}
                    onCancelClick={this.handleWithoutReturnClick}
                    isClearbBtnDisabled={
                      activeInput === 'departure' &&
                      !this.props.departureValue &&
                      !this.props.returnValue
                    }
                  />
                )}
                <div className={cn('content-body', `--${activeTab}`)}>
                  {activeTab !== 'range-slider' && (
                    <div
                      className={cn('loader', {
                        'is-animation-started': true,
                        'is-animation-ended': !this.props.isLoading,
                      })}
                    />
                  )}
                  {activeTab === 'calendar' && this.getCalendar()}
                  {activeTab === 'months' && this.getMonthPicker()}
                  {activeTab === 'range-slider' && this.getRangeSlider()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }
}

export default withTranslation('trip_duration')(TripDurationDesktop)
