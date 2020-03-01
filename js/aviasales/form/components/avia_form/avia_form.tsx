import * as React from 'react'
import clssnms from 'clssnms'
import { connect } from 'react-redux'
import update from 'immutability-helper'
import { withTranslation, WithTranslation } from 'react-i18next'
import { addDays, addYears } from 'finity-js'
import GoalKeeper from 'common/bindings/goalkeeper'
import Cookie from 'common/bindings/cookie'
import after from 'common/utils/after'
import raf from 'common/bindings/raf'
import {
  State,
  Props,
  PlaceField,
  DateType,
  Place,
  DateField,
  FormErrors,
  PlaceType,
  SearchParams,
} from './avia_form.types'
import Submit from './submit'
import AdditionalFields from 'form/components/additional_fields/additional_fields'
import AutocompleteField from 'form/components/autocomplete/autocomplete_field'
import SearchHotels from 'form/components/search_hotels'
import {
  SEARCH_HOTELS_COOKIE,
  ENABLE_FORM_TIMEOUT,
  DEFAULT_PLACE,
  HINT_COOKIE_NAME,
} from './avia_form.constants'
import ErrorBoundary from 'shared_components/error_boundary/error_boundary'
import { ErrorType } from 'shared_components/error_boundary/error_boundary.types'
import {
  getDate,
  getPlace,
  isOneWay,
  isEmptyPlace,
  getAllowedDateTabs,
  convertDateFieldName,
  convertDateTabToDateType,
  convertDateTabName,
} from './utils'
import './avia_place_field.scss'
import { priceSwitcherCheck } from 'common/js/redux/actions/calendar_prices.actions'
import fetchCurrencyRates from 'common/js/redux/actions/fetch_currency_rates.actions'
import { HistoryItem } from '../autocomplete/search_history'
import { TripClass } from 'common/types'
import { getPreviousSegmentDestination } from '../multiway_form/multiway_form'
import { withFlagr } from 'shared_components/flagr/flagr-react'
import flagr from 'common/utils/flagr_client_instance'
import { scrollTripDurationPickerIntoView } from 'form/utils'
import defaultResizer, { isMobile } from 'shared_components/resizer'
import { fetchSearchHistory } from 'common/js/redux/actions/search_history.actions'
import { aviaFormSubmit, updateAviaParams } from 'common/js/redux/actions/avia_params.actions'
import { updateMultiwayParams } from 'common/js/redux/actions/multiway_params.actions'
import TripDuration from 'shared_components/trip_duration/trip_duration'
import {
  TripDurationInput,
  TripDurationRange,
  TripDurationTab,
} from 'shared_components/trip_duration/trip_duration.types'
import { getCurrentTabByValue } from 'shared_components/trip_duration/trip_duration.utils'
import 'shared_components/polyfills/smoothscroll.polyfill'
import { Modifiers } from 'react-day-picker'
import {
  changeAviaPlace,
  swapAviaPlaces,
  monthsMount,
  changeActiveDateInput,
  changeDateInputMonth,
  changeAviaDate,
} from 'common/js/redux/actions/avia_form.actions'
import CalendarDayWithPriceContainer from './calendar_day_with_price.container'
import MonthPriceContainer from './month_price.container'
import { getDateFromMonthKey } from 'shared_components/month_picker/month_picker.utils'
import { getAviaParamsActiveDateInput } from 'common/js/redux/selectors/avia_params.selector'
import { reachGoal } from 'common/js/redux/actions/metrics.actions'
import { updatePageHeader, updateTabParams } from 'common/js/redux/actions/page_header.actions'
const SwapArrow = require('!!react-svg-loader!./images/swap-places.svg')

const classNames = clssnms('of_main_form')

const mediaQueryModesMapping = {
  mobile: 'mobile',
  mobileLandscape: 'mobile',
  tablet: 'desktop',
  desktop: 'desktop',
}

