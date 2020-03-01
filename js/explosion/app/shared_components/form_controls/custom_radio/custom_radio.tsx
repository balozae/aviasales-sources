import React from 'react'
import clssnms from 'clssnms'

import './custom_radio.scss'

const cn = clssnms('custom-radio')

export interface CustomRadioProps {
  value: string
  inputId: string
  active: boolean
  name: string
  caption: string | React.ReactNode
  onChange: (event: React.FormEvent<HTMLInputElement>) => void
  modifiers?: string[]
  icon?: React.ReactNode
  hasError?: boolean
}

const CustomRadio: React.FC<CustomRadioProps> = (props) => {
  const { inputId, active, caption, modifiers = [], icon, hasError, ...inputProps } = props
  return (
    <label
      className={cn(null, [...modifiers, hasError && '--error', active && '--is-active'])}
      htmlFor={inputId}
    >
      <input {...inputProps} type="radio" id={inputId} className={cn('input')} checked={active} />
      <div className={cn('element')} />
      {icon && <div className={cn('icon')}>{icon}</div>}
      <div className={cn('caption')}>{caption}</div>
    </label>
  )
}

export default CustomRadio
