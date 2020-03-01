import React from 'react'
const CheckboxesList = require('./checkboxes_list').default
const FilterGroup = require('./filter_group').default
const FilterMetrics = require('./checkbox_filter_metrics').default
import IconInfo from '!!react-svg-loader!assets/images/icon-info.svg'
import classNames from 'clssnms'
import i18next from 'i18next'
import { TicketData, TicketTuple } from 'shared_components/ticket/ticket_incoming_data.types'
import { FilterNames, UncheckedFilters } from './filters.types'
import defaultResizer, { isMobile } from 'shared_components/resizer'
import './styles/china_filter.scss'
import Cookie from 'oatmeal-cookie'
import Tooltip from 'shared_components/tooltip/tooltip'
import {
  CHINA_FILTER_COOKIE_KEY,
  CHINA_COUNTRY_CODE,
} from 'components/filters/types/china_filter.types'
import { Boundaries } from './filters.types'

interface ChinaFilterProps {
  unchecked: UncheckedFilters
  t: i18next.TFunction
  name: string
  boundaries: Boundaries
  isTicketsAlreadyRendered: boolean
  calculateBoundaries: (openedFilters: FilterNames[]) => {}
  onChange(filterState: UncheckedFilters, isChangedByUser?: boolean): void
  onReset(): void
}

interface ChinaFilterState {
  isShowTooltip: boolean
  modifiedByUser: boolean
}

const cn = classNames('china-filter')

class ChinaFilter extends React.Component<ChinaFilterProps, ChinaFilterState> {
  state = {
    isShowTooltip: false,
    modifiedByUser: false,
  }

  private IconInfoContainer = React.createRef<HTMLDivElement>()
  private isSmallScreen =
    defaultResizer.currentMode() === 'mobile' ||
    defaultResizer.currentMode() === 'mobileLandscape' ||
    defaultResizer.currentMode() === 'tablet'

  public render() {
    const { unchecked, t, onReset, name, boundaries } = this.props

    if (!Object.keys(boundaries).length) {
      return null
    }

    return (
      <FilterGroup
        className="--china"
        label={t('filters:titles.china')}
        initialOpened={true}
        metricsName="CHINA"
        onReset={onReset}
        name={name}
        modified={false}
      >
        <div className={cn('description')}>
          <p className={cn('description-text')}>{t('china_filter:filterDescription')}</p>
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
          prefix="china"
          items={this.getCheckboxesListItems(boundaries)}
          showUncheckOther={false}
        />
      </FilterGroup>
    )
  }

  componentDidMount() {
    this.setCachedFilters()
  }

  componentDidUpdate() {
    if (this.state.isShowTooltip) {
      window.addEventListener('touchstart', this.handleTouchStart)
      window.addEventListener('touchmove', this.handleTouchMove)
    } else {
      window.removeEventListener('touchstart', this.handleTouchStart)
      window.removeEventListener('touchmove', this.handleTouchMove)
    }

    if (this.state.modifiedByUser || !this.props.isTicketsAlreadyRendered) {
      return
    }
    if (!this.props.boundaries) {
      return
    }
    if (this.props.unchecked.china === true) {
      return
    }
    const chinaFilterState = Cookie.get(CHINA_FILTER_COOKIE_KEY)
    if (chinaFilterState && chinaFilterState === 'true') {
      const unchecked: UncheckedFilters = { china: true }
      this.props.onChange(unchecked, false)
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
            if (transfer.country_code === 'CN' && Object.keys(unchecked).includes('china')) {
              return false
            }
          }
        }
      }
      return true
    }
  }

  public reduceFunc(state: Boundaries, [ticket, proposals]: TicketTuple) {
    const isChinaTicket = this.isChinaTicket(ticket)
    if (isChinaTicket) {
      proposals.forEach(({ unified_price }) => {
        state.china = Math.min(state.china || Infinity, unified_price)
      })
    }

    return state
  }

  private setCachedFilters = () => {
    const unchecked: UncheckedFilters = {}
    const chinaFilterState = Cookie.get(CHINA_FILTER_COOKIE_KEY)
    if (chinaFilterState && chinaFilterState === 'true') {
      unchecked.china = true
      this.props.onChange(unchecked, false)
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
    <div className={cn('description-tooltip-content')}>
      {this.props.t('china_filter:filterTooltip')}
    </div>
  )

  private getCheckboxesListItems(boundaries: Boundaries) {
    const { t } = this.props
    return Object.keys(boundaries).reduce((acc, key) => {
      return [
        ...acc,
        {
          key,
          label: t('china_filter:filterText'),
        },
      ]
    }, [])
  }

  private isChinaTicket(ticket: TicketData) {
    for (let i = 0; i < ticket.segment.length; i++) {
      const segment = ticket.segment[i]
      if (segment.transfers) {
        for (let u = 0; u < segment.transfers.length; u++) {
          const transfer = segment.transfers[u]
          if (transfer.country_code === CHINA_COUNTRY_CODE) {
            return true
          }
        }
      }
    }
    return false
  }

  private handleChange = (
    unchecked: UncheckedFilters,
    changes /* array with object keys and values, i.e. — [].GB */,
  ) => {
    // @ts-ignore
    this.metricsSend('CHINA', changes)
    this.setState({ modifiedByUser: true })
    this.props.onChange(unchecked)
  }
}

export default FilterMetrics(ChinaFilter)
