import React, { useState, useCallback, memo } from 'react'
import clssnms from 'clssnms'
import { useTranslation } from 'react-i18next'
import Dropdown from 'shared_components/dropdown/dropdown'
import NavbarServicesMenu from './navbar_services_menu'
import { getLink } from 'common/utils/app_links.utils'
import MobileApps from 'shared_components/mobile_apps/mobile_apps'

import './navbar_services.scss'

const cn = clssnms('navbar-services')

const NavbarServices: React.FC = () => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false)
  const toggleDropdown = useCallback(
    () => {
      setIsDropdownVisible(!isDropdownVisible)
    },
    [isDropdownVisible],
  )
  const closeDropdown = useCallback(() => {
    setIsDropdownVisible(false)
  }, [])

  const { t } = useTranslation()

  return (
    <Dropdown
      visible={isDropdownVisible}
      dropdownContent={<DropdownContent />}
      onClose={closeDropdown}
      modalHeader={t('common:services')}
    >
      <button className={cn()} onClick={toggleDropdown} type="button">
        <i className={cn('icon')} />
      </button>
    </Dropdown>
  )
}

const DropdownContent: React.FC = () => (
  <>
    <div className={cn('menu')}>
      <NavbarServicesMenu />
    </div>
    <div className={cn('apps')}>
      <MobileApps
        campaing="services"
        variant="mini"
        googlePlayUrl={getLink('android', { c: 'services' })}
        appStoreUrl={getLink('ios', { c: 'services' })}
      />
    </div>
  </>
)

export default memo(NavbarServices)
