import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '../trip_duration'
import { TripDurationTab } from '../trip_duration.types'

import '../trip_duration.scss'

const IconCalendar = require('!!react-svg-loader!../images/icon-calendar.svg')
const IconMonth = require('!!react-svg-loader!../images/icon-month.svg')
const IconDuration = require('!!react-svg-loader!../images/icon-duration.svg')

type IconMapType = { [key in TripDurationTab]: any }

const iconMap: IconMapType = {
  calendar: IconCalendar,
  months: IconMonth,
  'range-slider': IconDuration,
}

export interface DropdownTabsProps {
  tabs: ReadonlyArray<TripDurationTab>
  currentTab: TripDurationTab
  onTabClick: (tab: TripDurationTab) => void
}

const DropdownTabs: React.FC<DropdownTabsProps> = ({ tabs, currentTab, onTabClick }) => {
  const { t } = useTranslation('trip_duration')

  const handleTabClick = useCallback(
    (tab: TripDurationTab) => () => {
      if (tab !== currentTab) {
        onTabClick(tab)
      }
    },
    [currentTab, onTabClick],
  )

  return (
    <div className={cn('tabs')}>
      {tabs.map((tab) => {
        const Icon = iconMap[tab]

        return (
          <button
            key={tab}
            type="button"
            className={cn('tab', {
              '--active': tab === currentTab,
            })}
            onClick={handleTabClick(tab)}
          >
            <Icon className={cn('tab-icon')} />
            {t(`trip_duration:mode.${tab}`)}
          </button>
        )
      })}
    </div>
  )
}

export default DropdownTabs
