import React from 'react'
import Modal from 'shared_components/modal/modal'
import Button from 'shared_components/button/button'
import { ButtonMod, ButtonSize } from 'shared_components/button/button.types'
const IconClose = require('!!react-svg-loader!common/images/icon-close.svg')
import TicketIcon from '../ticket_icon/ticket_icon'
import clssnms from 'clssnms'
import { IconColors, IconSizes, IconTypes } from '../ticket_icon/ticket_icon.types'
const cn = clssnms('ticket-confirm')

import './ticket_confirm.scss'

export interface TicketConfirmProps {
  visible: boolean
  icon?: IconTypes
  header?: string
  title?: string
  text?: string
  confirmText: string
  cancelText: string
  onConfirm?: () => void
  onCancel?: (type: string) => void
}

export default class TicketConfirm extends React.PureComponent<TicketConfirmProps> {
  onConfirm = () => {
    if (this.props.onConfirm) {
      this.props.onConfirm()
    }
  }

  onCancel = (type) => () => {
    if (this.props.onCancel) {
      this.props.onCancel(type)
    }
  }

  getHeader = () =>
    this.props.header && (
      <div className={cn('header')}>
        <p className={cn('header-text')}>{this.props.header}</p>
        <span className={cn('header-close', '--desktop')} onClick={this.onCancel('cross')} />
        <IconClose className={cn('header-close', '--mobile')} onClick={this.onCancel('cross')} />
      </div>
    )

  render() {
    return (
      <Modal
        header={this.getHeader()}
        visible={this.props.visible}
        animationType="up"
        onClose={this.onCancel('overlay')}
      >
        <div className={cn()}>
          {this.props.icon && (
            <div className={cn('icon')}>
              <TicketIcon type={this.props.icon} size={IconSizes.L} color={IconColors.White} />
            </div>
          )}
          {this.props.title && <h3 className={cn('title')}>{this.props.title}</h3>}
          {this.props.text && <p className={cn('text')}>{this.props.text}</p>}
          <div className="ticket-confirm-buttons">
            <Button
              className="ticket-confirm-buttons__button"
              mod={ButtonMod.Secondary}
              size={ButtonSize.M}
              onClick={this.onCancel('button')}
            >
              {this.props.cancelText}
            </Button>
            <Button
              className="ticket-confirm-buttons__button"
              mod={ButtonMod.Secondary}
              size={ButtonSize.M}
              onClick={this.onConfirm}
            >
              {this.props.confirmText}
            </Button>
          </div>
        </div>
      </Modal>
    )
  }
}
