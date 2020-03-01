import React from 'react'
import clssnms from 'clssnms'

import './spinner.scss'

const cn = clssnms('spinner')

export interface SpinnerProps {
  mod?: 'primary' | 'white'
  size?: 's' | 'm'
  className?: string
}

const Spinner: React.SFC<SpinnerProps> = (props) => {
  const { className, mod, size } = props
  const spinnerClasses = cn(null, [className!, `--${mod}`, `--size-${size}`])

  return (
    <div className={spinnerClasses}>
      <svg className={cn('svg')} viewBox="0 0 50 50">
        <circle className={cn('circle')} cx="25" cy="25" r="20" fill="none" />
      </svg>
    </div>
  )
}

Spinner.defaultProps = {
  mod: 'primary',
  size: 'm',
}

export default Spinner
