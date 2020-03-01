import React from 'react'
import { connect } from 'react-redux'
import { stringify } from 'query-string'
import clssnms from 'clssnms'
import i18next from 'i18next'
import update from 'immutability-helper'
import { withTranslation, WithTranslation } from 'react-i18next'
import { addDays, addYears, format } from 'finity-js'
import { HotelParams } from 'form/types'
import { scrollTripDurationPickerIntoView } from 'form/utils'
import Resizer from 'shared_components/resizer'
import after from 'common/utils/after'
import AdditionalFields from 'form/components/additional_fields/additional_fields'
import { openInNewTab } from 'common/js/redux/actions/start_search/start_search.utils'
import AutocompleteField from '../autocomplete/autocomplete_field'
import { PlaceField, DateType, Place, FormError, PlaceType } from '../avia_form/avia_form.types'
import {
  isEmptyPlace,
  isDate,
  buildChindlrenString,
  convertDateFieldName,
} from '../avia_form/utils'
import TripDuration from 'shared_components/trip_duration/trip_duration'
import { TripDurationInput } from 'shared_components/trip_duration/trip_duration.types'
import { Modifiers } from 'react-day-picker'
import CalendarDay from 'shared_components/calendar/calendar_day/calendar_day'
import { isMobile } from 'shared_components/resizer'
import 'shared_components/polyfills/smoothscroll.polyfill'
import { reachGoal } from 'common/js/redux/actions/metrics.actions'

const mapLocaleToHotelLocale = (locale) =>
  ({
    ru: 'ru-RU',
    en: 'en-GB',
  }[locale] || 'ru-RU')

type HotelGuest = 'adults' | 'children'

const minDate = addDays(new Date(), -1)
const maxDate = addYears(addDays(minDate, -1), 1)
const cn = clssnms('of_main_form')
const DEFAULT_CHILDREN_AGE = 7
const DEFAULT_ACTION = 'https://hotels.aviasales.ru/hotels'

interface StateProps {
  params: HotelParams
  action: string
  marker: string
  currency: string
}

interface OwnProps {
  onSubmit?: Function
}

interface DispatchProps {
  reachGoal: (event: string, data?: any) => void
  onParamsChange: (params: Partial<HotelParams>) => void
}

export type HotelFormProps = OwnProps & StateProps & DispatchProps

interface HotelFormState {
  activeInput?: TripDurationInput
  disabled: boolean
  validationErrors: { [key in 'destination' | 'checkIn' | 'checkOut']?: FormError }
}

class HotelFormComponent extends React.Component<HotelFormProps & WithTranslation, HotelFormState> {
  timeouts: number[] = []
  state: HotelFormState = { disabled: false, validationErrors: {} }
  formRef = React.createRef<HTMLFormElement>()
  destinationRef = React.createRef<HTMLInputElement>()
  tripDurationDropdownRef: React.RefObject<HTMLDivElement>

  componentDidMount() {
    this.focusFirstField()
  }

  componentWillUnmount() {
    if (this.timeouts && this.timeouts.length) {
      this.timeouts.forEach((t) => clearTimeout(t))
    }
  }

  componentDidUpdate(_, prevState: HotelFormState) {
    const { activeInput } = this.state

    if (activeInput !== prevState.activeInput) {
      if (activeInput) {
        this.reachGoal(`${convertDateFieldName(activeInput)}--open`)
      } else if (prevState.activeInput) {
        this.reachGoal(`${convertDateFieldName(prevState.activeInput)}--close`)
      }
    }
  }

  setDropdownRef = (dropdownRef: React.RefObject<HTMLDivElement>) =>
    (this.tripDurationDropdownRef = dropdownRef)

  focusFirstField = () => {
    if (Resizer.matches('mobile')) {
      return
    }
    const origin = this.props.params.checkIn
    if (!origin && this.destinationRef && this.destinationRef.current) {
      const refCurrent = this.destinationRef.current
      setTimeout(() => refCurrent.focus(), 55)
    }
  }

  handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const validationErrors = this.isInvalid()
    if (!validationErrors) {
      // tslint:disable-next-line:variable-name
      let utm_medium = window.location.pathname === '/' ? 'homepage' : 'content_page'

      if (window.isSearchPage) {
        utm_medium = 'search_results'
      }

      this.reachGoal('submit')
      this.setState({ disabled: true })
      this.after(2000, () => this.setState({ disabled: false }))

      const { action, marker, currency } = this.props
      const { destination, checkIn, checkOut, adults, children, childrenAge } = this.props.params
      const isHotel = destination.type === PlaceType.Hotel
      const URL = action || DEFAULT_ACTION

      // NOTE: Different utm here coz search with SIP goes to ostrovok
      // and we need to count it separetely
      // tslint:disable-next-line:variable-name
      const utm_campaign =
        destination.iata && destination.iata.toLowerCase() === 'sip'
          ? 'checkbox'
          : 'search_form_tab'

      const params = stringify({
        destination: destination.name,
        hotelId: isHotel ? destination.iata : undefined,
        locationId: isHotel ? undefined : destination.locationId,
        checkIn: format(checkIn!, 'YYYY-MM-DD'),
        checkOut: format(checkOut!, 'YYYY-MM-DD'),
        utm_medium,
        utm_source: 'aviasales',
        utm_campaign,
        aid: 847433,
        marker,
        currency,
        // HACK: ¯\_(ツ)_/¯ No way to cast this property yet...
        language: mapLocaleToHotelLocale(i18next.language),
        hls: 'aviasales/form',
        adults,
        children: buildChindlrenString('', children, childrenAge),
      })
      openInNewTab(`${URL}?${params}`, /http(|s)/.test(URL))
      if (this.props.onSubmit) {
        this.props.onSubmit(`${URL}?${params}`)
      }
    } else {
      this.setState({ validationErrors })
    }
  }

  isInvalid(): false | HotelFormState['validationErrors'] {
    const { t } = this.props
    const { destination, checkIn, checkOut } = this.props.params
    const errors: HotelFormState['validationErrors'] = {}
    let invalid = false
    if (!destination || isEmptyPlace(destination)) {
      invalid = true
      errors.destination = { message: t('hotels_form:errorEmptyOrigin') }
    }
    if (!(checkIn && isDate(checkIn))) {
      invalid = true
      errors.checkIn = { message: t('hotels_form:errorEmptyDate') }
    }
    if (!(checkOut && isDate(checkOut))) {
      invalid = true
      errors.checkOut = { message: t('hotels_form:errorEmptyDate') }
    }
    return invalid ? errors : false
  }

  handleDestinationChange = (place: Place, moveToNext: boolean = true) => {
    this.props.onParamsChange({ ...this.props.params, destination: place })
    this.removeValidationError('destination')
    if (moveToNext) {
      this.setState({ activeInput: 'departure' })
    }
  }

  handleCheckInChange = (date: Date) => {
    const checkOut =
      !this.props.params.checkOut || date > this.props.params.checkOut
        ? undefined
        : this.props.params.checkOut
    this.props.onParamsChange({ ...this.props.params, checkIn: date, checkOut })
    this.removeValidationError('checkIn')
    this.reachGoal(`${DateType.DepartDate}--changeDay`, { date })
  }

  handleCheckOutChange = (date: Date) => {
    this.props.onParamsChange({ ...this.props.params, checkOut: date })
    this.removeValidationError('checkOut')
    this.reachGoal(`${DateType.ReturnDate}--changeDay`, { date })
  }

  handleGuestsChange = (guest: HotelGuest, value: number) => {
    const nextParams: Partial<HotelParams> = {}
    if (guest === 'adults' || guest === 'children') {
      nextParams[guest] = value
      if (guest === 'children') {
        const childrenAge: number[] = []
        for (let i = 0; i < value; i++) {
          childrenAge.push(this.props.params.childrenAge[i] || DEFAULT_CHILDREN_AGE)
        }
        nextParams.childrenAge = childrenAge
      }
      this.props.onParamsChange(nextParams)
    }
  }

  handleChildrenAgeChange = (index: number, value: number) => {
    this.props.onParamsChange({
      childrenAge: update(this.props.params.childrenAge, { [index]: { $set: value } }),
    })
  }

  handleActiveInputChanged = (activeInput?: TripDurationInput) => {
    this.setState({ activeInput }, () => {
      if (
        activeInput &&
        !isMobile() &&
        this.tripDurationDropdownRef &&
        this.tripDurationDropdownRef.current &&
        this.formRef &&
        this.formRef.current
      ) {
        scrollTripDurationPickerIntoView(this.tripDurationDropdownRef.current, this.formRef.current)
      }
    })
  }

  handleMonthChange = (month: Date, type?: 'prev' | 'next') => {
    if (type) {
      this.reachGoal('departDateMonthChange--click', { month, type })
    } else {
      this.reachGoal('departDateMonthChange--select', { month })
    }
  }

  reachGoal = (event: string, data?: any) => {
    this.props.reachGoal(`hotelForm--${event}`, data)
  }

  after(timeout: number, fn: Function) {
    this.timeouts.push(after(timeout, fn))
  }

  removeValidationError = (fieldName) => {
    if (this.state.validationErrors[fieldName]) {
      this.setState((prevState) => {
        const newValidationErrors = { ...prevState.validationErrors }

        delete newValidationErrors[fieldName]

        return {
          validationErrors: newValidationErrors,
        }
      })
    }
  }

  renderCalendarDay = (date: Date, modifiers: Modifiers) => (
    <CalendarDay
      testId={`datepicker_day_${format(date, 'YYYY-MM-DD')}`}
      day={date.getDate()}
      {...modifiers}
    />
  )

  render() {
    const { t } = this.props

    return (
      <form
        className={cn(null, '$block--hotel')}
        action={this.props.action || DEFAULT_ACTION}
        onSubmit={this.handleSubmit}
        target="_blank"
        ref={this.formRef}
      >
        <div className={cn('content')}>
          <div className="of_form_part--destination of_form_part of_autocomplete">
            <AutocompleteField
              forwardedRef={this.destinationRef}
              onSelect={this.handleDestinationChange}
              value={this.props.params.destination}
              type={PlaceField.Destination}
              allowOpenSearch={false}
              reachGoal={this.reachGoal}
              formType="hotel"
              error={this.state.validationErrors.destination}
              placeholder={this.props.t('hotels_form:originPlaceholder')}
            />
          </div>
          <div className="of_form_part of_form_part--date_range">
            <TripDuration
              onComponentDidMount={this.setDropdownRef}
              className="--hotel-form"
              activeInput={this.state.activeInput}
              departureTabs={['calendar']}
              returnTabs={['calendar']}
              onDepartureDateSelect={this.handleCheckInChange}
              onReturnDateSelect={this.handleCheckOutChange}
              onActiveInputChanged={this.handleActiveInputChanged}
              onMonthChange={this.handleMonthChange}
              fromMonth={minDate}
              toMonth={maxDate}
              departureValue={this.props.params.checkIn}
              returnValue={this.props.params.checkOut}
              errors={{
                departure: this.state.validationErrors.checkIn,
                return: this.state.validationErrors.checkOut,
              }}
              returnDateIsRequired={true}
              dropdownHeaderTitle={t(
                `trip_duration:dropdownHeader.hotel.${this.state.activeInput}`,
              )}
              departurePlaceholder={t('trip_duration:placeholder.checkIn')}
              returnPlaceholder={t('trip_duration:placeholder.checkOut')}
              modalTitle={
                this.state.activeInput
                  ? t(`trip_duration:modalTitle.hotel.${this.state.activeInput}`)
                  : ' '
              }
              renderCalendarDay={this.renderCalendarDay}
              testIds={{ departure: 'departure_date_input', return: 'return_date_input' }}
            />
          </div>
          <div className={cn('additional-fields')}>
            <AdditionalFields
              adults={this.props.params.adults}
              children={this.props.params.children}
              childrenAge={this.props.params.childrenAge}
              onPassengersChange={this.handleGuestsChange}
              onChildrenAgeChange={this.handleChildrenAgeChange}
              reachGoal={this.props.reachGoal}
              formType="hotel"
            />
            <div className={cn('submit-wrap', '--common-search')}>
              <button
                className={cn('submit')}
                type="submit"
                disabled={this.state.disabled}
                data-testid="hotel-submit"
              >
                <span className={cn('submit-text')}>
                  {this.props.t('hotels_form:submitButtonText')}
                </span>
              </button>
            </div>
          </div>
          <input type="hidden" name="utm_medium" value="tab" />
          <input type="hidden" name="utm_source" value="aviasales" />
          <input type="hidden" name="marker" value={this.props.marker} />
          <input type="hidden" name="currency" value={this.props.currency.toUpperCase()} />
          <input type="hidden" name="language" value={mapLocaleToHotelLocale(i18next.language)} />
          <input type="hidden" name="hls" value="aviasales/form" />
        </div>
        <div className={cn('submit-wrap', '--mobile-search')}>
          <button
            className={cn('submit')}
            type="submit"
            disabled={this.state.disabled}
            data-testid="hotel-submit"
          >
            <span className={cn('submit-text')}>
              {this.props.t('hotels_form:submitButtonText')}
            </span>
          </button>
        </div>
      </form>
    )
  }
}

export const HotelForm = withTranslation('hotels_form')(HotelFormComponent)

const mapStateToProps = (state) => {
  const tab = state.pageHeader.tabs.hotel || { action: DEFAULT_ACTION }
  return {
    action: tab.action,
    params: state.hotelParams,
    marker: state.pageHeader.marker,
    currency: state.currency,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    reachGoal: (event, data) => dispatch(reachGoal(event, data)),
    onParamsChange: (params: HotelParams) => dispatch({ type: 'UPDATE_HOTEL_PARAMS', params }),
  }
}

export default connect<StateProps, DispatchProps>(mapStateToProps, mapDispatchToProps)(HotelForm)
