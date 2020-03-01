import React, { memo } from 'react'
import clssnms from 'clssnms'

import './styled_input.scss'

const cn = clssnms('styled-input')

interface StyledInputProps {
  forwardedRef?: React.Ref<HTMLInputElement>
}

type Props = StyledInputProps & React.InputHTMLAttributes<HTMLInputElement>

const StyledInput: React.FC<Props> = (props) => {
  const { className, forwardedRef, ...inputProps } = props
  return <input {...inputProps} className={cn(null, [className])} ref={forwardedRef} />
}

export default memo(StyledInput)
