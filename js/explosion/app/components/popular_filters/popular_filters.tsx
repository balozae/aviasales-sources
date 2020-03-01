import React from 'react'
import clssnms from 'clssnms'
import Tooltip from 'components/tooltip/tooltip'
import {
  PopularFilter,
  FilterData,
  PopularFiltersLogicTypes,
  ChosenFilters,
} from './popular_filters.types'
import { FilterNames } from '../filters/filters.types'
import { getFilterState, transformPopularFiltersData } from './popular_filters.utils'
import { Map } from 'common/base_types'
import { Trans, withTranslation, WithTranslation } from 'react-i18next'
const IconInfo = require('!!react-svg-loader!assets/images/icon-info.svg')

import './popular_filters.scss'

const cn = clssnms('popular-filters')

export interface PopularFiltersProps {
  popularFilters: PopularFilter[]
  boundaries: Map<any>
  onChange: (
    filterName: string,
    filterState: any,
    changedByUser?: boolean,
    isChangedFromPopularFilters?: boolean,
  ) => void
  airlinesInfo: Map<any>
  airportsInfo: Map<any>
  gatesInfo: Map<any>
  reachGoal: (event: string, data?: any) => void
  routeArray: string[]
  isLoading?: boolean
  calculateBoundaries: (boundaries: FilterNames[]) => void
  filters: { [key in FilterNames]: any }
}

interface PopularFiltersState {
  filters: FilterData[] | undefined
  chosenFilters: ChosenFilters
  isDataPrepared: boolean
}

class PopularFilters extends React.PureComponent<
  PopularFiltersProps & WithTranslation,
  PopularFiltersState
