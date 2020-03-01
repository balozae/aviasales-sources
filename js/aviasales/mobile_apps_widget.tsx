import React from 'react'
import { render } from 'react-dom'
import MobileApps from 'shared_components/mobile_apps/mobile_apps'
import { getLink } from 'common/utils/app_links.utils'

export default function widget(el: HTMLElement) {
  const { campaing, variant } = el.dataset
  if (campaing && (variant === 'mini' || variant === 'full' || variant === 'responsive')) {
    render(
      <MobileApps
        campaing={campaing}
        variant={variant}
        googlePlayUrl={getLink('android', { c: campaing })}
        appStoreUrl={getLink('ios', { c: campaing })}
      />,
      el,
    )
  } else {
    console.warn('mobile_apps must specify source and variant')
  }
}
