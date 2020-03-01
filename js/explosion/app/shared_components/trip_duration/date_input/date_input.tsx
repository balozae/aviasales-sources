import React, { useCallback } from 'react'
import { cn } from '../trip_duration'
import { TripDurationInput } from '../trip_duration.types'

import '../trip_duration.scss'

const IconCross = require('!!react-svg-loader!../images/icon-cross.svg')

export interface DateInputProps {
  type?: TripDurationInput
  value: string
  active?: boolean
  readonly?: boolean
  placeholder?: string
  onClick?: () => void
  onFocus?: () => void
  onBlur?: () => void
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onClear?: () => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  error?: { message: string }
  required?: boolean
  testId?: string
}

const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  (
    {
      type,
      value,
      active,
      readonly,
      placeholder,
      onClick,
      onFocus,
      onChange,
      onBlur,
      onClear,
      onKeyDown,
      error,
      required,
      testId,
    },
    ref,
  ) => {
    const handleClick = useCallback(
      () => {
        if (onClick) {
          onClick()
        }
      },
      [onClick],
    )

    const handleFocus = useCallback(
      () => {
        if (onFocus) {
          onFocus()
        }
      },
      [onFocus],
    )

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        if (onChange) {
          onChange(e)
        }
      },
      [onChange],
    )

    const handleBlur = useCallback(
      () => {
        if (onBlur) {
          onBlur()
        }
      },
      [onBlur],
    )

    const handleClear = useCallback(
      () => {
        if (onClear) {
          onClear()
        }
      },
      [onClear],
    )

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (onKeyDown) {
          onKeyDown(e)
        }
      },
      [onKeyDown],
    )

    return (
      <div
        className={cn('field', { [`--${type}`]: true, '--error': !!error })}
        data-error-message={error && error.message}
      >
        <div
          className={cn('input-wrapper', `--${type}`)}
          onClick={handleClick}
          data-testid={testId}
        >
          <input
            className={cn('date-input', { '--active': !!active, '--error': !!error })}
            placeholder={placeholder || ''}
            onFocus={handleFocus}
            onChange={handleChange}
            onBlur={handleBlur}
            value={value}
            ref={ref}
            readOnly={readonly}
            onKeyDown={handleKeyDown}
          />
        </div>
        {!required && value && onClear ? (
          <button className={cn('field-clear')} onClick={handleClear} type="button">
            <IconCross />
          </button>
        ) : null}
      </div>
    )
  },
)

export default React.memo(DateInput)
