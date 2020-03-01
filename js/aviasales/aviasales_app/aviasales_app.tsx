import React, { useState, useRef, memo, useEffect } from 'react'
import { connect } from 'react-redux'
import clssnms from 'clssnms'
import Navbar from 'navbar'
import PageHeader from 'form/components/page_header'
import DocumentObserver from 'common/document_observer/document_observer'
import { FormTabs } from 'form/components/form_tabs/form_tab.types'
import { PageHeaderParams, FormType } from 'form/types'
import { useExplosionEffects, useGetExplosionTabs } from './hooks/explosion.hooks'
import { getUserEmail } from 'user_account/selectors/user.selectors'
import NotifyBar from 'components/notify_bar/notify_bar.tsx'
import OfflineOverlay from 'pwa/OfflineOverlay'
import Spinner from 'components/spinner/spinner'
import flagr from 'common/utils/flagr_client_instance'
import { withFlagr } from 'shared_components/flagr/flagr-react'
import { setUserSetting } from 'user_account/actions/user_settings.actions'
import { userAuthorize } from 'user_account/actions/user_info.actions'
import { getGeoIpCityIata } from 'common/utils/geo_ip'
import { sendTiming } from 'common/js/redux/actions/metrics.actions'

import './aviasales_app.scss'

const Explosion = React.lazy(() =>
  import(/* webpackChunkName: "explosion" */ 'components/explosion/explosion'),
)
const PopupsContainer = require('popups_container/popups_container').default

const HTML = document.querySelector('html')

const cn = clssnms('aviasales-app')

interface OwnProps {
  tabs: FormTabs
  pageParams: PageHeaderParams
  rootElement?: HTMLElement
  initTime: number
}
interface StateProps {
  showExplosion: boolean
  activeForm: FormType
  isOffline: boolean
  userEmail: string
}
interface DispatchProps {
  userAuthorize: () => void
  sendTiming: (event: string, data: number) => void
  setUserSetting: (key: string, value: string) => void
}
export type AviasalesAppProps = OwnProps & StateProps & DispatchProps

const AviasalesApp: React.FC<AviasalesAppProps> = memo((props) => {
  const [isStickyTabs, setIsStickyTabs] = useState(false)
  const [isStickyHeader, setIsStickyHeader] = useState(false)
  const isCompact = window.isSearchPage || props.showExplosion || window.isUserPage
  const isFormCollapsable = window.isUserPage || props.showExplosion
  const showLocaleSelector = window.isUserPage || props.showExplosion
  const explosionTabs = useGetExplosionTabs(isCompact, props.tabs)
  const tabsRef: React.RefObject<HTMLDivElement> = useRef(null)
  useExplosionEffects(props, isCompact, tabsRef, setIsStickyTabs, setIsStickyHeader)
  useEffect(() => {
    props.userAuthorize()
  }, [])
  const handleFormCollapse = (isCollapsed) => {
    if (isCollapsed) {
      HTML!.classList.add('--collapsed-form')
    } else {
      HTML!.classList.remove('--collapsed-form')
    }
  }

  useEffect(() => {
    props.sendTiming('page_header_init', Math.round(props.initTime))
    setGeoIpToGuestia(props.setUserSetting)
  }, [])

  return (
    <div className={cn()}>
      <PopupsContainer />
      <div
        className={cn('navbar-wrap', {
          '--sticky': !isCompact,
        })}
      >
        <Navbar
          formTabs={explosionTabs}
          isCompact={isCompact || isStickyTabs}
          showTabsOnSticky={!isCompact}
          showLocaleSelector={
            showLocaleSelector ||
            flagr.is('avs-feat-langSwitcher') ||
            flagr.is('avs-feat-currencySwitcher')
          }
        />
      </div>
      <div className={cn('page-header-wrap')}>
        <PageHeader
          {...props.pageParams}
          rootElement={props.rootElement}
          isCompact={isCompact}
          isStickyHeader={isStickyHeader}
          isExplosion={isCompact}
          formTabs={props.tabs}
          explosionFormTabs={explosionTabs}
          tabsRef={tabsRef}
          onFormCollapse={handleFormCollapse}
          initTime={props.initTime}
          isFormCollapsable={isFormCollapsable}
        />
      </div>
      {window.isSearchPage && // NOTE: do not show preloader on /search page without params
        !props.showExplosion &&
        window.location.pathname !== '/search' && (
          <div className={cn('explosion-wrap')}>
            <Spinner mod="primary" size="m" />
          </div>
        )}
      {props.showExplosion && (
        <div className={cn('explosion-wrap')}>
          <React.Suspense fallback={<Spinner mod="primary" size="m" />}>
            <Explosion />
          </React.Suspense>
        </div>
      )}
      <DocumentObserver />
      {props.isOffline && <OfflineOverlay />}
      <NotifyBar countryInformerData={props.pageParams.countryInformer} />
    </div>
  )
})

const setGeoIpToGuestia = async (setSettingFn: DispatchProps['setUserSetting']) => {
  const cityIata = await getGeoIpCityIata()
  if (cityIata) {
    setSettingFn('geoip', cityIata)
  }
}

const mapStateToProps = (state) => ({
  activeForm: state.pageHeader.activeForm,
  showExplosion: !!state.requestId,
  isOffline: state.offline.isOffline,
  userEmail: getUserEmail(state),
})

const mapDispatchToProps = (dispatch) => ({
  userAuthorize: () => dispatch(userAuthorize()),
  sendTiming: (event, data) => dispatch(sendTiming(event, data)),
  setUserSetting: (key: string, value: string) => dispatch(setUserSetting(key, value)),
})

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps,
)(withFlagr(flagr, ['avs-feat-langSwitcher'])(AviasalesApp))
