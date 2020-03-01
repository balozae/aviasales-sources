import React from 'react'
import clssnms from 'clssnms'
import { withTranslation, WithTranslation } from 'react-i18next'
import Informer, { InformerProps } from 'components/informer/informer'
import { ButtonMod } from 'shared_components/button/button.types'

import './informer_collapse.scss'

const cn = clssnms('informer-collapse')

export interface InformerCollapseProps extends Pick<InformerProps, 'title' | 'icon'> {
  className?: string
  onActionCallback?: (isOpen: boolean) => void
  isOpen?: boolean
  classMod?: string
}

interface InformerCollapseState {
  isOpen: boolean
}

class InformerCollapse extends React.Component<
  InformerCollapseProps & WithTranslation,
  InformerCollapseState
> {
  collapsedContent: React.RefObject<HTMLDivElement> = React.createRef()

  state: InformerCollapseState = {
    isOpen: false,
  }

  static getDerivedStateFromProps(
    props: InformerCollapseProps & WithTranslation,
    state: InformerCollapseState,
  ) {
    if (props.isOpen && state.isOpen !== props.isOpen) {
      return {
        isOpen: props.isOpen,
      }
    }

    return null
  }

  handleBtnClick = () => {
    if (this.state.isOpen) {
      this.collapseContent()
    } else {
      this.expandContent()
    }

    if (this.props.onActionCallback) {
      this.props.onActionCallback(this.state.isOpen)
    }
  }

  collapseContent() {
    if (!this.collapsedContent.current) {
      return
    }
    const element = this.collapsedContent.current
    const elementHeight = element.scrollHeight
    const elementTransition = element.style.transition
    element.style.transition = ''

    requestAnimationFrame(() => {
      element.style.height = elementHeight + 'px'
      element.style.transition = elementTransition

      requestAnimationFrame(() => {
        element.style.height = ''
        this.setState({ isOpen: false })
      })
    })
  }

  expandContent() {
    if (!this.collapsedContent.current) {
      return
    }
    const element = this.collapsedContent.current
    const elementHeight = element.scrollHeight
    element.style.height = elementHeight + 'px'

    const onTransitionend = () => {
      element.removeEventListener('transitionend', onTransitionend)
      element.style.height = ''
    }

    element.addEventListener('transitionend', onTransitionend)
    this.setState({ isOpen: true })
  }

  render() {
    const { t, title, icon, classMod, children, className } = this.props
    const { isOpen } = this.state
    const actionLabel = isOpen ? t('common:rollUp') : t('common:show')
    const actionContent = (
      <>
        {actionLabel} <i className={cn('btn-triangle')} />
      </>
    )

    return (
      <div
        className={cn(null, {
          ['--is-open']: isOpen,
          [`--${classMod}`]: !!classMod,
          [className!]: !!className,
        })}
      >
        <div className={cn('header')} onClick={this.handleBtnClick}>
          <Informer
            title={title}
            action={{ content: actionContent, mod: ButtonMod.Link }}
            icon={icon}
            classMod="small"
          />
        </div>
        <div className={cn('collapse')} ref={this.collapsedContent}>
          <div className={cn('collapse-content')}>{children}</div>
        </div>
      </div>
    )
  }
}

export default withTranslation('common')(InformerCollapse)
