import React, { memo } from 'react'
import clssnms from 'clssnms'
import { ErrorInformerIconType } from './error_informer.types'

import './error_informer.scss'

export const cn = clssnms('error-informer')

export interface ErrorInformerProps {
  children: React.ReactNode
  modifiers?: string[]
  iconType?: ErrorInformerIconType
}

const ErrorInformer: React.FC<ErrorInformerProps> = (props) => {
  const { modifiers = [], children, iconType } = props
  const iconMod = iconType ? `--${iconType}` : ''

  return (
    <div className={cn(null, modifiers)}>
      <div className={cn('container')}>
        <div className={cn('icon', iconMod)} />
        {children}
      </div>
    </div>
  )
}

export default memo(ErrorInformer)
