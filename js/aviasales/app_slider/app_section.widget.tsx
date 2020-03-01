import React from 'react'
import { render } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { withFlagr } from 'shared_components/flagr/flagr-react'
import flagr from 'common/utils/flagr_client_instance'
import AppSection from './app_section'
import { getAppSectionProp } from './app_section.props'

export function AppSectionsWithTranslations() {
  useTranslation('app_section')
  const props = getAppSectionProp()
  return <AppSection {...props} />
}

const AppSectionWithFlagr = withFlagr(flagr, ['avs-feat-appSectionImgLang'])(
  AppSectionsWithTranslations,
)

export default function widget(el: HTMLElement) {
  render(<AppSectionWithFlagr />, el)
}
