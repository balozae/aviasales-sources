import React, { SyntheticEvent } from 'react'
import clssnms from 'clssnms'
import { FormTab } from './form_tab.types'
import { FormType } from 'form/types'

const cn = clssnms('form-tabs')

interface StateProps extends FormTab {
  isActive: boolean
  showDiscountLabel?: boolean
}

interface DispatchProps {
  onInnerTab: (tabId: FormType, event: SyntheticEvent) => void
  onOuterTab: (tabId: FormType, event: SyntheticEvent) => void
}

class FormTabComponent extends React.PureComponent<StateProps & DispatchProps> {
  static defaultProps = {
    onInnerTab: () => {
      //
    },
    onOuterTab: () => {
      //
    },
  }

  onInnerLinkClick = (event: SyntheticEvent) => {
    this.props.onInnerTab(this.props.tabName, event)
  }

  onOuterLinkClick = (event: SyntheticEvent) => {
    if (this.props.tabName === 'insurance') {
      const pixel = new Image()
      const rnd = Math.round(Math.random() * 1000000)
      const src = `https://mc.yandex.ru/pixel/1786324714807966243?rnd=${rnd}`
      pixel.setAttribute('width', '1')
      pixel.setAttribute('height', '1')
      pixel.setAttribute('src', src)
    }
    this.props.onOuterTab(this.props.tabName, event)
  }

  render() {
    const { isActive, tabName, title, link, tooltip, showDiscountLabel } = this.props

    return (
      <li
        className={cn('item', [
          `--${tabName}`,
          isActive && 'is-active',
          showDiscountLabel && '--discount-label',
        ])}
      >
        {tooltip && (
          <div
            className={cn(`${tabName}-tab-tooltip`)}
            onClick={this.onInnerLinkClick}
            onTouchEnd={this.onInnerLinkClick}
          >
            {tooltip}
          </div>
        )}
        {!!link ? (
          <a
            className={cn('link')}
            href={link}
            target="_blank"
            onClick={this.onOuterLinkClick}
            rel="nofollow"
            data-goal={`${tabName}Tab`}
            data-testid="form_tabs_outer_link"
          >
            {title}
          </a>
        ) : (
          <a
            className={cn('link', { 'is-active': isActive })}
            onClick={this.onInnerLinkClick}
            onTouchEnd={this.onInnerLinkClick}
            href={`#${tabName}`}
            data-goal={`${tabName}Tab`}
            data-testid="form_tabs_inner_link"
          >
            {title}
          </a>
        )}
      </li>
    )
  }
}

export default FormTabComponent
