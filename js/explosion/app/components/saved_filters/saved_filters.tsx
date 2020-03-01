import React from 'react'
import { connect } from 'react-redux'
import clssnms from 'clssnms'
import { withTranslation, WithTranslation, Trans } from 'react-i18next'
import Informer from 'components/informer/informer'
import { InformerIcon } from 'components/informer/informer.types'
import { ButtonMod } from 'shared_components/button/button.types'
import tripHelper from 'trip_helper.coffee'
import localStorageHelper from 'local_storage_helper.coffee'
import filterLabels from 'components/filter_message/filter_labels'
import { addPopup } from 'common/js/redux/actions/popups.actions'
import { reachGoal } from 'common/js/redux/actions/metrics.actions'
const IconChecked = require('!!react-svg-loader!./images/icon-checked.svg')
import './saved_filters.scss'
import { PopupType } from 'common/js/redux/types/popups.types'

const HIDE_AFTER_MS = 2000

const parseDate = (dateStr): Date => {
  let dateArr = dateStr.split('-')

  dateArr = dateArr.map((item, j) => {
    if (j === 1) {
      return parseInt(item, 10) - 1
    }
    return parseInt(item, 10)
  })

  return new Date(dateArr[0], dateArr[1], dateArr[2])
}

const normalizeDepartureArrivalFilter = ({ filters, dates }, searchParams) =>
  searchParams.segments.map((segment, i) => {
    const filterSegment = filters[i]
    if (!filterSegment || dates[i] === segment.date) {
      return filterSegment
    }

    const date: number = Number(parseDate(dates[i]))
    const newDate: number = Number(parseDate(segment.date))
    const delta = (newDate - date) / 1000
    const newFilterSegment = { ...filterSegment }

    if (newFilterSegment.departureRange && newFilterSegment.departureRange.min) {
      newFilterSegment.departureRange.min += delta
    }
    if (newFilterSegment.departureRange && newFilterSegment.departureRange.max) {
      newFilterSegment.departureRange.max += delta
    }
    if (newFilterSegment.arrivalRange && newFilterSegment.arrivalRange.min) {
      newFilterSegment.arrivalRange.min += delta
    }
    if (newFilterSegment.arrivalRange && newFilterSegment.arrivalRange.max) {
      newFilterSegment.arrivalRange.max += delta
    }

    return newFilterSegment
  })

const cn = clssnms('saved-filters')

interface StateProps {
  searchParams: {
    segments: {
      origin: string
      destination: string
      date: string
    }[]
  }
  filters: any[]
  filtersChangedByUser: string[]
  savedFiltersHighlighted: boolean
}

interface DispatchProps {
  addSavedFilters: (filter: any) => void
  addPopup: () => void
  reachGoal: (event: string, data?: any) => void
}

export type SavedFiltersProps = StateProps & DispatchProps

interface SavedFiltersState {
  savedFilters: any
  isApplied: boolean
  isHidden: boolean
}

export class SavedFilters extends React.Component<
  SavedFiltersProps & WithTranslation,
  SavedFiltersState
