import React from 'react'
import { RequestStatus } from 'common/types'
import { UserInfo } from 'guestia_client/lib/types'
import { FormTabs } from 'form/components/form_tabs/form_tab.types'
import { connect } from 'react-redux'
import flagr from 'common/utils/flagr_client_instance'
import { withFlagr } from 'shared_components/flagr/flagr-react'
import { userLogin, userLogout, userNavbarDropdown } from 'user_account/actions/user_info.actions'
import NavbarComponent from './navbar'

interface NavbarOwnProps {
  formTabs?: FormTabs
  isCompact?: boolean
  showTabsOnSticky?: boolean
  showLocaleSelector: boolean
}

interface NavbarStateProps {
  brandName: string
  showThemeSwitcher: boolean
  currency?: string
  userInfo: UserInfo | null
  userInfoFetchStatus: RequestStatus
  userPromosCount?: number
}
interface NavbarDispatchProps {
  onUserLogin: (method: string) => void
  onUserLogout: () => void
  onUserNavbarDropdown: (isShown: boolean) => void
}

export const Navbar: React.FC<NavbarOwnProps & NavbarStateProps & NavbarDispatchProps> = (
  props,
) => {
  return (
    <NavbarComponent
      {...props}
      showServicesMenu={flagr.is('avs-feat-topMenu')}
      showUserProfile={flagr.is('avs-feat-userProfile')}
    />
  )
}

const mapStateToProps = (state) => ({
  activeForm: state.pageHeader.activeForm,
  showThemeSwitcher: state.currentPage !== 'content',
  brandName: state.pageHeader.brandName,
  userInfo: state.userInfo.data,
  userInfoFetchStatus: state.userInfo.fetchStatus,
  // TODO: now we don't have promos page in user account so we have to temporary remove this prop
  userPromosCount: state.userInfo.promosCount,
})

const mapDispatchToProps = (dispatch) => ({
  onUserLogin: (method) => dispatch(userLogin(method)),
  onUserLogout: () => dispatch(userLogout()),
  onUserNavbarDropdown: (isShown: boolean) => dispatch(userNavbarDropdown(isShown)),
})

const NavbarWithFlagr = withFlagr(flagr, ['avs-feat-topMenu', 'avs-feat-userProfile'])(Navbar)
export default connect<NavbarStateProps, NavbarDispatchProps>(
  mapStateToProps,
  mapDispatchToProps,
)(NavbarWithFlagr)
