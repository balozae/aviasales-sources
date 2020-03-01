import React from 'react'
import clssnms from 'clssnms'
import { AvailableLoginMethods } from 'guestia_client/lib/types'
import Modal from 'shared_components/modal/modal'
import ModalDefaultHeader from 'shared_components/modal/modal_default_header/modal_default_header'
import './login_popup.scss'
import LoginForm, { LoginFormContentProps } from 'login_form/login_form'

const cn = clssnms('login-popup')

interface LoginPopupProps extends LoginFormContentProps {
  isVisible: boolean
  loginMethods: ReadonlyArray<AvailableLoginMethods>
  onLoginClick: (method: AvailableLoginMethods) => void
  onClose: () => void
  onVisibilityChange?: (isVisible: boolean) => void
}

const LoginPopup: React.FC<LoginPopupProps> = (props) => (
  <Modal
    visible={props.isVisible}
    onClose={props.onClose}
    onVisibilityChange={props.onVisibilityChange}
    header={<ModalDefaultHeader onClose={props.onClose} className={'--no-border'} />}
  >
    <div className={cn()}>
      <LoginForm
        title={props.title}
        caption={props.caption}
        description={props.description}
        image={props.image}
        onLoginClick={props.onLoginClick}
        loginMethods={props.loginMethods}
      />
    </div>
  </Modal>
)

export default LoginPopup
