import React from 'react'
const CheckboxesList = require('./checkboxes_list').default
const FilterGroup = require('./filter_group').default
const FilterMetrics = require('./checkbox_filter_metrics').default
const Price = require('react_components/price/price')
const IconInfo = require('!!react-svg-loader!assets/images/icon-info.svg')
import Tooltip from 'components/tooltip/tooltip'
import classNames from 'clssnms'
import i18next from 'i18next'
import { TicketData, TicketTuple } from 'shared_components/ticket/ticket_incoming_data.types'
import { FilterNames, UncheckedFilters } from './filters.types'
import defaultResizer, { isMobile } from 'shared_components/resizer'
import './styles/visa_filter.scss'
import Cookie from 'oatmeal-cookie'
import { Boundaries } from './filters.types'
import rollbar from 'common/utils/rollbar'

interface VisaFilterProps {
  unchecked: UncheckedFilters
  t: i18next.TFunction
  name: string
  boundaries: Boundaries
  isLoading?: boolean
  calculateBoundaries: (openedFilters: FilterNames[]) => {}
  onChange(filterState: UncheckedFilters, isChangedByUser?: boolean): void
  onReset(): void
}

interface VisaFilterState {
  isShowTooltip: boolean
}

const cn = classNames('visa-filter')

class VisaFilter extends React.Component<VisaFilterProps, VisaFilterState> {
  state = {
    isShowTooltip: false,
  }

  private isBoundariesPrepared = false
  private IconInfoContainer = React.createRef<HTMLDivElement>()
  private isSmallScreen =
    defaultResizer.currentMode() === 'mobile' ||
    defaultResizer.currentMode() === 'mobileLandscape' ||
    defaultResizer.currentMode() === 'tablet'

  public render() {
    const { unchecked, t, onReset, name, boundaries, isLoading } = this.props

    if (isLoading || (this.isBoundariesPrepared && Object.keys(boundaries).length === 0)) {
      return null
    }

    return (
      <FilterGroup
        className="--visa"
        label={t('filters:titles.visa')}
        initialOpened={true}
        metricsName="VISA"
        onReset={onReset}
        name={name}
        modified={Object.keys(unchecked).length > 0}
      >
        <div className={cn('description')}>
          <p className={cn('description-text')}>{t('visa:filterDescription')}</p>
          <Tooltip
            tooltip={this.getTooltipContent}
            position={this.isSmallScreen ? 'left' : 'right'}
            wrapperClassName={cn('description-tooltip')}
            showDelay={200}
            showByProps={isMobile()}
            isVisible={this.state.isShowTooltip}
          >
            <div ref={this.IconInfoContainer}>
              <IconInfo
                tabIndex={0}
                className={cn('description-tooltip-icon')}
                onClick={this.handleIconInfoClick}
              />
            </div>
          </Tooltip>
        </div>
        <CheckboxesList
          onChange={this.handleChange}
          unchecked={unchecked}
          prefix="visa"
          items={this.getCheckboxesListItems(boundaries)}
        />
      </FilterGroup>
    )
  }

  componentDidMount() {
    this.setCachedFilters()
  }

  componentDidUpdate() {
    if (!this.isBoundariesPrepared && !this.props.isLoading) {
      this.props.calculateBoundaries([FilterNames.Visa])
      this.isBoundariesPrepared = true
    }

    if (this.state.isShowTooltip) {
      window.addEventListener('touchstart', this.handleTouchStart)
      window.addEventListener('touchmove', this.handleTouchMove)
    } else {
      window.removeEventListener('touchstart', this.handleTouchStart)
      window.removeEventListener('touchmove', this.handleTouchMove)
    }
  }

  public filterFunc() {
    const { unchecked } = this.props
    if (Object.keys(unchecked).length === 0) {
      return null
    }

    return ([ticket]: TicketTuple) => {
      for (let x = 0; x < ticket.segment.length; x++) {
        const segment = ticket.segment[x]
        if (segment.transfers) {
          for (let i = 0; i < segment.transfers.length; i++) {
            const transfer = segment.transfers[i]
            if (
              transfer.visa_rules.required &&
              Object.keys(unchecked).includes(transfer.country_code)
            ) {
              return false
            }
          }
        }
      }
      return true
    }
  }

  public reduceFunc(state: Boundaries, [ticket, proposals]: TicketTuple) {
    const visaCountries = this.getVisaRequiredCountries(ticket)
    proposals.forEach(({ unified_price }) => {
      visaCountries.forEach((country) => {
        state[country] = Math.min(state[country] || Infinity, unified_price)
      })
    })

    return state
  }

  private setCachedFilters = () => {
    const unchecked: UncheckedFilters = {}
    const cookieCountries = Cookie.get('cache_visa_filter')
    if (cookieCountries) {
      try {
        const cacheVisaFilter: string[] = JSON.parse(cookieCountries)
        cacheVisaFilter.forEach((countryName) => {
          unchecked[countryName] = true
        })
        this.props.onChange(unchecked, false)
      } catch (error) {
        rollbar.warn('VisaFilter error while set value from cookie', error)
      }
    }
  }

  private handleTouchStart = (event) => {
    if (this.IconInfoContainer.current && !this.IconInfoContainer.current.contains(event.target)) {
      this.setState({ isShowTooltip: !this.state.isShowTooltip })
    }
  }

  private handleTouchMove = () => this.setState({ isShowTooltip: false })
  private handleIconInfoClick = () => this.setState({ isShowTooltip: !this.state.isShowTooltip })

  private getTooltipContent = () => (
    <div className={cn('description-tooltip-content')}>{this.props.t('visa:filterTooltip')}</div>
  )

  private getCheckboxesListItems(boundaries: Boundaries) {
    const { t } = this.props
    return Object.keys(boundaries).reduce((acc, key) => {
      return [
        ...acc,
        {
          key,
          label: t('visa:filterTitle', { country: t(`visa:countries.${key}`) }),
          extra: <Price valueInRubles={boundaries[key]} />,
        },
      ]
    }, [])
  }

  private getVisaRequiredCountries(ticket: TicketData) {
    const visaRequiredCountries: string[] = []
    ticket.segment.forEach((segment) => {
      if (segment.transfers) {
        segment.transfers.forEach((transfer) => {
          if (transfer.visa_rules.required) {
            visaRequiredCountries.push(transfer.country_code)
          }
        })
      }
    })

    return visaRequiredCountries
  }

  private handleChange = (
    unchecked: UncheckedFilters,
    changes /* array with object keys and values, i.e. — [].GB */,
  ) => {
    // @ts-ignore
    this.metricsSend('VISA', changes)
    this.props.onChange(unchecked)
  }
}

export default FilterMetrics(VisaFilter)
