import React, { useMemo, memo } from 'react'
import { useTranslation } from 'react-i18next'
import Menu, { MenuProps } from 'shared_components/menu/menu'
import { getIconTypeFromLinkName } from 'shared_components/menu/menu.utils'
import { navbarServicesRoutes } from './navbar_services.constants'

const NavbarServicesMenu: React.FC = () => {
  const { t } = useTranslation('navbar')

  const menuItems = useMemo<MenuProps['items']>(
    () =>
      navbarServicesRoutes.map(({ name, path }) => {
        return {
          type: 'a',
          url: `${path}`,
          icon: getIconTypeFromLinkName(name),
          text: t(name),
          targetBlank: true,
        }
      }),
    [t],
  )

  return <Menu items={menuItems} type="vertical" />
}

export default memo(NavbarServicesMenu)
