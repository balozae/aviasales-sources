import React, { memo } from 'react'
import clssnms from 'clssnms'

import './modal_default_header.scss'

const IconClose = require('!!react-svg-loader!common/images/icon-close.svg')

const cn = clssnms('modal-default-header')

interface ModalDefaultHeaderProps {
  title?: React.ReactNode
  onClose?: () => void
  className?: string
  extraContent?: React.ReactNode
}

export const ModalDefaultHeader: React.FC<ModalDefaultHeaderProps> = (props) => {
  const { title, onClose, className, extraContent } = props

  return (
    <div className={cn('', className)}>
      {extraContent}
      {title && <h3 className={cn('title')}>{title}</h3>}
      {onClose && (
        <button className={cn('btn-close')}>
          <IconClose className={cn('btn-close-icon')} onClick={onClose} />
        </button>
      )}
    </div>
  )
}

export default memo(ModalDefaultHeader)
