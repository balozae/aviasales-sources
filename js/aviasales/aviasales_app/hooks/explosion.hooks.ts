import { useEffect, useMemo } from 'react'
import { AviasalesAppProps } from 'aviasales_app/aviasales_app'
import googleTagInitializer from 'form/components/main_banner/adsense_banner/google_tag_initializer'
import ScrollListener from 'form/components/page_header/scroll_listener'
import { FormType } from 'form/types'
import { FormTabs } from 'form/components/form_tabs/form_tab.types'

const HTML = document.querySelector('html')

const IGNORED_SERP_TABS: ReadonlyArray<FormType> = ['cars', 'insurance']

export const useExplosionEffects = (
  props: AviasalesAppProps,
  isCompact: boolean,
  tabsRef: React.RefObject<HTMLDivElement>,
  onStickyTabsChange,
  onStickyHeaderChange,
) => {
  // init google tag, scrollListener, body classes
  let scrollListener
  useEffect(
    () => {
      if (props.showExplosion) {
        googleTagInitializer()
      }
      if (!scrollListener) {
        scrollListener = new ScrollListener({
          tabsRef,
          showExplosion: isCompact,
          onStickyTabsChange,
          onStickyHeaderChange,
        })
      } else {
        scrollListener.updateParams({
          showExplosion: isCompact,
        })
      }
      if (window.isSearchPage || props.showExplosion) {
        if (props.rootElement) {
          props.rootElement.classList.remove('--main-page-form')
        }
        HTML!.classList.add('--serp')
      } else {
        HTML!.classList.remove('--serp')
        if (props.rootElement && window.isMainPage) {
          props.rootElement.classList.add('--main-page-form')
        }
      }
      return () => {
        scrollListener.unsubscribe()
      }
    },
    [props.showExplosion, isCompact],
  )
}

export const useGetExplosionTabs = (isCompact: boolean, tabs: FormTabs) =>
  useMemo(
    () => (isCompact ? tabs.filter((tab) => !IGNORED_SERP_TABS.includes(tab.tabName)) : tabs),
    [tabs, isCompact],
  )