> {
  initialState: PopularFiltersState = {
    filters: [],
    chosenFilters: {},
    isDataPrepared: false,
  }
  isBoundariesPrepared: boolean = false
  isFiltersFiltered: boolean = false
  isComponentShowed: boolean = false

  state: PopularFiltersState = this.initialState

  static getDerivedStateFromProps(props: PopularFiltersProps, state: PopularFiltersState) {
    if (!props.isLoading && !state.isDataPrepared) {
      const filters = transformPopularFiltersData(props.popularFilters, {
        airlinesInfo: props.airlinesInfo,
        airportsInfo: props.airportsInfo,
        gatesInfo: props.gatesInfo,
      })

      return {
        filters,
        isDataPrepared: true,
      }
    }

    return null
  }

  componentDidUpdate(
    prevProps: PopularFiltersProps & WithTranslation,
    prevState: PopularFiltersState,
  ) {
    if (prevProps.t !== this.props.t) {
      // Update filters when lang changed
      return this.setState(
        {
          filters: transformPopularFiltersData(this.props.popularFilters, {
            airlinesInfo: this.props.airlinesInfo,
            airportsInfo: this.props.airportsInfo,
            gatesInfo: this.props.gatesInfo,
          }),
        },
        () => {
          /**
           * Called this fn because state filters updated
           */
          this.updateFiltersByBoundaries()
        },
      )
    }

    if (
      !this.props.isLoading &&
      !this.isBoundariesPrepared &&
      this.state.isDataPrepared &&
      this.state.filters &&
      this.state.filters.length
    ) {
      let boundariesToCalculate = this.state.filters.map((filter) => filter.filterName)
      boundariesToCalculate = Array.from(new Set(boundariesToCalculate))
      this.props.calculateBoundaries(boundariesToCalculate)
      this.isBoundariesPrepared = true
    }

    if (
      !this.props.isLoading &&
      !this.isFiltersFiltered &&
      this.isBoundariesPrepared &&
      this.props.boundaries !== prevProps.boundaries
    ) {
      this.updateFiltersByBoundaries()
    }

    // send event 'showed' only when we still have state.filters
    // after compare with boundaries and filtering
    if (
      !this.isComponentShowed &&
      this.state.filters &&
      this.state.filters.length &&
      this.isFiltersFiltered
    ) {
      const filtersForEventData = this.state.filters.map(this.prepareEventData)
      this.reachGoal('showed', { filters: filtersForEventData })
      this.isComponentShowed = true
    }
  }

  updateFiltersByBoundaries() {
    if (!this.state.filters) {
      return
    }
    // compare state.filters with boundaries to remove values which dosn't exist in boundaries
    const filters = this.state.filters.reduce((result: FilterData[], filter: FilterData) => {
      const currentFilterBoundary = this.props.boundaries[filter.filterName]
      let boundaryNames = Object.keys(currentFilterBoundary)

      // boundaries.gates has specific structure
      if (filter.filterName === FilterNames.Gates) {
        const gatesBoundaryRu = currentFilterBoundary.ru || {}
        const gatesBoundaryOther = currentFilterBoundary.other || {}
        boundaryNames = [...Object.keys(gatesBoundaryRu), ...Object.keys(gatesBoundaryOther)]
      }

      if (boundaryNames.includes(filter.name)) {
        result.push(filter)
      }
      return result
    }, [])

    this.setState({ filters })
    this.isFiltersFiltered = true
  }

  reachGoal = (event: string, data?: any) => {
    this.props.reachGoal(`popular_filters--${event}`, data)
  }

  prepareEventData(filter: FilterData) {
    return {
      name: filter.filterName,
      logicType: filter.filterLogicType,
      value: filter.name,
    }
  }

  headerTooltipContent = () => (
    <div className={cn('header-tooltip-content')}>
      {this.props.t('popular_filters:tooltip', {
        departureIATA: this.props.routeArray[0],
        arrivalIATA: this.props.routeArray[1],
      })}
    </div>
  )

  filterTooltipContent = (tooltipText: string) => () => (
    <div className={cn('filter-tooltip-content')}>{tooltipText}</div>
  )

  handleResetAllFilters = () => {
    if (!Object.keys(this.state.chosenFilters).length) {
      return
    }

    const { filters = [] } = this.state
    const newFilters = filters.map((filter) => ({ ...filter, isChosen: false }))

    this.setState({
      filters: newFilters,
      chosenFilters: {},
    })
  }

  handleResetFilter = (filterName: FilterNames) => {
    if (!Object.keys(this.state.chosenFilters).length) {
      return
    }

    const { filters = [], chosenFilters } = this.state
    const filtersToRefresh: Set<FilterNames> = new Set()
    const newFilters = filters.map((filter) => {
      if (filter.filterName === filterName) {
        filtersToRefresh.add(filter.filterName)
        return {
          ...filter,
          isChosen: false,
        }
      }
      return filter
    })
    let newChosenFilters = { ...chosenFilters }

    if (filtersToRefresh.size) {
      newChosenFilters = Object.keys(chosenFilters).reduce((result, filterKey: FilterNames) => {
        if (!filtersToRefresh.has(filterKey)) {
          result[filterKey] = chosenFilters[filterKey]
        }
        return result
      }, {})
    }

    this.setState({
      filters: newFilters,
      chosenFilters: newChosenFilters,
    })
  }

  handleClick = (filterIndex: number) => () => {
    this.setState((prevState) => {
      const { filters, chosenFilters } = prevState
      const currentFilter = filters![filterIndex]
      let newChosenFilters = { ...chosenFilters }

      if (!currentFilter.isChosen) {
        // add currentFilter.name to chosen filters
        if (currentFilter.filterLogicType === PopularFiltersLogicTypes.AllExceptOne) {
          newChosenFilters[currentFilter.filterName] = {
            type: currentFilter.filterLogicType,
            values: [currentFilter.name],
          }
        } else {
          let prevChosenFilterValue = []
          if (
            chosenFilters[currentFilter.filterName] &&
            chosenFilters[currentFilter.filterName].type === PopularFiltersLogicTypes.OnlyOne
          ) {
            prevChosenFilterValue = chosenFilters[currentFilter.filterName].values || []
          }
          newChosenFilters[currentFilter.filterName] = {
            type: currentFilter.filterLogicType,
            values: [...prevChosenFilterValue, currentFilter.name],
          }
        }
      } else {
        // remove currentFilter.name from chosen filters
        newChosenFilters[currentFilter.filterName].values = chosenFilters[
          currentFilter.filterName
        ].values.filter((valueName: string) => valueName !== currentFilter.name)
      }

      // set/unset 'isChosen' field based on newChosenFilters
      const newFilters = filters!.map((filter) => {
        if (filter.filterName === currentFilter.filterName) {
          if (
            filter.filterLogicType === currentFilter.filterLogicType &&
            newChosenFilters[currentFilter.filterName].values.includes(filter.name)
          ) {
            return {
              ...filter,
              isChosen: true,
            }
          } else {
            return {
              ...filter,
              isChosen: false,
            }
          }
        }

        return filter
      })

      // prepare filterState for passing to main filters component state
      const filterState = getFilterState(
        currentFilter.filterName,
        this.props.boundaries[currentFilter.filterName],
        newChosenFilters[currentFilter.filterName],
        this.props.filters,
      )

      this.props.onChange(currentFilter.filterName, filterState, true, true)
      this.reachGoal('clicked', {
        filter: this.prepareEventData(currentFilter),
        value: !currentFilter.isChosen,
      })

      return {
        filters: newFilters,
        chosenFilters: newChosenFilters,
      }
    })
  }

  render() {
    const { filters, isDataPrepared } = this.state
    const { isLoading, routeArray, popularFilters, t } = this.props

    if (!popularFilters.length || (isDataPrepared && (!filters || !filters.length))) {
      return null
    }

    return (
      <div className={cn()}>
        <div className={cn('header')}>
          <h3 className={cn('title')}>
            <Trans
              i18nKey="title"
              ns="popular_filters"
              values={{
                departureIATA: routeArray[0],
                arrivalIATA: routeArray[1],
              }}
            >
              <span className={cn('title-route')} />
            </Trans>
          </h3>
          <Tooltip
            tooltip={this.headerTooltipContent}
            position="right"
            wrapperClassName={cn('header-tooltip')}
            showDelay={200}
          >
            <IconInfo className={cn('header-tooltip-icon')} />
          </Tooltip>
        </div>
        <div className={cn('body')}>
          {isLoading ? (
            <div className={cn('loading')}>
              <p className={cn('loading-text')}>
                {t('common:loading', { ns: 'common' })}
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </p>
            </div>
          ) : (
            <ul className={cn('list')}>
              {filters!.map((filter, index) => (
                <li
                  key={filter.filterLogicType + filter.label + filter.name}
                  className={cn('list-item')}
                >
                  <Tooltip
                    tooltip={this.filterTooltipContent(filter.tooltipText)}
                    position="top"
                    wrapperClassName={cn('filter-tooltip')}
                    showDelay={200}
                  >
                    <button
                      onClick={this.handleClick(index)}
                      className={cn('filter', { ['--is-chosen']: !!filter.isChosen })}
                      type="button"
                    >
                      {filter.label}
                    </button>
                  </Tooltip>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    )
  }
}

export default withTranslation(
  ['popular_filters', 'baggage', 'stops', 'airlines', 'payment', 'gates'],
  { withRef: true },
)(PopularFilters)
