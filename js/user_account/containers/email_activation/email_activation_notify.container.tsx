import React from 'react'
import { EmailActivationResulStatus } from 'user_account/types/email_activation.types'
import { emailActivationNotifyClose } from 'user_account/actions/email_activation.actions'
import { connect } from 'react-redux'
import { AppStateUA } from 'user_account/types/app.types'
import { Dispatch, bindActionCreators } from 'redux'
import { getEmailActivationResult } from 'user_account/selectors/email_activation.selectors'
import { getIsAuthorized } from 'user_account/selectors/user.selectors'
import Alert, { AlertActionButton } from 'shared_components/alert/alert'
import { Trans, useTranslation } from 'react-i18next'
import { AlertType } from 'shared_components/alert/alert.types'

interface OwnProps {}
type StateProps = {
  isAuthorised: boolean
  email: string | null
  status: EmailActivationResulStatus
}

interface DispatchProps {
  emailActivationNotifyClose: typeof emailActivationNotifyClose
}

type EmailActivationContainerProps = StateProps & DispatchProps & OwnProps

const EmailActivationContainer: React.FC<EmailActivationContainerProps> = (props) => {
  const { t } = useTranslation('subscriptions')

  const textKey = [
    'subscriptions:emailActivationResult',
    props.isAuthorised ? 'authorized' : 'unauthorized',
    props.status,
  ].join('.')

  return (
    <Alert
      description={
        <Trans i18nKey={textKey} tOptions={{ email: props.email }}>
          <strong />
        </Trans>
      }
      type={props.status === 'ok' ? AlertType.Success : AlertType.Error}
      actions={
        <AlertActionButton onClick={props.emailActivationNotifyClose}>
          {t('emailActivationResult.okButton')}
        </AlertActionButton>
      }
      showIcon={true}
    />
  )
}

const mapStateToProps = (state: AppStateUA): StateProps => ({
  ...getEmailActivationResult(state)!,
  isAuthorised: getIsAuthorized(state as any),
})
const mapDispatchToProps = (dispatch: Dispatch): DispatchProps =>
  bindActionCreators({ emailActivationNotifyClose }, dispatch)

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(EmailActivationContainer)
