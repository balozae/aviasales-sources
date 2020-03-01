import React from 'react'
import clssnms from 'clssnms'
import { ButtonMod, ButtonType, ButtonSize } from './button.types'

import './button.scss'

const cn = clssnms('b-button')

export interface ButtonProps {
  children: React.ReactNode
  mod: ButtonMod
  type?: ButtonType
  size?: ButtonSize
  className?: string
  disabled?: boolean
  href?: string
  onClick?: (e: React.MouseEvent) => void
  onContextMenu?: (e: React.MouseEvent) => void
  [propName: string]: any
}

const Button: React.SFC<ButtonProps> = (props) => {
  const {
    children,
    className,
    mod,
    href,
    disabled,
    type,
    onClick,
    onContextMenu,
    size,
    ...other
  } = props
  const buttonClasses = cn(null, [className!, `--${mod}`, `--size-${size}`])

  if (href) {
    return (
      <a
        {...other}
        onClick={onClick}
        onContextMenu={onContextMenu}
        className={buttonClasses}
        href={href}
      >
        <span className={cn('text')}>{children}</span>
      </a>
    )
  }

  return (
    <button
      {...other}
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={buttonClasses}
      disabled={disabled}
      type={type}
    >
      <span className={cn('text')}>{children}</span>
    </button>
  )
}

Button.defaultProps = {
  mod: ButtonMod.Primary,
  disabled: false,
  type: ButtonType.Button,
  size: ButtonSize.M,
}

export default Button
