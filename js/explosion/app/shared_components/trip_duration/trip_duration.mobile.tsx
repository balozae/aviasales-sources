import React from 'react'
import { withTranslation, WithTranslation } from 'react-i18next'
import { getDatesMonthRange } from 'finity-js'
import { MediaQueryTypes } from 'shared_components/resizer'
import { formatDateToString } from 'shared_components/utils/datetime'
import Calendar from 'shared_components/calendar/calendar'
import Button from 'shared_components/button/button'
import { ButtonMod } from 'shared_components/button/button.types'
import Modal from 'shared_components/modal/modal'
import DateInput from 'shared_components/trip_duration/date_input/date_input'
import DropdownHeader from 'shared_components/trip_duration/dropdown_header/dropdown_header'
import { TripDurationProps, cn } from './trip_duration'
import { TripDurationInput, TripDurationValue } from './trip_duration.types'
const IconClose = require('!!react-svg-loader!common/images/icon-close.svg')
import 'shared_components/polyfills/smoothscroll.polyfill'

import './trip_duration.scss'

export type TripDurationMobileProps = Pick<
  TripDurationProps,
  | 'onActiveInputChanged'
  | 'onDepartureDateSelect'
  | 'onReturnDateSelect'
  | 'onReturnResetClick'
  | 'onWithoutReturnClick'
  | 'onMonthChange'
  | 'formatInputValue'
  | 'fromMonth'
  | 'toMonth'
  | 'departureValue'
  | 'returnValue'
  | 'returnDateIsRequired'
  | 'errors'
  | 'departurePlaceholder'
  | 'returnPlaceholder'
  | 'modalTitle'
  | 'renderCalendarDay'
  | 'dropdownHeaderTitle'
  | 'clearBtnText'
  | 'clearBtnTextShort'
  | 'className'
  | 'isLoading'
  | 'activeInput'
> & {
  mediaQueryType: MediaQueryTypes
}

const noop = () => null

interface TripDurationMobileState {
  activeInput?: TripDurationInput
  currentCalendarMonth?: Date
}

class TripDurationMobile extends React.PureComponent<
  TripDurationMobileProps & WithTranslation,
  TripDurationMobileState
