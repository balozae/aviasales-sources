import { isMobile } from 'shared_components/resizer'

/*
* Note: It's a temporary solution for mobile top_placement
*/
export const filterBannerInfo = (bannerInfo) => {
  const mobileBannerInfo = {}
  const desktopBannerInfo = {}
  let result

  Object.keys(bannerInfo).forEach((itemKey) => {
    if (
      bannerInfo[itemKey].data &&
      bannerInfo[itemKey].data.meta &&
      bannerInfo[itemKey].data.meta.is_mobile === 'yes'
    ) {
      mobileBannerInfo[itemKey] = bannerInfo[itemKey]
    } else {
      desktopBannerInfo[itemKey] = bannerInfo[itemKey]
    }
  })

  if (isMobile()) {
    result = mobileBannerInfo
  } else {
    result = desktopBannerInfo
  }

  if (Object.keys(result).length > 0) {
    return result
  }
}
