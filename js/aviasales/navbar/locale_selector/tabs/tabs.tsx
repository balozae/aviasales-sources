import React, { useState, memo, useCallback } from 'react'
import clssnms from 'clssnms'
import { ITabData } from './tabs.types'

import './tabs.scss'

const cn = clssnms('tabs')

export interface ITabsProps {
  tabs: ITabData[]
  activeTabId?: string
  onTabChange?: (tabId: string) => void
  className?: string
}

const Tabs: React.FC<ITabsProps> = memo((props) => {
  const { tabs, activeTabId, onTabChange } = props
  let activeTabIndex = 0

  if (activeTabId) {
    activeTabIndex = tabs.findIndex((tab) => tab.id === activeTabId)
  }

  const [currentTab, setTab] = useState(~activeTabIndex ? activeTabIndex : 0)

  const onTabControlClick = useCallback(
    (index: number, tabId: string = '') => {
      setTab(index)

      if (onTabChange) {
        onTabChange(tabId)
      }
    },
    [setTab, onTabChange],
  )

  return (
    <div className={cn(null, props.className)}>
      <div className={cn('controls')}>
        {tabs.length > 1 &&
          tabs.map((tab, i) => (
            <div
              className={cn('control', { '--is-selected': i === currentTab })}
              key={tab.id || i}
              onClick={() => onTabControlClick(i, tab.id)}
            >
              <p className={cn('control-title')}>{tab.title}</p>
              <p className={cn('control-subtitle')}>{tab.subtitle}</p>
            </div>
          ))}
      </div>
      <div className={cn('items')}>
        {tabs.map((tab, i) => (
          <div className={cn('item', { '--is-visible': i === currentTab })} key={tab.id || i}>
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  )
})

export default Tabs
