import React, { useState, useRef } from 'react'
import clssnms from 'clssnms'
import defaultResizer, { useResizerOnEnter } from 'shared_components/resizer'
import Modal from 'shared_components/modal/modal'
import { DropdownDesktop, DropdownDesktopProps } from './dropdown_desktop/dropdown_desktop'

import './dropdown.scss'

const cn = clssnms('dropdown')
const mediaQueryModesMapping = {
  mobile: 'mobile',
  mobileLandscape: 'mobile',
  tablet: 'desktop',
  desktop: 'desktop',
}

export interface DropdownProps {
  children: React.ReactElement
  visible: boolean
  dropdownContent: React.ReactElement
  onClose: () => void
  modalHeader?: React.ReactNode
  dropdownPosition?: DropdownDesktopProps['position']
  hideArrow?: boolean
  className?: string
  contentClassName?: string
}

const Dropdown: React.FC<DropdownProps> = (props) => {
  const {
    dropdownPosition = 'bottom-left',
    children,
    onClose,
    modalHeader,
    hideArrow,
    dropdownContent,
    visible,
    className = '',
    contentClassName = '',
  } = props
  const mediaQueryType = useResponsive()

  const childRef = useRef<HTMLElement>(null)

  const isModalVisible = mediaQueryType === 'mobile' && visible
  const isTooltipVisible = mediaQueryType !== 'mobile' && visible

  return (
    <div className={cn(null, className)}>
      {React.cloneElement(children, {
        ref: childRef,
      })}
      <Modal
        visible={isModalVisible}
        onClose={onClose}
        header={modalHeader}
        fixedHeader={true}
        animationType={'right'}
        withDefaultHeader={true}
      >
        {dropdownContent}
      </Modal>
      <DropdownDesktop
        hideArrow={hideArrow}
        isVisible={isTooltipVisible}
        onClose={onClose}
        labelRef={childRef.current}
        position={dropdownPosition}
        contentClassName={contentClassName}
      >
        {dropdownContent}
      </DropdownDesktop>
    </div>
  )
}

const useResponsive = () => {
  const [mediaQueryType, setMediaQueryType] = useState(
    mediaQueryModesMapping[defaultResizer.currentMode() || 'desktop'],
  )
  const hanleMediaQueryTypeChange = (meadiaQueryKey: string) => {
    setMediaQueryType(mediaQueryModesMapping[meadiaQueryKey])
  }
  useResizerOnEnter(hanleMediaQueryTypeChange)

  return mediaQueryType
}

export default Dropdown
