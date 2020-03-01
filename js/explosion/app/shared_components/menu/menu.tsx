import React from 'react'
import clssnms from 'clssnms'
import MenuItem, { MenuItemProps } from './menu_item'

import './menu.scss'

export const cn = clssnms('menu')

export interface MenuProps {
  items: MenuItemProps[]
  type?: 'vertical' | 'horizontal'
  className?: string
}

const Menu: React.FC<MenuProps> = ({ items, type = 'vertical', className }) => {
  return (
    <div className={cn(null, { className: !!className, [`--${type}`]: true })}>
      <ul className={cn('list')}>
        {items.map((itemProps) => (
          <MenuItem key={itemProps.text} {...itemProps} />
        ))}
      </ul>
    </div>
  )
}

export default React.memo(Menu)
