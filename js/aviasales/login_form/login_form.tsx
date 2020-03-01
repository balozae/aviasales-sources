import React, { useCallback } from 'react'
import clssnms from 'clssnms'
import { Trans, withTranslation, WithTranslation } from 'react-i18next'
import { AvailableLoginMethods } from 'guestia_client/lib/types'
import './login_form.scss'

const cn = clssnms('login-form')

export interface LoginFormContentProps {
  image?: any
  title: string
  description?: string
  caption?: string
  className?: string
}

type LoginFormProps = WithTranslation &
  LoginFormContentProps & {
    onLoginClick: (method: AvailableLoginMethods) => void
    loginMethods: ReadonlyArray<AvailableLoginMethods>
  }

const LoginForm: React.FC<LoginFormProps> = (props) => {
  const Image = props.image

  return (
    <div className={cn(null, props.className)}>
      <Image className={cn('image')} />
      <h3 className={cn('title')}>{props.title}</h3>
      {props.description && <p className={cn('description')}>{props.description}</p>}
      {props.caption && <p className={cn('caption')}>{props.caption}</p>}
      <div className={cn('buttons')}>
        {props.loginMethods.map((method) => (
          <SocialButton key={method} method={method} onLoginClick={props.onLoginClick} />
        ))}
      </div>
      <p className={'legal-notice'}>
        <Trans i18nKey="acceptRules" ns="login_form">
          <a
            href="/terms-of-use"
            className={'legal-notice__link'}
            target="_blank"
            rel="noopener noreferrer"
          />
          <a
            href="/privacy"
            className={cn('legal-notice__link')}
            target="_blank"
            rel="noopener noreferrer"
          />
        </Trans>
      </p>
    </div>
  )
}

const SocialButton: React.FC<{
  method: AvailableLoginMethods
  onLoginClick: LoginFormProps['onLoginClick']
}> = ({ method, onLoginClick }) => {
  const handleClick = useCallback(
    () => {
      onLoginClick(method)
    },
    [method, onLoginClick],
  )
  return <span className={cn('login-button', `--${method}`)} onClick={handleClick} />
}

export default withTranslation('login_form')(LoginForm)
