import React, { memo } from 'react'
import SuccessPopup from 'components/success_popup/success_popup'
import { useTranslation } from 'react-i18next'

interface SuccessEmailActivationPopupProps {
  visible: boolean
  onClose: () => void
}

const SuccessEmailActivationPopup: React.FC<SuccessEmailActivationPopupProps> = (props) => {
  const { t } = useTranslation('subscriptions')

  return (
    <SuccessPopup
      {...props}
      title={t('success_popup.title')}
      caption={t('success_popup.caption')}
      buttonText={t('success_popup.buttonText')}
    />
  )
}

export default memo(SuccessEmailActivationPopup)
