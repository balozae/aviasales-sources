import React, { useCallback, useEffect, useMemo, memo } from 'react'
import { WithTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { AvailableLoginMethods } from 'guestia_client/lib/types'
import { withFlagr } from 'shared_components/flagr/flagr-react'
import flagr from 'common/utils/flagr_client_instance'
import { TicketTuple } from 'shared_components/ticket/ticket_incoming_data.types'
import LoginPopup from './login_popup'
import useLoginContent from 'login_form/login_content.hook'
import { userLogin } from 'user_account/actions/user_info.actions'
import { UserInfoState } from 'user_account/types/user_info.types'
import { reachGoal } from 'common/js/redux/actions/metrics.actions'
import { addPopup, removePopup } from 'common/js/redux/actions/popups.actions'
import { PopupType } from 'common/js/redux/types/popups.types'

interface DirectionSubscriptionPopupProps {
  from: 'direction-subscription'
}

interface TicketSubscriptionPopupProps {
  from: 'ticket-subscription'
  data: TicketTuple
}

interface MainPageLoginButtonPopupProps {
  from: 'mainPageLoginButton'
}

interface DefaultPopupProps {
  from: undefined
}

interface CommonProps {
  isVisible: boolean
  data?: any
}

export type LoginPopupContainerProps = CommonProps &
  WithTranslation &
  (
    | DirectionSubscriptionPopupProps
    | TicketSubscriptionPopupProps
    | DefaultPopupProps
    | MainPageLoginButtonPopupProps)

const LoginPopupContainer: React.FC<LoginPopupContainerProps> = memo((props) => {
  const dispatch = useDispatch()
  const { userInfo } = useSelector((state: { userInfo: UserInfoState }) => ({
    userInfo: state.userInfo,
  }))

  const loginButton = useMemo<HTMLAnchorElement | null>(
    () => document.querySelector('[is="login_button"]'),
    [window.isMainPage, window.isSearchPage],
  )

  const handleLoginButtonClick = useCallback(
    (event) => {
      if (!userInfo.data) {
        event.preventDefault()
        dispatch(
          addPopup({
            popupType: PopupType.LoginForm,
            params: {
              from: 'mainPageLoginButton',
            },
          }),
        )
      }
    },
    [loginButton, userInfo.data],
  )

  useEffect(
    () => {
      if (loginButton) {
        loginButton.addEventListener('click', handleLoginButtonClick)
      }

      return () => {
        if (loginButton) {
          loginButton.removeEventListener('click', handleLoginButtonClick)
        }
      }
    },
    [loginButton, userInfo.data],
  )

  const handleClose = useCallback(() => dispatch(removePopup(PopupType.LoginForm)), [])

  const handleLogin = useCallback(
    async (method: AvailableLoginMethods) => {
      switch (props.from) {
        case 'ticket-subscription':
          dispatch(userLogin(method))
          break

        case 'mainPageLoginButton':
          await dispatch(userLogin(method))
          if (loginButton) {
            window.location.assign(loginButton.href)
          }
          break

        default:
          dispatch(userLogin(method))
          break
      }
    },
    [props.from, loginButton, props.data],
  )

  const handleVisibilityChange = useCallback((isShown: boolean) => {
    // FIXME: idkn where to put this action cuz popups state in store should be refactored soon
    dispatch(reachGoal('login-popup-visibility-change', { isShown }))
  }, [])

  return (
    <LoginPopup
      {...useLoginContent(props.from)}
      isVisible={props.isVisible}
      onClose={handleClose}
      onLoginClick={handleLogin}
      onVisibilityChange={handleVisibilityChange}
      loginMethods={flagr.get('avs-feat-loginMethods').methods}
    />
  )
})

export default withFlagr(flagr, ['avs-feat-loginMethods'])(LoginPopupContainer)
