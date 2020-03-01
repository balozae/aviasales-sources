import i18next from 'i18next'
import flagr from 'common/utils/flagr_client_instance'
import { AppSectionProps } from './app_section'
import { getLink } from 'common/utils/app_links.utils'

const createImages = (img: string, lng: string) => ({
  sources: [
    {
      srcSet: `${require(`./img/desktop/${img}_${lng}.webp`)}, ${require(`./img/desktop/${img}_${lng}@2x.webp`)} 2x`,
      media: '(min-width: 768px)',
      type: 'image/webp',
    },
    {
      srcSet: `${require(`./img/mobile/${img}_m_${lng}.webp`)}, ${require(`./img/mobile/${img}_m_${lng}@2x.webp`)} 2x`,
      media: '(max-width: 767px)',
      type: 'image/webp',
    },
    {
      srcSet: `${require(`./img/desktop/${img}_${lng}.jp2`)}, ${require(`./img/desktop/${img}_${lng}@2x.jp2`)} 2x`,
      media: '(min-width: 768px)',
      type: 'image/jp2',
    },
    {
      srcSet: `${require(`./img/mobile/${img}_m_${lng}.jp2`)}, ${require(`./img/mobile/${img}_m_${lng}@2x.jp2`)} 2x`,
      media: '(max-width: 767px)',
      type: 'image/jp2',
    },
    {
      srcSet: `${require(`./img/desktop/${img}_${lng}.jxr`)}, ${require(`./img/desktop/${img}_${lng}@2x.jxr`)} 2x`,
      media: '(min-width: 768px)',
      type: 'image/vnd.ms-photo',
    },
    {
      srcSet: `${require(`./img/mobile/${img}_m_${lng}.jxr`)}, ${require(`./img/mobile/${img}_m_${lng}@2x.jxr`)} 2x`,
      media: '(max-width: 767px)',
      type: 'image/vnd.ms-photo',
    },
    {
      srcSet: `${require(`./img/desktop/${img}_${lng}.jpg`)}, ${require(`./img/desktop/${img}_${lng}@2x.jpg`)} 2x`,
      media: '(min-width: 768px)',
      type: 'image/jpg',
    },
    {
      srcSet: `${require(`./img/mobile/${img}_m_${lng}.jpg`)}, ${require(`./img/mobile/${img}_m_${lng}@2x.jpg`)} 2x`,
      media: '(max-width: 767px)',
      type: 'image/jpg',
    },
  ],
  src: require(`./img/desktop/${img}_${lng}.jpg`),
})

const images = ['travel', 'favorites', 'search', 'hotels', 'profile']

export const getAppSectionProp = (): AppSectionProps => {
  const imageLanguage = flagr.get('avs-feat-appSectionImgLang')

  return {
    title: i18next.t('app_section:title'),
    description: i18next.t('app_section:description'),
    images: images.map((imageName) => ({
      ...createImages(imageName, imageLanguage),
      text: i18next.t(`app_section:images.${imageName}`),
    })),
    appStoreUrl: getLink('ios', { c: 'app_section' }),
    googlePlayUrl: getLink('android', { c: 'app_section' }),
  }
}
