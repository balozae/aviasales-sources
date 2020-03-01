import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import flagr from 'common/utils/flagr_client_instance'
import { withFlagr } from 'shared_components/flagr/flagr-react'
import Menu, { MenuProps } from 'shared_components/menu/menu'
import { MenuIconType, MenuItemProps } from 'shared_components/menu/menu_item'
import { getIconTypeFromLinkName } from 'shared_components/menu/menu.utils'
import { NavbarUserProps } from './navbar_user'
import { getUserAccountRoutes } from 'user_account/constants/routes'

export interface NavbarUserMenuProps {
  userPromosCount: NavbarUserProps['userPromosCount']
  showEmailActivationNotify?: boolean
  onLinkClick: (name: string) => () => void
  onLogoutClick: () => void
}

const NavbarUserMenu: React.FC<NavbarUserMenuProps> = ({
  userPromosCount,
  showEmailActivationNotify,
  onLinkClick,
  onLogoutClick,
}) => {
  const { t } = useTranslation('user_account')

  const routes = useMemo(
    () => getUserAccountRoutes(flagr.get('avs-feat-userAccountRoutes').routes),
    [flagr.get('avs-feat-userAccountRoutes').routes],
  )

  const menuItemsNotifies: { [key: string]: MenuItemProps['notify'] } = useMemo(
    () => ({
      promos: userPromosCount,
      subscriptions: showEmailActivationNotify,
    }),
    [userPromosCount, showEmailActivationNotify],
  )

  const menuItems: MenuProps['items'] = useMemo(
    () => {
      const items: MenuProps['items'] = routes.map(({ name, path }) => {
        return {
          type: 'a',
          url: `/my${path}`,
          icon: getIconTypeFromLinkName(name),
          text: t(`user_account:menu.${name}`),
          notify: menuItemsNotifies[name],
          onClick: onLinkClick(name),
        }
      })

      items.push({
        type: 'button',
        icon: MenuIconType.Exit,
        text: t('common:logout'),
        onClick: onLogoutClick,
      })

      return items
    },
    [t, routes, menuItemsNotifies, onLinkClick, onLogoutClick],
  )

  return <Menu items={menuItems} type="vertical" />
}

export default withFlagr(flagr, ['avs-feat-userAccountRoutes'])(NavbarUserMenu)
