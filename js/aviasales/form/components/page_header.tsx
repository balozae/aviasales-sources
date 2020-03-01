import * as React from 'react'
import { connect } from 'react-redux'
import clssnms from 'clssnms'
import { PageHeaderParams, FormType } from 'form/types'
import Titles from './page_header/titles'
import MainBanner from 'form/components/main_banner/main_banner'
import { SearchParams, PlaceField } from 'form/components/avia_form/avia_form.types'
import { getPlace } from 'form/components/avia_form/utils'
import { FormsResolver, FormsResolverProps } from './forms_resolver/forms_resolver'
import { FormTabs } from 'form/components/form_tabs/form_tab.types'
import FormTabsComponent from 'form/components/form_tabs/form_tabs_container'
// import SnowBg from './page_header/new_year/snow_bg'
import { CurrentPageState } from 'common/js/redux/types/current_page.types'
import { addHighlightedTicketParams } from 'common/js/redux/actions/highlighted_ticket_params.actions'
import { sendTiming, reachGoal } from 'common/js/redux/actions/metrics.actions'
import { pageHeaderMountWithoutOrigin } from 'common/js/redux/actions/page_header.actions'

import '../css/page_header.scss'

const classNames = clssnms('page_header', { glue: '-' })

interface OwnProps {
  rootElement?: HTMLElement
  formTabs: FormTabs
  explosionFormTabs: FormTabs
  isCompact?: boolean
  isExplosion?: boolean
  tabsRef: React.RefObject<HTMLDivElement>
  isStickyHeader?: boolean
  initTime: number
  onFormCollapse: (isCollapsed: boolean) => void
  isFormCollapsable: FormsResolverProps['isFormCollapsable']
}

interface StateProps extends PageHeaderParams {
  currency: string
  aviaParams: SearchParams
  multiwayParams: SearchParams
  hotelParams: SearchParams
  requestId: string
  currentPage: CurrentPageState
  searchStatus: string
  isDarkTheme: boolean
  availableTabs: Array<FormType>
  brandName: string
  formParams: FormsResolverProps['formParams']
}

interface DispatchProps {
  addHighlightedTicket: (ticket: object) => void
  sendTiming: (event: string, data: number) => void
  reachGoal: (event: string, data?: any) => void
  onMountWithoutOrigin: typeof pageHeaderMountWithoutOrigin
}

type Props = StateProps & DispatchProps & OwnProps

export class PageHeader extends React.Component<Props> {
  componentDidMount() {
    const { segments } = this.getSearchParams('avia')
    const origin = getPlace(segments, PlaceField.Origin)

    if (
      !(
        (this.props.initialInputValues && this.props.initialInputValues.origin.value) ||
        origin.iata ||
        origin.name
      )
    ) {
      this.props.onMountWithoutOrigin()
    }

    const { highlightedTicket } = this.getSearchParams(this.props.activeForm)

    if (highlightedTicket) {
      this.props.addHighlightedTicket(highlightedTicket)
    }

    this.props.sendTiming('page_header_did_mount', Math.round(performance.now()))
    this.props.sendTiming(
      'page_header_load_time',
      Math.round(performance.now() - this.props.initTime),
    )
  }

  getSearchParams(type: FormType): SearchParams {
    return this.props[`${type}Params`]
  }

  renderForm() {
    return (
      <div className={classNames('form')}>
        <FormsResolver
          activeForm={this.props.activeForm}
          isDarkTheme={this.props.isDarkTheme}
          initialInputValues={this.props.initialInputValues!}
          requestId={this.props.requestId}
          onCollapse={this.props.onFormCollapse}
          formParams={this.props.formParams}
          isStickyHeader={this.props.isStickyHeader}
          reachGoal={this.props.reachGoal}
          isFormCollapsable={this.props.isFormCollapsable}
        />
      </div>
    )
  }

  render() {
    const activeTab = this.props.tabs[this.props.activeForm]

    if (!activeTab) {
      return null
    }

    return (
      <div className={classNames()}>
        {!this.props.isCompact ? (
          <div className={classNames('header')}>
            {/* NOTE: background canvas example */}
            {/* {isNewYearPromo && <SnowBg />} */}
            <div className={classNames('form-set')}>
              <Titles
                tab={activeTab}
                mainTitleTag={this.props.mainTitleTag}
                classNames={classNames}
              />
              <div className={classNames('tabs')} ref={this.props.tabsRef}>
                <FormTabsComponent tabs={this.props.formTabs} showOnSticky={false} />
              </div>
              {this.renderForm()}
            </div>
            <div className={classNames('bottom')}>
              <MainBanner reachGoal={this.props.reachGoal} />
            </div>
          </div>
        ) : (
          <div className={classNames('header', { '--compact': true })}>
            <div className={classNames('form-set')}>
              <div className={classNames('tabs')}>
                <FormTabsComponent
                  tabs={this.props.explosionFormTabs}
                  showOnSticky={false}
                  showHotelDiscount={true}
                />
              </div>
              {this.renderForm()}
            </div>
          </div>
        )}
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  const { sysState } = state
  return {
    ...state.pageHeader,
    formParams: {
      avia: state.aviaParams,
      multiway: state.multiwayParams,
    },
    searchStatus: state.searchStatus,
    currentPage: state.currentPage,
    currency: state.currency,
    requestId: state.requestId,
    aviaParams: state.aviaParams,
    multiwayParams: state.multiwayParams,
    hotelParams: state.hotelParams,
    isDarkTheme: sysState === '1' || sysState === '2' || sysState === '4',
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    addHighlightedTicket: (params) => dispatch(addHighlightedTicketParams(params)),
    sendTiming: (event, data) => dispatch(sendTiming(event, data)),
    reachGoal: (event, data) => dispatch(reachGoal(event, data)),
    onMountWithoutOrigin: () => dispatch(pageHeaderMountWithoutOrigin()),
  }
}

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps,
)(PageHeader)
