import React, { useCallback, useEffect, useRef } from 'react'
import { CSSTransition } from 'react-transition-group'
import clssnms from 'clssnms'
import './dropdown_desktop.scss'

export interface DropdownDesktopProps {
  children: React.ReactElement
  isVisible: boolean
  onClose: () => void
  labelRef: HTMLElement | null
  position?: 'top' | 'bottom' | 'left' | 'right' | 'bottom-right' | 'bottom-left'
  contentClassName?: string
  hideArrow?: boolean
}

const TRANSITION_CLASSNAMES = {
  enter: '--enter',
  enterActive: '--enter-active',
  exit: '--exit',
  exitActive: '--exit-active',
}

const cn = clssnms('dropdown-desktop')

export const DropdownDesktop: React.FC<DropdownDesktopProps> = (props) => {
  const {
    isVisible,
    children,
    labelRef,
    position,
    contentClassName = '',
    hideArrow = false,
  } = props
  const contentRef = useRef<HTMLDivElement>(null)

  const handleWindowClick = useCallback(
    (event) => {
      if (labelRef && labelRef.contains(event.target)) {
        return
      }

      if (contentRef.current && contentRef.current.contains(event.target)) {
        return
      }

      if (props.onClose) {
        props.onClose()
      }
    },
    [labelRef],
  )

  useEffect(
    () => {
      if (isVisible) {
        window.addEventListener('click', handleWindowClick)
      }

      return () => {
        if (isVisible) {
          window.removeEventListener('click', handleWindowClick)
        }
      }
    },
    [isVisible, handleWindowClick],
  )

  return (
    <CSSTransition
      classNames={TRANSITION_CLASSNAMES}
      appear={true}
      timeout={{ enter: 300, exit: 300 }}
      in={isVisible}
      unmountOnExit={true}
    >
      <div
        className={cn(null, {
          [`--${position}`]: true,
          '--hide-arrow': hideArrow,
        })}
      >
        <div ref={contentRef} className={cn('content', contentClassName)}>
          {children}
        </div>
        <div className={cn('arrow-wrapper')}>
          <div className={cn('arrow')} />
        </div>
      </div>
    </CSSTransition>
  )
}