const minDate = addDays(new Date(), -1)
const maxDate = addYears(addDays(minDate, -1), 1)

const FIELDS_SEQUENCE: Array<PlaceField> = [PlaceField.Origin, PlaceField.Destination]

const initialMediaQueryType = mediaQueryModesMapping[defaultResizer.currentMode() || 'desktop']

class AviaFormComponent extends React.Component<Props & WithTranslation, State> {
  static defaultProps: Partial<Props & WithTranslation> = {
    footerActions: true,
  }

  scrollTimeout: any // raf
  timeouts: number[] = []

  formRef = React.createRef<HTMLFormElement>()
  tripDurationDropdownRef: React.RefObject<HTMLDivElement>

  // NOTE: we need to keep refs of input elements to make .focus()
  formRefs: { [key in PlaceField]: React.RefObject<HTMLInputElement> } = {
    [PlaceField.Origin]: React.createRef(),
    [PlaceField.Destination]: React.createRef(),
  }

  state: State = {
    disabled: true,
    shouldSearchHotels: !Cookie.get(SEARCH_HOTELS_COOKIE),
    progressBarClass: '',
    withoutReturnDate: true,
    showHint: false,
    errors: {},
  }

  componentDidMount() {
    this.setState({
      disabled: false,
    })
    document.addEventListener('scroll', this.handleScroll)
    if (this.props.shouldFocusFirstEmptyField) {
      this.focusFirstEmptyField()
    }
    this.props.fetchSearchHistory()
    this.props.fetchCurrencyRates()
  }

  componentWillUnmount() {
    raf.cancel(this.scrollTimeout)
    document.removeEventListener('scroll', this.handleScroll)
    this.timeouts.forEach((timeout) => clearTimeout(timeout))
    this.timeouts = []
  }

  getIsShowHotelsSearch = () => {
    if (window.isSearchPage || window.isUserPage || initialMediaQueryType !== 'desktop') {
      return false
    }

    return true
  }

  componentDidUpdate(prevProps: Props & WithTranslation) {
    const { activeDateInput } = this.props

    // TODO move to redux
    if (activeDateInput !== prevProps.activeDateInput) {
      if (activeDateInput) {
        this.reachGoal(`${convertDateFieldName(activeDateInput)}--open`)
      } else if (prevProps.activeDateInput) {
        this.reachGoal(`${convertDateFieldName(prevProps.activeDateInput)}--close`)
      }
    }
  }

  setDropdownRef = (dropdownRef: React.RefObject<HTMLDivElement>) =>
    (this.tripDurationDropdownRef = dropdownRef)

  focusFirstEmptyField = (): void => {
    if (initialMediaQueryType === 'mobile') {
      return
    }
    const destination = this.getPlace(PlaceField.Destination)
    if (!destination.iata && !destination.name) {
      this.focusField(PlaceField.Destination)
    } else if ((destination.iata || destination.name) && !this.getDate(DateType.DepartDate)) {
      this.handleActiveInputChanged('departure')
    }
  }

  isOneWay(): boolean {
    return isOneWay(this.props.params.segments)
  }

  getDate(type: DateType): DateField {
    return getDate(this.props.params.segments, type)
  }

  getPlace(type: PlaceField): Place {
    return getPlace(this.props.params.segments, type)
  }

  handlePlaceChange = (type: PlaceField) => (
    place: Place | HistoryItem,
    moveToNext: boolean = true,
  ) => {
    this.props.onAviaFormPlaceChange(type, place)

    if (this.state.errors[type]) {
      this.setState({ errors: update(this.state.errors, { $unset: [type] }) })
    }
    if (moveToNext) {
      this.moveToNextField(type)
      if (type === PlaceField.Destination) {
        this.handleActiveInputChanged(
          'departure',
          place.departureDate instanceof Date ? place.departureDate : undefined,
        )
      }
    }
  }

