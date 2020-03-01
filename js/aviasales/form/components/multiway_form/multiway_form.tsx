import * as React from 'react'
import clssnms from 'clssnms'
import classNames from 'classnames'
import { connect } from 'react-redux'
import {
  SearchParams,
  PlaceField,
  Place,
  DateType,
  FormErrors,
  Segment,
} from '../avia_form/avia_form.types'
import AutocompleteField from '../autocomplete/autocomplete_field'
import TripParams from 'utils/trip_params.coffee'
import SingleDatePickerComponent from 'shared_components/single_date_picker/single_date_picker'
import withHandlingSelectedDate from 'shared_components/single_date_picker/single_date_picker.hoc'
import { getAsDate, isEmptyPlace } from '../avia_form/utils'
import update from 'immutability-helper'
import { addDays, addYears } from 'finity-js'
import AdditionalFields from 'form/components/additional_fields/additional_fields'
import { DEFAULT_PLACE } from '../avia_form/avia_form.constants'
import { isDate } from 'util'
import after from 'common/utils/after'
import Resizer from 'shared_components/resizer'
import { TripClass } from 'common/types'
import { withTranslation, WithTranslation } from 'react-i18next'
import {
  multiwayFormSubmit,
  updateMultiwayParams,
} from 'common/js/redux/actions/multiway_params.actions'
import { reachGoal } from 'common/js/redux/actions/metrics.actions'
import { updateAviaParams } from 'common/js/redux/actions/avia_params.actions'
import { updatePageHeader } from 'common/js/redux/actions/page_header.actions'

const cn = clssnms('of_main_form')
const minDate = addDays(new Date(), -1)
const maxDate = addYears(addDays(minDate, -1), 1)
const MAX_SEGMENTS_SIZE = 6

const SingleDatePicker = withHandlingSelectedDate(SingleDatePickerComponent)

interface OwnProps {
  maxSegmentsSize: number
}

interface StateProps {
  params: SearchParams
  action: string
}

interface DispatchProps {
  reachGoal: (event: string, data?: any) => void
  updateParams: (
    params: Partial<SearchParams>,
    additionalParams?: object,
    callback?: Function,
  ) => void
  updateAviaParams: (
    params: Partial<SearchParams>,
    additionalParams?: object,
    callback?: Function,
  ) => void
  openAviaForm: () => void
  multiwayFormSubmit: typeof multiwayFormSubmit
}

type Props = OwnProps & StateProps & DispatchProps & WithTranslation

interface State {
  disabled: boolean
  validationErrors: { [segmentIndex: number]: FormErrors }
}

const FIELDS_SEQUENCE: Array<PlaceField | DateType> = [
  PlaceField.Origin,
  PlaceField.Destination,
  DateType.DepartDate,
]

interface SegmentRefs {
  [PlaceField.Origin]: React.RefObject<HTMLInputElement>
  [PlaceField.Destination]: React.RefObject<HTMLInputElement>
  [DateType.DepartDate]: React.RefObject<HTMLInputElement>
}

export function getPreviousSegmentDestination(segments: ReadonlyArray<Segment>): Place {
  const segment = segments[segments.length - 1]
  if (!segment) {
    return DEFAULT_PLACE
  }
  return segment[PlaceField.Destination] || DEFAULT_PLACE
}

