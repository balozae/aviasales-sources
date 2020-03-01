import React, { memo } from 'react'
import EmailPopup from 'components/email_popup/email_popup'
import { useTranslation, Trans } from 'react-i18next'

interface Props {
  defaultEmail: string
  visible: boolean
  onSubmit: (email: string) => void
  onClose: () => void
}

const LegalNotice = () => (
  <Trans i18nKey="email_form.legalNotice" ns="subscriptions">
    <a href="//www.aviasales.ru/terms-of-use" target="_blank" rel="noopener noreferrer" />
    <a href="//www.aviasales.ru/privacy" target="_blank" rel="noopener noreferrer" />
  </Trans>
)

const ActivateEmailPopup: React.FC<Props> = (props) => {
  const { t } = useTranslation('subscriptions')

  return (
    <EmailPopup
      defaultEmail={props.defaultEmail}
      visible={props.visible}
      onSubmit={props.onSubmit}
      onClose={props.onClose}
      title={t('email_form.title')}
      submitButtonText={t('email_form.buttonText')}
      placeholder={t('email_form.placeholder')}
      bottomText={<LegalNotice />}
    />
  )
}

export default memo(ActivateEmailPopup)
