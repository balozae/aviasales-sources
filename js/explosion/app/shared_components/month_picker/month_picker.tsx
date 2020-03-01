import React from 'react'
import clssnms from 'clssnms'
import { MonthPickerValue } from './month_picker.types'
import MonthPickerItem from './month_picker_item'
import { withTranslation, WithTranslation } from 'react-i18next'

import './month_picker.scss'

const cn = clssnms('month-picker')

export interface MonthPickerProps {
  value: MonthPickerValue
  onSelect?: (monthKey: string, isSelected: boolean) => void
  onToggleAllClick?: (isAllSelected: boolean) => void
  onComponentDidMount?: () => void
  getItemChild?: (month: string) => React.ReactNode
}

class MonthPicker extends React.PureComponent<MonthPickerProps & WithTranslation> {
  componentDidMount() {
    if (this.props.onComponentDidMount) {
      this.props.onComponentDidMount()
    }
  }

  handleItemClick = (month: string, isSelected: boolean) => {
    if (this.props.onSelect) {
      this.props.onSelect(month, isSelected)
    }
  }

  getAllSelected() {
    return this.props.value.every(({ isSelected }) => isSelected)
  }

  getToggleText() {
    return this.getAllSelected() ? this.props.t('cancelChooseAll') : this.props.t('chooseAll')
  }

  handleToggleAll = () => {
    if (this.props.onToggleAllClick) {
      this.props.onToggleAllClick(this.getAllSelected())
    }
  }

  render() {
    return (
      <div className={cn()}>
        <div className={cn('header')}>
          <div className={cn('toggle-all')} onClick={this.handleToggleAll}>
            {this.getToggleText()}
          </div>
        </div>
        <div className={cn('body')}>
          {this.props.value.map((item) => (
            <MonthPickerItem
              key={item.month}
              {...item}
              onClick={this.handleItemClick}
              getChild={this.props.getItemChild}
            />
          ))}
        </div>
      </div>
    )
  }
}

export default withTranslation('month_picker')(MonthPicker)