  handleActiveInputChanged = (activeInput?: TripDurationInput, month?: Date) => {
    const [origin, destination, departDate, returnDate] = this.getFormState()
    let currentMonth = month

    if (!currentMonth) {
      if (activeInput === 'departure') {
        currentMonth = departDate instanceof Date ? departDate : new Date()
      }

      if (activeInput === 'return') {
        currentMonth = returnDate instanceof Date ? returnDate : new Date()
      }
    }

    this.props.onActiveDateInputChange(activeInput, currentMonth)

    setTimeout(() => {
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
    }, 10)
  }

  handleDateChange = (type: DateType, date: DateField) => {
    this.props.onDateChange(type, date)
    if (this.state.errors[type] && type === DateType.DepartDate && !!date) {
      this.setState({ errors: update(this.state.errors, { $unset: [type] }) })
    }
  }

  handleDepartDateChange = (date: DateField) => {
    this.handleDateChange(DateType.DepartDate, date)
    this.reachGoal(
      `${DateType.DepartDate}--change${convertDateTabToDateType(getCurrentTabByValue(date))}`,
      { date },
    )
  }

  handleReturnDateChange = (date: DateField) => {
    this.handleDateChange(DateType.ReturnDate, date)
    this.reachGoal(
      `${DateType.ReturnDate}--change${convertDateTabToDateType(getCurrentTabByValue(date))}`,
      { date },
    )
  }

  handleReturnResetClick = () => {
    this.handleDateChange(DateType.ReturnDate, undefined)
    this.reachGoal(`${DateType.ReturnDate}--reset`)
  }

  handleWithoutReturnClick = () => {
    this.handleDateChange(DateType.ReturnDate, undefined)
    this.reachGoal(`returnDateClear--mousedown`)
  }

  handleDateTabChange = (tab: TripDurationTab) => {
    this.reachGoal(`change_tab--click`, {
      tab: convertDateTabName(tab),
      type: convertDateFieldName(this.props.activeDateInput),
    })
  }

  handleMonthsConfirmClick = () => {
    this.reachGoal(`monthPickerChooseDates--click`)
  }

  handleMonthChange = (month: Date, type?: 'prev' | 'next') => {
    this.props.onMonthChange(this.props.activeDateInput!, month, type)
  }

  handleMonthsMount = () => {
    this.props.onMonthsMount()
  }

  swapPlaces = () => {
    this.props.onSwapPlaces()
  }

  moveToNextField(field: PlaceField) {
    const nextField = FIELDS_SEQUENCE[FIELDS_SEQUENCE.indexOf(field) + 1]
    this.focusField(nextField)
  }

  focusField(field: PlaceField | DateType) {
    if (field) {
      after(55, () => {
        const ref = this.formRefs[field]
        if (ref && ref.current) {
          ref.current.focus()
        }
      })
    }
  }

  disableForm() {
    this.setState({ disabled: true })
    this.timeouts.push(after(ENABLE_FORM_TIMEOUT, () => this.setState({ disabled: false })))
  }

  handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    if (this.props.showFormHint) {
      this.closeHint()
    }
    const validationErrors = this.isInvalid()
    if (!validationErrors) {
      GoalKeeper.triggerEvent('avia_form', 'search', 'submit')
      this.disableForm()
      this.props.aviaFormSubmit(this.state.shouldSearchHotels && this.state.shouldSearchHotels)
    } else {
      this.setState({ errors: validationErrors })
      GoalKeeper.triggerEvent(
        'avia_form',
        Object.keys(validationErrors).join(','),
        'validationError',
      )
    }
  }

  handleMultiwayForm = (event: React.MouseEvent) => {
    event.preventDefault()
    this.props.openMultiWayForm()
    if (this.props.params.segments.length === this.props.multiwayParams.segments.length) {
      const { segments } = this.props.multiwayParams
      const updatedSegments = update(segments, {
        $push: [
          {
            origin: getPreviousSegmentDestination(segments),
            destination: DEFAULT_PLACE,
            date: undefined,
          },
        ],
      })
      this.props.changeMultiwayParams({ segments: updatedSegments })
    }
  }

  handleScroll = () => {
    raf.cancel(this.scrollTimeout)
    this.scrollTimeout = raf(() => {
      if (this.props.showFormHint && window.pageYOffset > 100) {
        this.closeHint()
      }
    })
  }

  closeHint = () => {
    this.props.hideFormHint()
    Cookie.set(HINT_COOKIE_NAME, true, { path: '/', expires: 60 * 60 * 24 * 7 })
  }

  setPassengers = () => (type: string, value: number) => {
    const newParams = update(this.props.params, {
      passengers: { [type]: { $set: value } },
    })
    this.props.changeParams(newParams)
  }

  setTripClass = () => (value: TripClass) => {
    this.props.changeParams({ tripClass: value })
  }

  getFormState(): [Place, Place, DateField, DateField] {
    return [
      this.getPlace(PlaceField.Origin),
      this.getPlace(PlaceField.Destination),
      this.getDate(DateType.DepartDate),
      this.getDate(DateType.ReturnDate),
    ]
  }

  reachGoal = (event: string, data?: any) => {
    this.props.reachGoal(`avia_form--${event}`, data)
  }

  isInvalid(): false | FormErrors {
    const [origin, destination, departDate] = this.getFormState()
    const errors: FormErrors = {}

    let valid = true
    if (!origin.iata) {
      errors[PlaceField.Origin] = { message: this.props.t('avia_form:errorEmptyOrigin') }
      valid = false
    }
    if (!destination.iata && destination.type !== PlaceType.Anywhere) {
      errors[PlaceField.Destination] = { message: this.props.t('avia_form:errorEmptyDestination') }
      valid = false
    }
    if (!(isEmptyPlace(origin) || isEmptyPlace(destination)) && origin.iata === destination.iata) {
      errors[PlaceField.Destination] = { message: this.props.t('avia_form:errorSameCities') }
      valid = false
    }
    if (!departDate) {
      errors[DateType.DepartDate] = { message: this.props.t('avia_form:errorEmptyDate') }
      valid = false
    }
    return valid ? false : errors
  }

  handlePriceSwitcherChange = (checked: boolean, tab: TripDurationTab, month?: Date) =>
    this.props.onPriceSwitcherCheck(checked, this.props.activeDateInput!, tab, month)

  renderMonthPrice = (month: string) => <MonthPriceContainer month={getDateFromMonthKey(month)} />

  renderCalendarDay = (date: Date, modifiers: Modifiers) => {
    return this.props.activeDateInput ? (
      <CalendarDayWithPriceContainer
        date={date}
        modifiers={modifiers}
        activeInput={this.props.activeDateInput}
      />
    ) : (
      <></>
    )
  }

  onHotelsSearchChange = (shouldSearchHotels: boolean) => this.setState({ shouldSearchHotels })

  render() {
    const { t, activeDateInput } = this.props
    const [origin, destination, departDate, returnDate] = this.getFormState()

    return (
      <ErrorBoundary errorType={ErrorType.Critical} errorText={`AviaForm component error.`}>
        <form
          action={this.props.action}
          className={classNames(null, {
            '$block--avia': true,
            '--disabled': this.state.disabled,
          })}
          onSubmit={this.handleSubmit}
          target={this.getIsShowHotelsSearch() ? '_blank' : '_self'}
          data-testid="avia_form"
          ref={this.formRef}
        >
          <div className={classNames('content')}>
            <div className={classNames('avia-places')}>
              <div className="avia-place-field">
                <AutocompleteField
                  value={this.getPlace(PlaceField.Origin)}
                  initialInputState={
                    this.props.initialInputValues && this.props.initialInputValues.origin
                  }
                  siblingValue={this.getPlace(PlaceField.Destination)}
                  searchHistory={this.props.searchHistory}
                  type={PlaceField.Origin}
                  onSelect={this.handlePlaceChange(PlaceField.Origin)}
                  error={this.state.errors[PlaceField.Origin]}
                  forwardedRef={this.formRefs[PlaceField.Origin]}
                  allowOpenSearch={false}
                  reachGoal={this.reachGoal}
                />
                <div className="avia-place-field__swap-places" onClick={this.swapPlaces}>
                  <SwapArrow className="avia-place-field__swap-places-arrow --top" />
                  <SwapArrow className="avia-place-field__swap-places-arrow --bottom" />
                </div>
              </div>
              <div className="avia-place-field">
                <AutocompleteField
                  value={this.getPlace(PlaceField.Destination)}
                  initialInputState={
                    this.props.initialInputValues && this.props.initialInputValues.destination
                  }
                  siblingValue={this.getPlace(PlaceField.Origin)}
                  searchHistory={this.props.searchHistory}
                  type={PlaceField.Destination}
                  onSelect={this.handlePlaceChange(PlaceField.Destination)}
                  error={this.state.errors[PlaceField.Destination]}
                  forwardedRef={this.formRefs[PlaceField.Destination]}
                  allowOpenSearch={flagr.is('avs-feat-openSearch') && !isMobile()}
                  reachGoal={this.reachGoal}
                />
              </div>
            </div>
            <div className="date-fields of_form_part of_form_part--date_range">
              <TripDuration
                className="--avia-form"
                onComponentDidMount={this.setDropdownRef}
                activeInput={this.props.activeDateInput}
                departureTabs={getAllowedDateTabs(
                  'departure',
                  this.props.params.segments,
                  flagr.is('avs-feat-openSearch'),
                )}
                returnTabs={getAllowedDateTabs(
                  'return',
                  this.props.params.segments,
                  flagr.is('avs-feat-openSearch'),
                )}
                onDepartureDateSelect={this.handleDepartDateChange}
                onReturnDateSelect={this.handleReturnDateChange}
                onActiveInputChanged={this.handleActiveInputChanged}
                onReturnResetClick={this.handleReturnResetClick}
                onWithoutReturnClick={this.handleWithoutReturnClick}
                onTabChange={this.handleDateTabChange}
                onMonthsConfirmClick={this.handleMonthsConfirmClick}
                onMonthChange={this.handleMonthChange}
                onMonthsMount={this.handleMonthsMount}
                onPriceSwitcherChange={this.handlePriceSwitcherChange}
                priceSwitcherChecked={this.props.calendarPrices.oneWayPrices}
                fromMonth={minDate}
                toMonth={maxDate}
                rangeDaysDurationBoundaries={{ min: 1, max: 30 }}
                rangeDaysDurationMin={
                  returnDate && (returnDate as TripDurationRange).min
                    ? (returnDate as TripDurationRange).min
                    : 1
                }
                rangeDaysDurationMax={
                  returnDate && (returnDate as TripDurationRange).max
                    ? (returnDate as TripDurationRange).max
                    : 30
                }
                departureValue={departDate}
                returnValue={returnDate}
                errors={{ departure: this.state.errors[DateType.DepartDate] }}
                renderMonthPrice={this.renderMonthPrice}
                renderCalendarDay={this.renderCalendarDay}
                dropdownHeaderTitle={
                  activeDateInput ? t(`trip_duration:dropdownHeader.avia.${activeDateInput}`) : ' '
                }
                clearBtnText={t('trip_duration:withoutReturn')}
                clearBtnTextShort={t('trip_duration:withoutReturnShort')}
                departurePlaceholder={t('trip_duration:placeholder.departure')}
                returnPlaceholder={t('trip_duration:placeholder.return')}
                modalTitle={
                  activeDateInput ? t(`trip_duration:modalTitle.avia.${activeDateInput}`) : ' '
                }
                showPriceSwitcher={!!origin.iata && activeDateInput !== 'return'}
                isLoading={this.props.calendarLoader}
              />
            </div>
            <div className={classNames('additional-fields')}>
              <AdditionalFields
                {...this.props.params.passengers}
                tripClass={this.props.params.tripClass}
                onPassengersChange={this.setPassengers()}
                onTripClassChange={this.setTripClass()}
                formType="avia"
              />
              <Submit
                subClassName="--common-search"
                disabled={this.state.disabled}
                onHintCloseClick={this.closeHint}
                showHint={this.props.showFormHint}
              />
            </div>
            <input type="hidden" name="with_request" value="true" />
          </div>
          {this.props.footerActions && (
            <div className={classNames('bottom')}>
              <a
                href="#multiway"
                className={classNames('change_form_link')}
                onClick={this.handleMultiwayForm}
              >
                {this.props.t('avia_form:complexRoute')}
              </a>
              {this.getIsShowHotelsSearch() && (
                <SearchHotels
                  checked={this.state.shouldSearchHotels}
                  onChange={this.onHotelsSearchChange}
                />
              )}
            </div>
          )}
          <Submit
            subClassName="--mobile-search"
            disabled={this.state.disabled}
            onHintCloseClick={this.closeHint}
            showHint={this.props.showFormHint}
          />
        </form>
      </ErrorBoundary>
    )
  }
}

