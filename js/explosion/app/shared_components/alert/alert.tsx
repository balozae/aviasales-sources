import React, { forwardRef } from 'react'
import clssnms from 'clssnms'
import Button from 'shared_components/button/button'
import { ButtonMod } from 'shared_components/button/button.types'
import { AlertType } from './alert.types'

import './alert.scss'

import IconClose from '!!react-svg-loader!./images/close.svg'

const cn = clssnms('alert')

export type AlertRefElement = HTMLDivElement

export interface AlertProps {
  description: React.ReactNode
  type?: AlertType
  actions?: React.ReactNode
  showIcon?: boolean
  closable?: boolean
  onClose?: () => void
  className?: string
  alertIcon?: React.ReactNode
}

const Alert = forwardRef<AlertRefElement, AlertProps>((props, alertRef) => {
  const {
    description,
    type = AlertType.Info,
    actions,
    showIcon = true,
    closable = false,
    onClose,
    className,
    alertIcon,
  } = props

  return (
    <div className={cn('', [`--${type}`, className])} ref={alertRef}>
      <div className={cn('content')}>
        {showIcon && (
          <div className={cn('icon-wrap')}>
            {alertIcon ? alertIcon : <i className={cn('icon')} />}
          </div>
        )}
        <div className={cn('text')}>
          <div className={cn('description')}>{description}</div>
        </div>
        {actions && <div className={cn('actions')}>{actions}</div>}
        {closable && (
          <Button className={cn('btn-close')} mod={ButtonMod.Ghost} onClick={onClose}>
            <IconClose className={cn('close-icon')} />
          </Button>
        )}
      </div>
    </div>
  )
})

interface AlertActionButtonProps {
  onClick: () => void
  children: React.ReactNode
  disabled?: boolean
  className?: string
}

export const AlertActionButton: React.FC<AlertActionButtonProps> = (props) => {
  return (
    <Button
      className={cn('btn-action', props.className)}
      mod={ButtonMod.Ghost}
      onClick={props.onClick}
      disabled={props.disabled}
    >
      {props.children}
    </Button>
  )
}

export default Alert
