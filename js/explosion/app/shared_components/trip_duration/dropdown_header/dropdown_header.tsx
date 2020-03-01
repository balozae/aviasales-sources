import React, { useCallback } from 'react'
import Button from 'shared_components/button/button'
import { ButtonMod } from 'shared_components/button/button.types'
import { cn } from '../trip_duration'
import { TripDurationInput } from '../trip_duration.types'

import '../trip_duration.scss'

export interface DropdownHeaderProps {
  title?: string
  clearBtnText?: string
  onCancelClick?: () => void
  isClearbBtnDisabled?: boolean
}

const DropdownHeader: React.FC<DropdownHeaderProps> = ({
  title,
  clearBtnText,
  onCancelClick,
  isClearbBtnDisabled = false,
}) => {
  const handleCancelClick = useCallback(
    () => {
      if (onCancelClick) {
        onCancelClick()
      }
    },
    [onCancelClick],
  )

  return (
    <div className={cn('content-head')}>
      {title && <span className={cn('content-title')}>{title}</span>}
      {clearBtnText && (
        <Button
          className={cn('cancel-departure')}
          mod={ButtonMod.PrimaryOutline}
          onClick={handleCancelClick}
          disabled={isClearbBtnDisabled}
        >
          {clearBtnText}
        </Button>
      )}
    </div>
  )
}

export default DropdownHeader
