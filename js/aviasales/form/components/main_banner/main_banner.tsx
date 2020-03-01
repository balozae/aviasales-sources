import React, { useCallback } from 'react'
import AdsenseBanner from './adsense_banner/adsense_banner'
import AdfoxBanner from './adfox_banner/adfox_banner'

export interface Props {
  reachGoal: (event: string, data?: any) => void
}

const MainBanner: React.FC<Props> = ({ reachGoal }) => {
  const RANDOM = Math.random()

  const handleAdsenseBannerRender = useCallback(
    (data) => reachGoal('main-adsense-banner-render', data),
    [reachGoal],
  )

  const handleAdsenseBannerClick = useCallback(
    (data) => reachGoal('main-adsense-banner-click', data),
    [reachGoal],
  )

  const handleAdfoxBannerRender = useCallback(
    (data) => reachGoal('main-adsense-banner-render', data),
    [reachGoal],
  )

  const getBanner = useCallback(
    () =>
      RANDOM > 0.5 ? (
        <AdsenseBanner onRender={handleAdsenseBannerRender} onClick={handleAdsenseBannerClick} />
      ) : (
        <AdfoxBanner onRender={handleAdfoxBannerRender} />
      ),
    [reachGoal],
  )

  return getBanner()
}

export default React.memo(MainBanner)
