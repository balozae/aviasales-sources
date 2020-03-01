import React, { FC, HTMLProps } from 'react'
import clssnms from 'clssnms'
import './arrow_button.scss'

const IconArrow = require('!!react-svg-loader!./images/arrow.svg')

const cn = clssnms('arrow-button')

interface ArrowButtonProps extends HTMLProps<HTMLButtonElement> {
  className?: string
  position: 'left' | 'right'
  withSYS?: boolean
}

const ArrowButton: FC<ArrowButtonProps> = ({
  className = '',
  position,
  withSYS = true,
  ...restProps
}) => {
  return (
    <button
      {...restProps}
      type={restProps.type as 'submit' | 'reset' | 'button' | undefined}
      className={cn(null, { [className]: true, [`--${position}`]: true, '--with-sys': withSYS })}
    >
      <IconArrow className={cn('icon')} />
    </button>
  )
}

ArrowButton.defaultProps = {
  position: 'left',
}

export default ArrowButton
