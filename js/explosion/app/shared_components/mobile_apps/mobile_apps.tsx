import React, { FC } from 'react'
import { MobileAppsProps, IconProps, LinkProps } from './mobile_apps.types'
import clssnms from 'clssnms'
import './mobile_apps.scss'

const classNames = clssnms('mobile-apps')

const Icon: FC<IconProps> = React.memo(({ name }) => (
  <i className={classNames('icon', `--${name}`)} />
))

const MobileAppLink: FC<LinkProps> = React.memo(
  ({ children, icon, className, linkStyle, ...restProps }) => (
    <a
      {...restProps}
      target="_blank"
      data-testid="app-link"
      rel="nofollow"
      className={classNames('link', [className, `--${linkStyle}`])}
    >
      {icon}
      <span className={classNames('text')}>{children}</span>
    </a>
  ),
)

const MobileApps: FC<MobileAppsProps> = React.memo((props) => {
  const {
    variant: linkStyle,
    className,
    onAppStoreClick,
    onGooglePlayClick,
    appStoreUrl,
    googlePlayUrl,
    campaing,
  } = props

  return (
    <div
      data-goal-category={`mobile_app_links_${campaing || ''}`}
      className={classNames('wrapper', [className, `--${linkStyle}`])}
    >
      <MobileAppLink
        icon={<Icon name="app-store" />}
        linkStyle={linkStyle}
        href={appStoreUrl}
        title="App Store"
        onClick={onAppStoreClick}
      >
        App Store
      </MobileAppLink>

      <MobileAppLink
        icon={<Icon name="google-play" />}
        linkStyle={linkStyle}
        href={googlePlayUrl}
        title="Google Play"
        onClick={onGooglePlayClick}
      >
        Google Play
      </MobileAppLink>
    </div>
  )
})

export default MobileApps
