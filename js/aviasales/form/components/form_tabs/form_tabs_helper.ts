import { FormTabs, FormTab } from './form_tab.types'
import { FormType, Tabs } from 'form/types'
import i18next from 'i18next'

export default function(availableTabs: Array<FormType>, tabs: Tabs): FormTabs {
  return availableTabs.map((tab) => {
    return {
      tabName: tab,
      title: i18next.t(`form_tabs:${tab}`),
      link: tabs[tab]!.link,
    } as FormTab
  })
}
