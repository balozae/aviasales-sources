import React, { useCallback, memo } from 'react'
import clssnms from 'clssnms'
import { useTranslation } from 'react-i18next'
import { ISelectListItemData } from './select_list.types'

import './select_list.scss'

const cn = clssnms('select-list')

const IconCheck = require('!!react-svg-loader!./images/check.svg')

export interface ISelectListItemProps extends ISelectListItemData {
  isSelected: boolean
  onSelect?: (value: ISelectListItemData['value']) => void
  withFlag?: boolean
}

const SelectListItem: React.FC<ISelectListItemProps> = memo((props) => {
  const { value, text, label, link, isSelected, onSelect, withFlag } = props
  const { t } = useTranslation('common')
  const handleClick = useCallback(() => onSelect && onSelect(value), [value, onSelect])

  return (
    <li className={cn('item', { '--is-selected': isSelected })} onClick={handleClick}>
      {label && (
        <p className={cn('label')}>
          {withFlag ? <span className={cn(`flag flag --${value.toLowerCase()}`)} /> : label}
        </p>
      )}
      <p className={cn('text')}>{text}</p>
      {isSelected && <IconCheck className={cn('check')} />}
      {link && (
        <a className={cn('extra')} href={link}>
          <span>{t('common:navigateTo')}</span>
        </a>
      )}
    </li>
  )
})

export default SelectListItem
