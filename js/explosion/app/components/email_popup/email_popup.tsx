import React from 'react'
import clssnms from 'clssnms'
import Modal from 'shared_components/modal/modal'
import EmailForm, { EmailFormProps } from './email_form'
import ModalDefaultHeader from 'shared_components/modal/modal_default_header/modal_default_header'

import './email_popup.scss'

const cn = clssnms('email-popup')

type EmailPopupProps = {
  visible: boolean
  onClose: () => void
} & EmailFormProps

const EmailPopup: React.FC<EmailPopupProps> = (props) => {
  const { visible, onClose, ...formProps } = props
  return (
    <Modal
      visible={props.visible}
      onClose={props.onClose}
      fixedHeader={false}
      className={cn()}
      header={<ModalDefaultHeader onClose={props.onClose} className="--no-border" />}
    >
      <div className={cn('content')}>
        <EmailForm {...formProps} />
      </div>
    </Modal>
  )
}

export default EmailPopup
