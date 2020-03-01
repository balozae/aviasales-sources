import React from 'react'
import clssnms from 'clssnms'
import { RequestStatus } from 'common/types'
import ThemeSwitcher from 'common/js/theme_switcher'
import { FormTabs } from 'form/components/form_tabs/form_tab.types'
import { UserInfo, AvailableLoginMethods } from 'guestia_client/lib/types'
import LocaleSelector from './locale_selector/locale_selector'
import FormTabsComponent from 'form/components/form_tabs/form_tabs_container'
import NavbarUser from './navbar_user/navbar_user'
import NavbarServices from './navbar_services/navbar_services'

import './navbar.scss'

const cn = clssnms('navbar')

export interface NavbarComponentProps {
  brandName: string
  userInfo: UserInfo | null
  userInfoFetchStatus: RequestStatus
  onUserLogin: (method: AvailableLoginMethods) => void
  onUserLogout: () => void
  onUserNavbarDropdown: (isShown: boolean) => void

  // Optional
  userPromosCount?: number
  formTabs?: FormTabs
  isCompact?: boolean
  showTabsOnSticky?: boolean
  showLocaleSelector?: boolean
  showThemeSwitcher?: boolean
  currency?: string
  showServicesMenu?: boolean
  showUserProfile?: boolean
}

const NavbarComponent: React.FC<NavbarComponentProps> = (props) => {
  return (
    <div className={cn()}>
      <div className={cn('wrap')}>
        <a href="/" className={cn('logo-wrap')}>
          <i className={cn('logo')} />
          <span className={`${cn('logo-text')} --${props.brandName}`} />
        </a>
        {props.formTabs && (
          <div className={cn('tabs-wrap')}>
            <FormTabsComponent
              tabs={props.formTabs}
              showOnSticky={props.showTabsOnSticky}
              showHotelDiscount={true}
            />
          </div>
        )}
        <div className={cn('controls-wrap')}>
          {props.showThemeSwitcher && (
            <div className={cn('control')}>
              <ThemeSwitcher />
            </div>
          )}
          {props.showLocaleSelector && (
            <div className={cn('control')}>
              <LocaleSelector />
            </div>
          )}
          {props.showServicesMenu && (
            <div className={cn('control', '--services')}>
              <NavbarServices />
            </div>
          )}
          {props.showUserProfile && (
            <div className={cn('control')}>
              <NavbarUser
                userInfo={props.userInfo}
                userPromosCount={props.userPromosCount}
                isUserInfoFetching={props.userInfoFetchStatus === RequestStatus.Pending}
                onLoginClick={props.onUserLogin}
                onLogoutClick={props.onUserLogout}
                onDropdown={props.onUserNavbarDropdown}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default NavbarComponent
