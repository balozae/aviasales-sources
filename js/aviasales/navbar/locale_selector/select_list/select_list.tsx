import React, { useState, useCallback, memo } from 'react'
import clssnms from 'clssnms'
import { SelectListData } from './select_list.types'
import SelectListItem, { ISelectListItemProps } from './select_list_item'

import './select_list.scss'

const cn = clssnms('select-list')

export interface ISelectListProps {
  items: SelectListData
  value?: ISelectListItemProps['value']
  onSelect?: ISelectListItemProps['onSelect']
  withFlags?: boolean
  className?: string
}

const SelectList: React.FC<ISelectListProps> = memo((props) => {
  const { items, value, onSelect, withFlags, className } = props
  const [currentValue, setValue] = useState(value ? value : items[0].value)
  const handleSelect = useCallback(
    (itemValue) => {
      setValue(itemValue)

      if (onSelect) {
        onSelect(itemValue)
      }
    },
    [onSelect],
  )

  return (
    <ul className={cn(null, className)}>
      {items.map((item) => (
        <SelectListItem
          {...item}
          key={item.value}
          isSelected={currentValue === item.value}
          onSelect={handleSelect}
          withFlag={withFlags}
        />
      ))}
    </ul>
  )
})

export default SelectList
