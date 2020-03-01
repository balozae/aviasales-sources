import React, { Suspense } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { withTranslation, WithTranslation } from 'react-i18next'
import Notify, { cn } from '../notify'
import { NotifyIconType, NotifyColorType } from '../notify.types'
import {
  closeUncheckVisaFilterNotify,
  neverShowUncheckVisaFilterNotify,
} from 'common/js/redux/actions/uncheck_visa_filter_notify.actions'
import { reachGoal } from 'common/js/redux/actions/metrics.actions'
import { updateFilter } from 'common/js/redux/actions/filters.actions'
import { AppState } from 'common/js/redux/types/root/explosion'

interface StoreProps {
  uncheckedVisaFilterCountries: string[]
}

interface DispatchProps {
  reachGoal: typeof reachGoal
  updateFilter: typeof updateFilter
  closeUncheckVisaFilterNotify: typeof closeUncheckVisaFilterNotify
  neverShowUncheckVisaFilterNotify: typeof neverShowUncheckVisaFilterNotify
}

type UncheckVisaFilterContainerProps = StoreProps & DispatchProps

class UncheckVisaFilterContainer extends React.Component<
  UncheckVisaFilterContainerProps & WithTranslation
> {
  componentDidMount() {
    this.props.reachGoal('NOTIFY_SHOWN', { sender: 'notify_uncheck_visa_filter' })
  }

  handleClear = () => {
    this.props.updateFilter({
      filterName: 'visa',
      filterValue: {},
    })
    this.props.closeUncheckVisaFilterNotify()
    this.props.neverShowUncheckVisaFilterNotify()
    this.props.reachGoal('CLEAR_UNCHECK_VISA_FILTER', { sender: 'notify_uncheck_visa_filter' })
  }

  handleClose = () => {
    this.props.reachGoal('NOTIFY_CLOSED', { sender: 'notify_uncheck_visa_filter' })
    this.props.closeUncheckVisaFilterNotify()
  }

  prepareNotifyText = (countriesNames: string[]): string => {
    if (countriesNames.length === 1) {
      return this.props.t('notify_uncheck_visa_filter:singleCountry', {
        country: countriesNames[0],
      })
    }

    if (countriesNames.length >= 2) {
      return this.props.t('notify_uncheck_visa_filter:twoOrMoreCountries', {
        countryOrCountries: countriesNames.slice(0, -1).join(', '),
        lastCountry: countriesNames[countriesNames.length - 1],
      })
    }

    return ''
  }

  render() {
    const { uncheckedVisaFilterCountries: countries, t } = this.props

    const countriesFullNames = countries.map((country) => t(`visa:countries.${country}`))
    const notifyText = this.prepareNotifyText(countriesFullNames)
    return (
      <Suspense fallback={null}>
        <Notify
          onClose={this.handleClose}
          iconType={NotifyIconType.Visa}
          colorType={NotifyColorType.Blue}
        >
          <div className={cn('text')}>{notifyText}</div>
          <button className={cn('button')} onClick={this.handleClear}>
            {t('notify_uncheck_visa_filter:button')}
          </button>
        </Notify>
      </Suspense>
    )
  }
}

const mapStateToProps = (state: AppState): StoreProps => ({
  uncheckedVisaFilterCountries: state.uncheckVisaFilterNotify.countries,
})

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps =>
  bindActionCreators(
    {
      reachGoal,
      updateFilter,
      closeUncheckVisaFilterNotify,
      neverShowUncheckVisaFilterNotify,
    },
    dispatch,
  )

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation()(UncheckVisaFilterContainer))
