import React from 'react'
import clssnms from 'clssnms'
import { useTranslation } from 'react-i18next'
import { withFlagr } from 'shared_components/flagr/flagr-react'
import flagr from 'common/utils/flagr_client_instance'
import { UserInfo, AvailableLoginMethods, EmailStatus } from 'guestia_client/lib/types'
import Spinner from 'components/spinner/spinner'
import NavbarUserMenu from './navbar_user_menu'
import GoalKeeper from 'common/bindings/goalkeeper'
import LoginForm from 'login_form/login_form'
import useLoginContent from 'login_form/login_content.hook'
// import Gift from 'free_ticket/gift/gift'
import Dropdown from 'shared_components/dropdown/dropdown'

import './navbar_user.scss'

const cn = clssnms('navbar-user')

export interface NavbarUserProps {
  userInfo: UserInfo | null
  isUserInfoFetching: boolean
  userPromosCount?: number
  onDropdown?: (isShown: boolean) => void
  onLoginClick: (method: AvailableLoginMethods) => void
  onLogoutClick: () => void
}

interface NavbarUserState {
  isGiftAnimated: boolean
  isDropdownVisible: boolean
}

class NavbarUser extends React.PureComponent<NavbarUserProps, NavbarUserState> {
  state: NavbarUserState = {
    isGiftAnimated: true,
    isDropdownVisible: false,
  }

  handleMenuLinkClick = (name: string) => () => {
    GoalKeeper.triggerEvent('user_profile', 'menu', `${name}_top`)
    this.closeDropdown()
  }

  toggleDropdown = () => {
    this.setState(({ isDropdownVisible }) => {
      const newIsDropdownVisible = !isDropdownVisible

      if (this.props.onDropdown) {
        this.props.onDropdown(newIsDropdownVisible)
      }

      return { isDropdownVisible: newIsDropdownVisible, isGiftAnimated: false }
    })
  }

  closeDropdown = () => {
    if (this.props.onDropdown) {
      this.props.onDropdown(false)
    }
    this.setState({ isDropdownVisible: false, isGiftAnimated: false })
  }

  getUserPhoto = () => {
    if (this.props.userInfo && this.props.userInfo.details) {
      const photos = this.props.userInfo.details.photos || {}
      return photos.small || photos.medium || photos.max
    }

    return null
  }

  getDropdownContent = () => {
    if (this.props.userInfo) {
      return (
        <div className={cn('content')}>
          <div className={cn('menu')}>
            <NavbarUserMenu
              userPromosCount={this.props.userPromosCount}
              showEmailActivationNotify={
                this.props.userInfo.email_info.activation_status === EmailStatus.Pending
              }
              onLinkClick={this.handleMenuLinkClick}
              onLogoutClick={this.props.onLogoutClick}
            />
          </div>
        </div>
      )
    }

    return (
      <NavbarUserLogin
        onLoginClick={this.props.onLoginClick}
        loginMethods={flagr.get('avs-feat-loginMethods').methods}
      />
    )
  }

  renderNotify() {
    const isLoading = this.props.isUserInfoFetching
    const isLoggedIn = !isLoading && !!this.props.userInfo
    const showUserPromosCount = isLoggedIn && this.props.userPromosCount
    const isUserEmailPending =
      !!this.props.userInfo &&
      this.props.userInfo.email_info.activation_status === EmailStatus.Pending
    const notifyClassName = cn('notify')

    if (showUserPromosCount) {
      return <div className={notifyClassName}>{this.props.userPromosCount}</div>
    } else if (isUserEmailPending) {
      return <div className={`${notifyClassName} --warning`}>!</div>
    } else {
      return null
    }
  }

  render() {
    const isLoading = this.props.isUserInfoFetching
    const isLoggedIn = !isLoading && !!this.props.userInfo
    const userPhoto = this.getUserPhoto()
    // const showGift = !isLoggedIn && !isLoading && flagr.is('avs-exp-newYear')

    return (
      <Dropdown
        visible={this.state.isDropdownVisible}
        dropdownContent={this.getDropdownContent()}
        onClose={this.closeDropdown}
        modalHeader={<ModalHeader />}
      >
        <button
          className={cn('', {
            '--loading': isLoading,
            '--logged-in': isLoggedIn,
            // '--gift': showGift,
          })}
          onClick={this.toggleDropdown}
          type="button"
        >
          {isLoading && <Spinner mod="white" size="s" className={cn('spinner')} />}
          {/* {showGift && <Gift isTooltipShown={false} animated={this.state.isGiftAnimated} />} */}
          {userPhoto && (
            <div className={cn('photo')} style={{ backgroundImage: `url(${userPhoto})` }} />
          )}
          {this.renderNotify()}
        </button>
      </Dropdown>
    )
  }
}

const NavbarUserLogin: React.FC<{
  onLoginClick: NavbarUserProps['onLoginClick']
  loginMethods: ReadonlyArray<AvailableLoginMethods>
}> = ({ onLoginClick, loginMethods }) => (
  <LoginForm {...useLoginContent()} onLoginClick={onLoginClick} loginMethods={loginMethods} />
)

const ModalHeader: React.FC = () => {
  const { t } = useTranslation()
  return <>{t('common:menu')}</>
}

export default withFlagr(flagr, ['avs-feat-loginMethods'])(NavbarUser)
