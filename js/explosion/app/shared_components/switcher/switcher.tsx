import React, { useCallback } from 'react'
import clssnms from 'clssnms'

import './switcher.scss'

const cn = clssnms('switcher')

export interface SwitcherProps {
  label?: string
  className?: string
  onChange?: (checked: boolean) => void
  checked?: boolean
}

const Switcher: React.FC<SwitcherProps> = ({ label, onChange, className, checked }) => {
  const handleChange = useCallback(
    () => {
      if (onChange) {
        onChange(!checked)
      }
    },
    [checked],
  )

  return (
    <label className={cn('', { '--checked': !!checked, [`${className}`]: !!className })}>
      <input className={cn('input')} type="checkbox" checked={checked} onChange={handleChange} />
      {label && <span className={cn('label')}>{label}</span>}
    </label>
  )
}

export default Switcher
