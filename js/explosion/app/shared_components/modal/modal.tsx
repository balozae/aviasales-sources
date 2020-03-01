import React, { RefObject } from 'react'
import ReactDOM from 'react-dom'
import clssnms from 'clssnms'
import { CSSTransition } from 'react-transition-group'
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock'
import ModalDefaultHeader from './modal_default_header/modal_default_header'

import './modal.scss'

const cn = clssnms('modal')
const OPEN_MODAL_CLASSNAME = 'js-open'
const TRANSITION_CLASSNAMES = {
  enterActive: '--enter-active',
  enterDone: `--enter-done ${OPEN_MODAL_CLASSNAME}`,
  exit: '--exit',
}

let container: HTMLElement | null = null

if (document && document.body) {
  const body = document.body
  container = document.createElement('div')
  body!.appendChild(container)
}

export interface ModalProps {
  animationType: 'up' | 'down' | 'left' | 'right' | 'fade'
  visible: boolean
  overflowClassName: string
  fixedHeader: boolean
  fixedFooter: boolean
  className?: string
  children?: React.ReactNode
  footer?: React.ReactNode
  header?: React.ReactNode
  onClose?: () => void
  withDefaultHeader?: boolean
  keepMounted?: boolean
  onVisibilityChange?: (isVisible: boolean) => void
  onEntered?: (modalRef: React.RefObject<HTMLDivElement>) => void
}

export default class Modal extends React.PureComponent<ModalProps> {
  static defaultProps = {
    overflowClassName: '--modal-overflow-hidden',
    animationType: 'down',
    fixedHeader: true,
    fixedFooter: true,
    keepMounted: false,
  }

  private modalRef: RefObject<HTMLDivElement> = React.createRef()
  private isEnterTransitionDone = false

  onClose = () => {
    if (this.props.onClose) {
      this.props.onClose()
    }
  }

  componentDidUpdate(prevProps: ModalProps) {
    if (this.modalRef.current && prevProps.visible !== this.props.visible) {
      if (this.props.onVisibilityChange) {
        this.props.onVisibilityChange(this.props.visible)
      }
      if (this.props.visible) {
        disableBodyScroll(this.modalRef.current, {
          /**
           * Allow all children of elem with 'body-scroll-lock-ignore' attr
           * to receive touch moves when it used in modal with inited body-scroll-lock
           * see example with our slider (slider.tsx)
           */
          allowTouchMove: (el: HTMLElement) => {
            const nodesToIgnore = this.modalRef.current!.querySelectorAll(
              '[body-scroll-lock-ignore]',
            )
            for (let i = 0; i < nodesToIgnore.length; i++) {
              if (nodesToIgnore[i].contains(el)) {
                return true
              }
            }
          },
        })
      } else {
        enableBodyScroll(this.modalRef.current)
      }
    }
  }

  componentWillUnmount() {
    if (this.modalRef.current) {
      enableBodyScroll(this.modalRef.current)
    }
    this.unsetFixedBackgroundContent()
  }

  onStopPropagation = (e) => {
    e.stopPropagation()
  }

  setFixedBackgroundContent = () => {
    this.fixedBackgroundContent('add')
  }

  unsetFixedBackgroundContent = () => {
    if (container && !container.querySelector(`.${OPEN_MODAL_CLASSNAME}`)) {
      this.fixedBackgroundContent('remove')
    }
  }

  onEnterTransitionEnd = () => {
    this.setFixedBackgroundContent()
    this.isEnterTransitionDone = true
    if (this.props.onEntered) {
      this.props.onEntered(this.modalRef)
    }
  }

  onExitTransitionStart = () => {
    this.unsetFixedBackgroundContent()
    this.isEnterTransitionDone = false
  }

  getHeaderContent = () => {
    if (this.props.withDefaultHeader) {
      return <ModalDefaultHeader title={this.props.header} onClose={this.props.onClose} />
    }

    return this.props.header
  }

  render() {
    if (!container) {
      return null
    }

    const {
      className,
      header,
      footer,
      children,
      fixedFooter,
      fixedHeader,
      visible,
      withDefaultHeader,
      keepMounted,
    } = this.props

    return ReactDOM.createPortal(
      <CSSTransition
        classNames={TRANSITION_CLASSNAMES}
        timeout={500}
        in={visible}
        onEntered={this.onEnterTransitionEnd}
        onExit={this.onExitTransitionStart}
        unmountOnExit={!keepMounted}
      >
        <div
          ref={this.modalRef}
          className={cn(null, [
            `--${this.props.animationType}`,
            className,
            // we need to add TRANSITION_CLASSNAMES.enterDone manually,
            // if animationType or className will change while visible: true
            visible && this.isEnterTransitionDone && TRANSITION_CLASSNAMES.enterDone,
          ])}
          onClick={this.onClose}
          data-testid="modal"
        >
          <div className={cn('wrapper')}>
            <div className={cn('window')} onClick={this.onStopPropagation}>
              {header && (
                <div
                  className={cn('header', {
                    '--sticky': fixedHeader,
                    '--default': !!withDefaultHeader,
                  })}
                >
                  {this.getHeaderContent()}
                </div>
              )}
              {children && <div className={cn('content')}>{children}</div>}
              {footer && <div className={cn('footer', { '--sticky': fixedFooter })}>{footer}</div>}
            </div>
          </div>
        </div>
      </CSSTransition>,
      container,
    )
  }

  private fixedBackgroundContent(method: 'add' | 'remove') {
    try {
      document.getElementsByTagName('html')[0].classList[method](this.props.overflowClassName)
    } catch (e) {
      //
    }
  }
}