export const AviaForm = withTranslation(['avia_form', 'trip_duration'])(AviaFormComponent)

const mapStateToProps = (state) => {
  const tab = state.pageHeader.tabs.avia || { action: '' }
  return {
    activeDateInput: getAviaParamsActiveDateInput(state),
    action: tab.action,
    showFormHint: !Cookie.get(HINT_COOKIE_NAME) && tab.showFormHint,
    params: state.aviaParams,
    multiwayParams: state.multiwayParams,
    calendarPrices: state.calendarPrices,
    calendarLoader: state.calendarLoader,
    currentPage: state.currentPage,
    searchHistory: state.searchHistory,
  }
}

const mapDispatchToProps = (dispatch) => {
  /**
   * TODO remove activeInput from actions. Use activeDateInput from state
   */
  return {
    changeParams: (params: Partial<SearchParams>) => dispatch(updateAviaParams(params)),
    changeMultiwayParams: (params: Partial<SearchParams>) => dispatch(updateMultiwayParams(params)),
    openMultiWayForm: () => dispatch(updatePageHeader({ activeForm: 'multiway' })),
    hideFormHint: () => dispatch(updateTabParams('avia', { showFormHint: false })),
    fetchSearchHistory: () => dispatch(fetchSearchHistory()),
    fetchCurrencyRates: () => dispatch(fetchCurrencyRates()),
    reachGoal: (event, data) => dispatch(reachGoal(event, data)),
    aviaFormSubmit: (shouldSearchHotels: boolean) => dispatch(aviaFormSubmit(shouldSearchHotels)),
    onPriceSwitcherCheck: (
      checked: boolean,
      activeInput: TripDurationInput,
      tab: TripDurationTab,
      month?: Date,
    ) => dispatch(priceSwitcherCheck(checked, activeInput, tab, month)),
    onAviaFormPlaceChange: (type: PlaceField, place: Place | HistoryItem) =>
      dispatch(changeAviaPlace(type, place)),
    onSwapPlaces: () => dispatch(swapAviaPlaces()),
    onMonthsMount: () => dispatch(monthsMount()),
    onActiveDateInputChange: (activeInput: TripDurationInput, month: Date) =>
      dispatch(changeActiveDateInput(activeInput, month)),
    onMonthChange: (activeInput: TripDurationInput, month: Date, direction?: 'prev' | 'next') =>
      dispatch(changeDateInputMonth(activeInput, month, direction)),
    onDateChange: (dateType: DateType, date: DateField) => dispatch(changeAviaDate(dateType, date)),
  }
}

export default withFlagr(flagr, ['avs-feat-openSearch'])(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(AviaForm),
)
