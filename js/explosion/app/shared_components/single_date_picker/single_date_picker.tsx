import React from 'react'
import clssnms from 'clssnms'
import { getDatesMonthRange } from 'finity-js'
import Modal from 'shared_components/modal/modal'
import Calendar, { ICalendarProps } from 'shared_components/calendar/calendar'
import defaultResizer, { MediaQueryTypes } from 'shared_components/resizer'
import DateInput from 'shared_components/trip_duration/date_input/date_input'
import 'shared_components/polyfills/smoothscroll.polyfill'
const IconClose = require('!!react-svg-loader!common/images/icon-close.svg')

import 'shared_components/trip_duration/trip_duration.scss'

const cn = clssnms('trip-duration')

const mediaQueryModesMapping = {
  mobile: MediaQueryTypes.Mobile,
  mobileLandscape: MediaQueryTypes.Mobile,
  tablet: MediaQueryTypes.Desktop,
  desktop: MediaQueryTypes.Desktop,
}

export interface ISingleDatePickerProps extends ICalendarProps {
  value?: Date
  fromMonth: Date
  toMonth: Date
  inputValue?: string
  onChange?: (e: React.SyntheticEvent) => void
  onSelect?: (date: Date) => void
  inputPlaceholder?: string
  className?: string
  onClose?: () => void
  onInputClick?: () => void
  isInputActive: boolean
  error?: { message: string }
}

interface ISingleDatePickerState {
  mediaQueryType: MediaQueryTypes
}

/**
 * Controlled
 */
class SingleDatePicker extends React.PureComponent<ISingleDatePickerProps, ISingleDatePickerState> {
  state = {
    mediaQueryType: mediaQueryModesMapping[defaultResizer.currentMode() || MediaQueryTypes.Desktop],
  }

  mediaQueryModes: string = 'mobile, tablet, desktop'

  private parentRef: HTMLInputElement
  private modalWrapRef: HTMLInputElement
  private inputRef: HTMLInputElement
  private modalInputRef: HTMLInputElement

  setInputRef = (el: HTMLInputElement) => (this.inputRef = el)
  setModalInputRef = (el: HTMLInputElement) => (this.modalInputRef = el)

  handleMediaQueryTypeChange = (meadiaQueryKey: string) => {
    this.setState({ mediaQueryType: mediaQueryModesMapping[meadiaQueryKey] })
  }

  componentDidMount() {
    defaultResizer.onMode(this.mediaQueryModes, this.handleMediaQueryTypeChange)
    document.addEventListener('mousedown', this.handleOuterClick, true)
  }

  componentWillUnmount() {
    defaultResizer.offMode(this.mediaQueryModes, this.handleMediaQueryTypeChange)
    document.removeEventListener('mousedown', this.handleOuterClick, true)
  }

  handleModalOnEntered = (modalRef: React.RefObject<HTMLDivElement>) => {
    this.modalInputRef.focus()
    this.scrollToMonth(modalRef)
  }

  scrollToMonth = (modalRef: React.RefObject<HTMLDivElement>) => {
    const { value } = this.props

    if (!modalRef.current || !value) {
      return
    }

    const monthIndex = getDatesMonthRange(this.props.fromMonth, value).length - 1
    const monthElement = modalRef.current.querySelectorAll<HTMLDivElement>('.calendar__month')[
      monthIndex
    ]
    if (monthElement) {
      const monthOffset = monthElement.offsetTop

      modalRef.current.scrollTo({ top: monthOffset, behavior: 'smooth' })
    }
  }

  onInputClick = () => {
    if (this.props.onInputClick) {
      this.props.onInputClick()
    }
  }

  handleOuterClick = (e) => {
    if (
      this.props.isInputActive &&
      ((this.parentRef && !this.parentRef.contains(e.target)) ||
        (this.modalWrapRef && !this.modalWrapRef.contains(e.target)))
    ) {
      this.close()
    }
  }

  close = () => {
    if (this.props.onClose && this.props.isInputActive) {
      this.props.onClose()
    }
  }

  onDayClick = (date: Date) => {
    if (this.props.onSelect) {
      this.props.onSelect(date)
    }

    this.close()
  }

  renderInput = (createRefFunc: (el: HTMLInputElement) => HTMLInputElement) => {
    const { inputValue, inputPlaceholder, isInputActive } = this.props

    return (
      <DateInput
        type="departure"
        active={isInputActive}
        value={inputValue || ''}
        readonly={true}
        placeholder={inputPlaceholder}
        onClick={this.onInputClick}
        ref={createRefFunc}
        error={this.props.error}
      />
    )
  }

  renderModalHeader() {
    const { inputPlaceholder } = this.props

    return (
      <div
        className={cn('modal-wrap')}
        ref={(el: HTMLInputElement): HTMLInputElement => (this.modalWrapRef = el)}
      >
        <div className={cn('modal-header')}>
          <h3 className={cn('modal-title')}>{inputPlaceholder}</h3>
          <button className={cn('modal-close')} onClick={this.close}>
            <IconClose className={cn('modal-close-icon')} />
          </button>
        </div>
        <div className={cn('modal-fields')}>{this.renderInput(this.setModalInputRef)}</div>
      </div>
    )
  }

  renderContent(calendarProps: ICalendarProps) {
    const { value, fromMonth, toMonth } = this.props
    const isMobile = this.state.mediaQueryType === 'mobile'

    let currentMonth = fromMonth

    if (!isMobile && value) {
      currentMonth = value
    }

    return (
      <div
        className={cn('wrap')}
        ref={(el: HTMLInputElement): HTMLInputElement => (this.parentRef = el)}
      >
        <div className={cn('content')}>
          <div className={cn('content-body', `--calendar`)}>
            <div className={cn('calendar-wrapper')}>
              <Calendar
                onDayClick={this.onDayClick}
                selectedDays={value}
                numberOfMonths={isMobile ? 13 : 1}
                navbarElement={isMobile ? () => null : undefined}
                currentMonth={currentMonth}
                disabledDays={{
                  before: fromMonth,
                  after: toMonth,
                }}
                {...calendarProps}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  render() {
    const {
      value,
      onSelect,
      inputValue,
      inputPlaceholder,
      className,
      isInputActive,
      ...calendarProps
    } = this.props
    const { mediaQueryType } = this.state

    return (
      <div
        className={cn(null, ['--single-date-picker', className])}
        ref={(el: HTMLInputElement): HTMLInputElement => (this.parentRef = el)}
      >
        {this.renderInput(this.setInputRef)}
        {mediaQueryType === 'mobile' ? (
          <Modal
            animationType="right"
            className={cn('dropdown', '--without-inner-margin')}
            visible={isInputActive}
            header={this.renderModalHeader()}
            onEntered={this.handleModalOnEntered}
          >
            {this.renderContent(calendarProps)}
          </Modal>
        ) : (
          <div className={cn('dropdown', '--right')}>
            {isInputActive && this.renderContent(calendarProps)}
          </div>
        )}
      </div>
    )
  }
}

export default SingleDatePicker