> {
  routeArray: string[]
  savedFiltersAllRoutes: {}
  savedFiltersKey: string
  timeoutHide: number

  constructor(props: SavedFiltersProps & WithTranslation) {
    super(props)

    this.routeArray = tripHelper.getRouteArray(this.props.searchParams)
    const routeKey = this.routeArray.join('-')
    this.savedFiltersKey = `${routeKey}-${this.props.searchParams.segments.length}`
    this.savedFiltersAllRoutes = localStorageHelper.getJSONItem('savedFilters') || {}

    let savedFilters
    if (
      this.savedFiltersAllRoutes[this.savedFiltersKey] &&
      Object.keys(this.savedFiltersAllRoutes[this.savedFiltersKey]).length > 0
    ) {
      savedFilters = this.savedFiltersAllRoutes[this.savedFiltersKey]
      this.props.reachGoal('SAVED_FILTERS_SHOWN', { savedFilters: Object.keys(savedFilters) })

      const isOnboarded = localStorageHelper.getItem('savedFiltersOnboarded') || ''
      if (!isOnboarded) {
        this.props.reachGoal('SAVED_FILTERS_ONBOARD_SHOWN')
        this.props.addPopup()
      }
    }

    this.state = {
      savedFilters,
      isApplied: false,
      isHidden: false,
    }
  }

  componentDidUpdate(prevProps: SavedFiltersProps) {
    // when user close onboard popup we should blink widget and sent metric
    if (prevProps.savedFiltersHighlighted !== this.props.savedFiltersHighlighted) {
      this.props.reachGoal('SAVED_FILTERS_ONBOARD_CLOSED')
    }

    const { filtersChangedByUser } = this.props
    if (
      filtersChangedByUser.length > 0 &&
      prevProps.filtersChangedByUser !== filtersChangedByUser
    ) {
      this.saveChangedFilters()
    }
  }

  saveChangedFilters() {
    const { filtersChangedByUser, filters, searchParams } = this.props
    let changedFilters: any = filtersChangedByUser

    if (this.state.isApplied) {
      // merge filters changed by user and filters changed by applying saved filters
      changedFilters = new Set([...changedFilters, ...Object.keys(this.state.savedFilters)])
      changedFilters = Array.from(changedFilters)
    }

    let savedFilters
    if (changedFilters.length >= 1) {
      savedFilters = {}
      changedFilters.forEach((changedFilter) => {
        let filterVal = filters[changedFilter]
        if (changedFilter === 'departureArrival') {
          if (!filterVal || !filterVal.filter(Boolean).length) {
            return
          }
          filterVal = {
            filters: filters[changedFilter],
            dates: searchParams.segments.map((segment) => segment.date),
          }
        }

        savedFilters[changedFilter] = filterVal
      })
    }

    this.savedFiltersAllRoutes[this.savedFiltersKey] = savedFilters || null
    localStorageHelper.setJSONItem('savedFilters', this.savedFiltersAllRoutes)
  }

  componentWillUnmount() {
    clearTimeout(this.timeoutHide)
  }

  applySavedFilters = () => {
    this.setState({ isApplied: true })
    this.timeoutHide = window.setTimeout(() => {
      this.setState({ isHidden: true })
    }, HIDE_AFTER_MS)

    const { savedFilters } = this.state

    Object.keys(savedFilters).forEach((savedFilterKey) => {
      if (savedFilterKey === 'departureArrival') {
        savedFilters[savedFilterKey] = normalizeDepartureArrivalFilter(
          savedFilters[savedFilterKey],
          this.props.searchParams,
        )
      }
    })

    this.props.addSavedFilters(savedFilters)

    this.props.reachGoal('SAVED_FILTERS_APPLIED', { savedFilters: Object.keys(savedFilters) })
  }

  render() {
    if (!this.state.savedFilters) {
      return null
    }

    const { t } = this.props

    const filterKeys = Object.keys(this.state.savedFilters)

    const actionContent = t('saved_filters:applyFilters', { filtersCount: filterKeys.length })

    const title = (
      <Trans
        i18nKey="title"
        ns="saved_filters"
        components={[<span key="route" className={cn('route')} />]}
        values={{ route: this.routeArray.join(' - ') }}
      />
    )

    const content = (
      <>
        {t('saved_filters:content')}{' '}
        <strong>
          {filterKeys.map((filter) => t(`filters:titles.${filterLabels[filter]}`)).join(', ')}
        </strong>
      </>
    )

    return (
      <div
        className={cn(null, {
          '--is-hidden': this.state.isHidden,
          '--is-highlighted': this.props.savedFiltersHighlighted,
        })}
      >
        <Informer
          title={title}
          classMod="action-link"
          action={{
            content: actionContent,
            onAction: this.applySavedFilters,
            mod: ButtonMod.Link,
          }}
          icon={InformerIcon.Filter}
        >
          {content}
        </Informer>
        <div
          className={cn('applied', {
            '--show': this.state.isApplied,
          })}
        >
          <IconChecked className={cn('applied-icon')} />
          <p className={cn('applied-title')}>{t('saved_filters:filtersApplied')}</p>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state): StateProps => ({
  searchParams: state.searchParams,
  filters: state.filters.filters,
  filtersChangedByUser: state.filters.filtersChangedByUser,
  savedFiltersHighlighted: state.savedFiltersHighlighted,
})

const mapDispatchToProps = (dispatch): DispatchProps => ({
  addSavedFilters: (savedFilters) => dispatch({ type: 'ADD_SAVED_FILTERS', savedFilters }),
  addPopup: () => dispatch(addPopup({ popupType: PopupType.SavedFilters })),
  reachGoal: (event, data) => dispatch(reachGoal(event, data)),
})

export const SavedFiltersWithTranslation = withTranslation(['saved_filters', 'filters'])(
  SavedFilters,
)

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps,
)(SavedFiltersWithTranslation)