> {
  static defaultProps = {
    departureValue: undefined,
    returnValue: undefined,
  }

  state = {
    currentCalendarMonth: this.props.mediaQueryType === 'tablet' ? undefined : this.props.fromMonth,
  }

  private departureInputRef: HTMLInputElement
  private returnInputRef: HTMLInputElement
  private modalDepartureInputRef: HTMLInputElement
  private modalReturnInputRef: HTMLInputElement
  private modalRef: React.RefObject<HTMLDivElement>
  private containerRef: React.RefObject<HTMLDivElement> = React.createRef<HTMLDivElement>()

  setDepartureInputRef = (el: HTMLInputElement) => (this.departureInputRef = el)
  setReturnInputRef = (el: HTMLInputElement) => (this.returnInputRef = el)
  setModalDepartureInputRef = (el: HTMLInputElement) => (this.modalDepartureInputRef = el)
  setModalReturnInputRef = (el: HTMLInputElement) => (this.modalReturnInputRef = el)

  componentDidMount() {
    if (this.props.mediaQueryType === 'tablet') {
      document.addEventListener('mousedown', this.handleOuterClick, { capture: true })
    }
  }

  componentWillUnmount() {
    if (this.props.mediaQueryType === 'tablet') {
      document.removeEventListener('mousedown', this.handleOuterClick)
    }
  }

  componentDidUpdate(_, prevState: TripDurationMobileState) {
    if (!this.props.activeInput && this.props.mediaQueryType === 'tablet') {
      this.setCurrentCalendarMonth()
    }
  }

  handleActiveInputChanged = (activeInput?: TripDurationInput) => {
    if (this.props.onActiveInputChanged) {
      if (this.props.mediaQueryType === 'tablet') {
        this.props.onActiveInputChanged(
          activeInput,
          this.state.currentCalendarMonth || this.props.fromMonth,
        )
      } else {
        this.props.onActiveInputChanged(activeInput, this.props.fromMonth)
      }
    }
  }

  setCurrentCalendarMonth = (month?: Date) => {
    this.setState({ currentCalendarMonth: month })
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

  formatInputValue = (value?: TripDurationValue): string => {
    if (this.props.formatInputValue) {
      return this.props.formatInputValue(value)
    }

    if (!value) {
      return ''
    }

    const pattern = !!this.props.activeInput ? 'DD.MM.YYYY' : 'D MMMM, ddd'
    return formatDateToString(value as Date, pattern)
  }

  close = () => this.handleActiveInputChanged()

  handleModalOnEntered = (modalRef: React.RefObject<HTMLDivElement>) => {
    this.modalRef = modalRef
    this.scrollToMonth()
  }

  scrollToMonth = () => {
    const { departureValue, returnValue, activeInput } = this.props
    const { modalRef } = this

    if (!modalRef.current || (!departureValue && !returnValue)) {
      return
    }

    let month = departureValue as Date

    if (
      (activeInput === 'departure' && !departureValue && returnValue) ||
      (activeInput === 'return' && returnValue)
    ) {
      month = returnValue as Date
    }

    const monthIndex = getDatesMonthRange(this.props.fromMonth, month).length - 1
    const monthElement = modalRef.current.querySelectorAll<HTMLDivElement>('.calendar__month')[
      monthIndex
    ]
    if (monthElement) {
      const monthOffset = monthElement.offsetTop

      modalRef.current.scrollTo({ top: monthOffset, behavior: 'smooth' })
    }
  }

  handleDepartureInputClick = () => this.handleActiveInputChanged('departure')

  handleReturnInputClick = () => this.handleActiveInputChanged('return')

  handleWithoutReturnClick = () => {
    this.close()

    if (this.props.onWithoutReturnClick) {
      this.props.onWithoutReturnClick()
    }
  }

  handleOnDayClick = (date: Date) => {
    const {
      onDepartureDateSelect,
      onReturnDateSelect,
      departureValue,
      returnValue,
      activeInput,
    } = this.props

    if (activeInput === 'departure') {
      onDepartureDateSelect(date)

      if (returnValue) {
        if (date > returnValue) {
          // HACK OR FEATURE?: waiting for update of segments in store
          setTimeout(() => onReturnDateSelect(), 0)
        } else {
          return this.close()
        }
      }

      this.handleActiveInputChanged('return')
    }

    if (activeInput === 'return') {
      onReturnDateSelect(date)

      if (!departureValue) {
        return this.handleActiveInputChanged('departure')
      }

      if (date < departureValue) {
        // HACK OR FEATURE?: waiting for update of segments in store
        setTimeout(() => onDepartureDateSelect(), 0)
        return this.handleActiveInputChanged('departure')
      }

      this.close()
    }
  }

  handleMonthChange = (month: Date) => {
    if (this.props.onMonthChange) {
      this.props.onMonthChange(month)
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

  renderDepartureInput = (createRefFunc: (el: HTMLInputElement) => HTMLInputElement) => {
    const { departureValue, errors, departurePlaceholder, activeInput } = this.props

    const currentValue = this.formatInputValue(departureValue)

    return (
      <DateInput
        type="departure"
        active={activeInput === 'departure'}
        value={currentValue}
        readonly={true}
        placeholder={departurePlaceholder}
        onClick={this.handleDepartureInputClick}
        error={errors && errors.departure}
        ref={createRefFunc}
      />
    )
  }

  renderReturnInput = (
    createRefFunc: (el: HTMLInputElement) => HTMLInputElement,
    withClear: boolean = true,
  ) => {
    const { returnValue, errors, returnPlaceholder, activeInput } = this.props

    const currentValue = this.formatInputValue(returnValue)

    return (
      <DateInput
        type="return"
        active={activeInput === 'return'}
        value={currentValue}
        readonly={true}
        placeholder={returnPlaceholder}
        onClick={this.handleReturnInputClick}
        onClear={withClear ? this.props.onReturnResetClick : undefined}
        error={errors && errors.return}
        ref={createRefFunc}
      />
    )
  }

  renderModalHeader() {
    const { modalTitle } = this.props

    return (
      <>
        <div className={cn('modal-header')}>
          <h3 className={cn('modal-title')}>{modalTitle}</h3>
          <button className={cn('modal-close')} onClick={this.close}>
            <IconClose className={cn('modal-close-icon')} />
          </button>
        </div>
        <div className={cn('modal-fields')}>
          {this.renderDepartureInput(this.setModalDepartureInputRef)}
          {this.renderReturnInput(this.setModalReturnInputRef, false)}
        </div>
        <div className={cn('modal-loader')}>{this.renderLoader()}</div>
      </>
    )
  }

  renderModalFooter() {
    const { t, clearBtnText, returnDateIsRequired } = this.props

    return (
      <div className={cn('modal-footer')}>
        {/* {returnValue && (
          <Button className={cn('modal-footer-btn')} mod={ButtonMod.Secondary} onClick={this.close}>
            {t('trip_duration:ready')}
          </Button>
        )} */}
        {!returnDateIsRequired && clearBtnText ? (
          <Button
            className={cn('modal-footer-btn')}
            mod={ButtonMod.PrimaryOutline}
            onClick={this.handleWithoutReturnClick}
          >
            {clearBtnText}
          </Button>
        ) : null}
      </div>
    )
  }

  renderLoader() {
    return (
      <div
        className={cn('loader', {
          'is-animation-started': true,
          'is-animation-ended': !this.props.isLoading,
        })}
      />
    )
  }

  renderContent() {
    const {
      departureValue,
      returnValue,
      fromMonth,
      toMonth,
      mediaQueryType,
      dropdownHeaderTitle,
      returnDateIsRequired,
      clearBtnText,
      activeInput,
    } = this.props

    let selectedDays

    if (departureValue) {
      selectedDays = {
        from: departureValue,
        to: returnValue || departureValue,
      }
    } else if (returnValue) {
      selectedDays = {
        from: returnValue,
        to: returnValue,
      }
    }

    let currentMonth = fromMonth

    if (mediaQueryType === 'tablet') {
      currentMonth = this.state.currentCalendarMonth
        ? this.state.currentCalendarMonth
        : (departureValue as Date) || fromMonth
    }

    return (
      <div className={cn('wrap')}>
        <div className={cn('content')}>
          {mediaQueryType === 'tablet' && (
            <DropdownHeader
              title={dropdownHeaderTitle}
              onCancelClick={this.handleWithoutReturnClick}
              clearBtnText={returnDateIsRequired ? undefined : clearBtnText}
              isClearbBtnDisabled={
                activeInput === 'departure' && !this.props.departureValue && !this.props.returnValue
              }
            />
          )}
          <div className={cn('content-body', `--calendar`)}>
            {mediaQueryType === 'tablet' && this.renderLoader()}
            <div className={cn('calendar-wrapper')}>
              <Calendar
                fromMonth={fromMonth}
                toMonth={toMonth}
                currentMonth={currentMonth}
                onDayClick={this.handleOnDayClick}
                onMonthChange={this.handleMonthChange}
                onNextClick={this.handleNextMonthClick}
                onPreviousClick={this.handlePrevMonthClick}
                onCurrentMonthChanged={this.setCurrentCalendarMonth}
                numberOfMonths={mediaQueryType === 'tablet' ? 2 : 13}
                selectedDays={selectedDays}
                navbarElement={mediaQueryType === 'tablet' ? undefined : noop}
                disabledDays={{ before: fromMonth, after: toMonth }}
                renderDay={this.props.renderCalendarDay || undefined}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  render() {
    const { mediaQueryType, className } = this.props
    const visible = !!this.props.activeInput
    const dropdownClassName = cn('dropdown')

    return (
      <div className={cn(null, className)} ref={this.containerRef}>
        {this.renderDepartureInput(this.setDepartureInputRef)}
        {this.renderReturnInput(this.setReturnInputRef)}
        {mediaQueryType === 'tablet' ? (
          <div className={dropdownClassName}>{visible && this.renderContent()}</div>
        ) : (
          <Modal
            animationType="right"
            className={dropdownClassName}
            visible={visible}
            header={this.renderModalHeader()}
            footer={this.props.activeInput === 'return' && this.renderModalFooter()}
            onEntered={this.handleModalOnEntered}
          >
            {this.renderContent()}
          </Modal>
        )}
      </div>
    )
  }
}

export default withTranslation('trip_duration')(TripDurationMobile)
