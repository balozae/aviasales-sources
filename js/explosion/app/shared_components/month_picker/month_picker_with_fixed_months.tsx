import React from 'react'
import MonthPicker, { MonthPickerProps } from './month_picker'
import { format } from 'finity-js'
import { getDateFromMonthKey } from './month_picker.utils'

export interface IMonthPickerWithFixedMonthsProps
  extends Pick<MonthPickerProps, 'getItemChild' | 'onComponentDidMount'> {
  initialMonths: MonthPickerProps['value']
  value?: Date[]
  onSelect?: (months: Date[]) => void
  onToggleAllClick?: (months: Date[]) => void
}

interface IMonthPickerWithFixedMonthsState extends MonthPickerProps {
  value: MonthPickerProps['value']
}

class MonthPickerWithFixedMonths extends React.PureComponent<
  IMonthPickerWithFixedMonthsProps,
  IMonthPickerWithFixedMonthsState
> {
  state = {
    value: this.props.initialMonths,
  }

  static getDerivedStateFromProps(
    props: IMonthPickerWithFixedMonthsProps,
    state: IMonthPickerWithFixedMonthsState,
  ) {
    // TODO доделать если изменился initialMonths
    // Проставить то, что уже отмечено
    /*if (state.prevInitialMonths !== props.initialMonths) {
        const newState = Object.assign({}, state, {})

        return {
          value: props.initialMonths,
          prevInitialMonths: props.initialMonths
        }
      }*/

    // TODO: wtf ??? what's the point of such a check?
    // @ts-ignore
    if (props.value && props.value !== state.prevValue) {
      const newState = Object.assign({}, state, {})
      // Создаем временную мапу что бы не обходить каждый раз массив заново
      const tmpValueIndexes = props.value.reduce((acc, date) => {
        let value = format(date, 'YYYY-M')
        acc[value] = true
        return acc
      }, {})

      newState.value = newState.value.map((value) => {
        value.isSelected = tmpValueIndexes[value.month]
        return value
      })

      return newState
    }

    return null
  }

  onSelect = (clickedMonth: string) => {
    const { onSelect } = this.props

    const months = this.state.value.reduce(
      (acc, value) => {
        let addMonth = value.isSelected

        if (value.month === clickedMonth) {
          addMonth = !value.isSelected
        }

        if (addMonth) {
          acc.push(getDateFromMonthKey(value.month))
        }

        return acc
      },
      [] as Date[],
    )

    if (onSelect) {
      onSelect(months)
    }
  }

  onToggleAllClick = (isAllSelected: boolean) => {
    const { onToggleAllClick } = this.props

    let months = [] as Date[]

    if (!isAllSelected) {
      months = this.state.value.reduce(
        (acc, value) => {
          acc.push(getDateFromMonthKey(value.month))
          return acc
        },
        [] as Date[],
      )
    }

    if (onToggleAllClick) {
      onToggleAllClick(months)
    }
  }

  render() {
    return (
      <MonthPicker
        {...this.props}
        value={this.state.value}
        onSelect={this.onSelect}
        onToggleAllClick={this.onToggleAllClick}
      />
    )
  }
}

export default MonthPickerWithFixedMonths