class MultiwayFormComponent extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {
    maxSegmentsSize: MAX_SEGMENTS_SIZE,
  }

  state: State = {
    disabled: false,
    validationErrors: {},
  }

  formRefs: { [segmentIndex: number]: SegmentRefs } = {}

  componentDidMount() {
    this.focusFirstField()
  }

  handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const validationErrors = this.isInvalid()
    if (!validationErrors) {
      this.setState({ validationErrors: {} })
      this.props.multiwayFormSubmit()
      this.reachGoal('search--submit')
    } else {
      this.setState({ validationErrors })
      this.reachGoal('validationError', validationErrors)
    }
  }

  focusFirstField = () => {
    if (Resizer.matches('mobile')) {
      return
    }
    const origin = this.props.params.segments[0][PlaceField.Origin]
    if (!origin || isEmptyPlace(origin)) {
      const ref = this.formRefs[0][PlaceField.Origin]
      this.focusField(ref)
    }
  }

  handlePlaceChange = (field: PlaceField, segmentIndex: number) => (
    place: Place,
    moveToNext: boolean,
  ) => {
    const newSegments = update(this.props.params.segments, {
      [segmentIndex]: { [field]: { $set: place } },
    })
    this.props.updateParams({ segments: newSegments })
    if (moveToNext) {
      this.moveToNextField(segmentIndex, field)
    }
  }

  handleDateChange = (segmentIndex: number) => (date: Date) => {
    const { segments } = this.props.params
    let segmentsToUpdate: {
      [key: number]: { date: { $set: Date | undefined } }
    } = {
      [segmentIndex]: { date: { $set: date } },
    }

    for (let i = segmentIndex + 1; i < segments.length; i++) {
      if (segments[i].date && segments[i].date! < date) {
        segmentsToUpdate[i] = { date: { $set: undefined } }
      }
    }

    const newSegments = update(segments, segmentsToUpdate)

    this.props.updateParams({ segments: newSegments })
    this.reachGoal('departDate--changeDay', { date, segmentIndex })
  }

  handleDatePickerInteraction = (segmentIndex: number) => (isActive?: boolean) => {
    const postfix = isActive ? 'open' : 'close'
    this.reachGoal(`departDate--${postfix}`, { segmentIndex })
  }

  handleMonthChangeSelect = (segmentIndex: number) => (month: Date) => {
    // NOTE: handle month select
    this.reachGoal('departDateMonthChange--select', { segmentIndex, month })
  }

  handleMonthChangeClick = (segmentIndex: number, type: 'prev' | 'next') => (month: Date) => {
    this.reachGoal('departDateMonthChange--click', { segmentIndex, month, type })
  }

  handlePassengersChange = () => (type: string, value: number) => {
    const newParams = update(this.props.params, { passengers: { [type]: { $set: value } } })
    this.props.updateParams(newParams)
  }

  handleTripClassChange = () => (value: TripClass) => {
    this.props.updateParams({ tripClass: value })
  }

  handleRemoveClick = (segmentIndex: number = this.props.params.segments.length) => (
    event: React.MouseEvent,
  ) => {
    event.preventDefault()
    const updatedSegments = update(this.props.params.segments, {
      $splice: [[segmentIndex, 1]],
    })
    this.props.updateParams({ segments: updatedSegments })
    if (!TripParams.isOpenJaw(updatedSegments)) {
      this.props.updateAviaParams({ segments: updatedSegments })
      this.props.openAviaForm()
    }
    this.reachGoal('removeSegment')
  }

  handleAddSegmentClick = (event: React.MouseEvent) => {
    event.preventDefault()
    const { segments } = this.props.params
    const updatedSegments = update(segments, {
      $push: [
        {
          origin: getPreviousSegmentDestination(segments),
          destination: DEFAULT_PLACE,
          date: undefined,
        },
      ],
    })
    this.props.updateParams({ segments: updatedSegments })
    this.reachGoal('addSegment')
  }

  handleChangeFormClick = (event: React.MouseEvent) => {
    event.preventDefault()
    this.props.openAviaForm()
    this.reachGoal('changeToAviaForm')
  }

  moveToNextField(segmentIndex: number, field: PlaceField | DateType) {
    try {
      let nextField = FIELDS_SEQUENCE[FIELDS_SEQUENCE.indexOf(field) + 1]
      const nextIndex = !nextField ? segmentIndex + 1 : segmentIndex
      nextField = nextField || FIELDS_SEQUENCE[0]
      const ref = this.formRefs[nextIndex] ? this.formRefs[nextIndex][nextField] : null
      this.focusField(ref)
    } catch (e) {
      /* */
    }
  }

  focusField(ref: React.RefObject<HTMLInputElement>) {
    after(55, () => {
      if (ref && ref.current) {
        ref.current.focus()
      }
    })
  }

  getPreviousSegmentDate(segmentIndex: number): Date | undefined {
    const segment = this.props.params.segments[segmentIndex - 1]
    if (!segment) {
      return undefined
    }
    return getAsDate(segment.date) || this.getPreviousSegmentDate(segmentIndex - 1)
  }

  getNextSegmentDate(segmentIndex: number): Date | undefined {
    const segment = this.props.params.segments[segmentIndex + 1]
    if (!segment) {
      return undefined
    }
    return getAsDate(segment.date) || this.getNextSegmentDate(segmentIndex + 1)
  }

  isInvalid(): false | State['validationErrors'] {
    const { t } = this.props
    let invalid = false
    const validationErrors = this.props.params.segments.reduce(
      (acc: State['validationErrors'], segment, segmentIndex) => {
        const errors: FormErrors = {}
        const origin = segment[PlaceField.Origin]
        const destination = segment[PlaceField.Destination]
        const date = segment.date
        if (!origin || isEmptyPlace(origin)) {
          errors[PlaceField.Origin] = { message: t('avia_form:errorEmptyOrigin') }
          invalid = true
        }
        if (!destination || isEmptyPlace(destination)) {
          errors[PlaceField.Destination] = { message: t('avia_form:errorEmptyDestination') }
          invalid = true
        }
        if (!isDate(date)) {
          errors.date = { message: t('avia_form:errorEmptyDate') }
          invalid = true
        }
        if (origin && destination) {
          if (
            !(isEmptyPlace(origin) || isEmptyPlace(destination)) &&
            origin.iata === destination.iata
          ) {
            errors[PlaceField.Destination] = { message: t('avia_form:errorSameCities') }
            invalid = true
          }
        }
        if (invalid) {
          return { ...acc, [segmentIndex]: errors }
        }
        return acc
      },
      {},
    )
    return invalid ? validationErrors : false
  }

  reachGoal = (event: string, data?: any) => {
    this.props.reachGoal(`multiwayForm--${event}`, data)
  }

  getRef(index: number, field: PlaceField | DateType): React.RefObject<HTMLInputElement> {
    if (!this.formRefs[index]) {
      this.formRefs[index] = {
        [DateType.DepartDate]: React.createRef(),
        [PlaceField.Origin]: React.createRef(),
        [PlaceField.Destination]: React.createRef(),
      }
    }
    if (!this.formRefs[index][field]) {
      this.formRefs[index][field] = React.createRef()
    }
    return this.formRefs[index][field]
  }

  render() {
    const { t } = this.props
    const { segments } = this.props.params
    return (
      <form
        action={this.props.action}
        data-testid="multiway-form"
        className={cn(null, {
          '$block--multiway': true,
        })}
        onSubmit={this.handleSubmit}
        target="_self"
      >
        <div className={cn('content')}>
          {segments.map((segment, i) => {
            const errors = this.state.validationErrors[i] || {}
            const removable = segments.length > 1 && i === segments.length - 1
            const isActive = !!(
              segment &&
              segment.destination &&
              segment.destination.iata &&
              !segment.date
            )

            return (
              // TODO: id?
              <div
                className={classNames(
                  'of_multiway_segment',
                  i > 0 && 'of_multiway_segment--without_labels',
                )}
                key={i}
              >
                <div className="of_multiway_segment__origin_destination">
                  <div className="of_form_part of_form_part--multiway_origin of_autocomplete">
                    <AutocompleteField
                      value={segment[PlaceField.Origin] || DEFAULT_PLACE}
                      type={PlaceField.Origin}
                      error={errors[PlaceField.Origin]}
                      onSelect={this.handlePlaceChange(PlaceField.Origin, i)}
                      forwardedRef={this.getRef(i, PlaceField.Origin)}
                      allowOpenSearch={false}
                      reachGoal={this.reachGoal}
                    />
                  </div>
                  <div className="of_form_part of_form_part--multiway_destination of_autocomplete">
                    <AutocompleteField
                      value={segment[PlaceField.Destination] || DEFAULT_PLACE}
                      type={PlaceField.Destination}
                      error={errors[PlaceField.Destination]}
                      onSelect={this.handlePlaceChange(PlaceField.Destination, i)}
                      forwardedRef={this.getRef(i, PlaceField.Destination)}
                      allowOpenSearch={false}
                      reachGoal={this.reachGoal}
                    />
                  </div>
                </div>
                <div className="of_form_part--multiway_depart_date">
                  <SingleDatePicker
                    className="--multiway"
                    value={segment.date as Date}
                    isInputActive={isActive}
                    fromMonth={this.getPreviousSegmentDate(i) || minDate}
                    toMonth={maxDate}
                    onSelect={this.handleDateChange(i)}
                    onClose={this.handleDatePickerInteraction(i)}
                    onInputInteration={this.handleDatePickerInteraction(i)}
                    onMonthChange={this.handleMonthChangeSelect(i)}
                    onPreviousClick={this.handleMonthChangeClick(i, 'prev')}
                    onNextClick={this.handleMonthChangeClick(i, 'next')}
                    inputPlaceholder={t('avia_form:departureDateHeaderText')}
                    disabledDays={{
                      before: this.getPreviousSegmentDate(i) || minDate,
                      after: maxDate,
                    }}
                    error={errors.date}
                  />
                </div>
                {removable && (
                  <div
                    className="of_multiway_segment__remove"
                    onClick={this.handleRemoveClick(i)}
                  />
                )}
              </div>
            )
          })}
          {/* there is strange classnames below but we should to reuse it to make consistent markdown */}
          <div className="of_multiway_segment">
            <div className="of_multiway_segment__origin_destination">
              <div className="of_form_part of_form_part--multiway_origin">
                {this.renderSegmentButton()}
              </div>
              <div className="of_form_part of_form_part--multiway_origin --additional-fields">
                <AdditionalFields
                  {...this.props.params.passengers}
                  tripClass={this.props.params.tripClass}
                  onPassengersChange={this.handlePassengersChange()}
                  onTripClassChange={this.handleTripClassChange()}
                  reachGoal={this.props.reachGoal}
                  formType="multiway"
                />
              </div>
            </div>
            <div className="of_form_part--multiway_depart_date">
              <button disabled={this.state.disabled} type="submit" className="of_main_form__submit">
                {t('avia_form:submitButtonText')}
              </button>
            </div>
          </div>
        </div>
        <div className="of_main_form__bottom --multiway">
          <a
            href="#avia"
            data-testid="change-to-avia-form"
            className="of_main_form__change_form_link"
            onClick={this.handleChangeFormClick}
          >
            {t('avia_form:returnToComplexRoute')}
          </a>
        </div>
      </form>
    )
  }

  renderSegmentButton() {
    const { t } = this.props
    if (this.props.params.segments.length < this.props.maxSegmentsSize) {
      return (
        <a
          href="#"
          data-testid="segment-button"
          className="of_multiway_segment__add"
          onClick={this.handleAddSegmentClick}
        >
          + {t('avia_form:addSegment')}
        </a>
      )
    } else {
      return (
        <div className="of_multiway_segment__add is-max" data-testid="segment-button">
          {t('avia_form:maximumSegmentsWarning')}
        </div>
      )
    }
  }
}

export const MultiwayForm = withTranslation('avia_form')(MultiwayFormComponent)

const mapStateToProps = (state) => {
  const tab = state.pageHeader.tabs.multiway || { action: '' }
  return {
    action: tab.action,
    params: state.multiwayParams,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    reachGoal: (event, data) => dispatch(reachGoal(event, data)),
    updateParams: (params: Partial<SearchParams>) => dispatch(updateMultiwayParams(params)),
    updateAviaParams: (params: Partial<SearchParams>) => dispatch(updateAviaParams(params)),
    openAviaForm: () => dispatch(updatePageHeader({ activeForm: 'avia' })),
    multiwayFormSubmit: () => dispatch(multiwayFormSubmit()),
  }
}

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps,
)(MultiwayForm)
