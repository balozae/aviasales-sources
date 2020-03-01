import React, { memo } from 'react'
import clssnms from 'clssnms'
import { useTranslation } from 'react-i18next'
import { NotifyIconType, NotifyColorType } from './notify.types'
import IconClose from '!!react-svg-loader!./img/close.svg'

import './styles/notify.scss'

export const cn = clssnms('notify')

export interface NotifyProps {
  children: React.ReactNode
  modifiers?: string[]
  iconType?: NotifyIconType
  colorType: NotifyColorType
  onClose?: () => void
  closeText?: string
}

const Notify: React.FC<NotifyProps> = (props) => {
  const { t } = useTranslation('notify')
  const DEFAULT_CLOSE_TEXT = t('notify:close')
  const {
    modifiers = [],
    children,
    iconType,
    onClose,
    colorType,
    closeText = DEFAULT_CLOSE_TEXT,
  } = props

  const withIconMod = iconType ? `--with-icon` : ''
  const withCloseMod = onClose ? '--with-close' : ''

  return (
    <div className={cn(null, [...modifiers, `--${colorType}`, withIconMod, withCloseMod])}>
      {iconType ? <div className={cn('icon', `--${iconType}`)} /> : null}
      <div className={cn('container')}>
        {children}
        {onClose && (
          <button className={cn('button', ['--outline', '--close'])} onClick={onClose}>
            {closeText}
          </button>
        )}
      </div>
      {onClose ? <IconClose className={cn('close')} onClick={onClose} /> : null}
    </div>
  )
}

export default memo(Notify)
