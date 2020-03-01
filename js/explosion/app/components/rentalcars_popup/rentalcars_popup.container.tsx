import React, { Component } from 'react'
import { connect } from 'react-redux'
import RentalcarsPopup from './rentalcars_popup'
import { removePopup } from 'common/js/redux/actions/popups.actions'
import { TicketData } from 'shared_components/ticket/ticket_incoming_data.types'
import { getAirports } from 'common/js/redux/selectors/airports.selectors'
import { Airports } from 'shared_components/ticket/ticket.types'
import { withTranslation, WithTranslation } from 'react-i18next'
import { buildRentalcarsDeepLink } from './rentalcars_popup.utils'
import { AppState } from 'common/js/redux/types/root/explosion'
import { bindActionCreators, compose, Dispatch } from 'redux'
import { PopupType } from 'common/js/redux/types/popups.types'
import { getPopupDataByType } from 'common/js/redux/selectors/popups.selectors'
import { reachGoal } from 'common/js/redux/actions/metrics.actions'

interface RentalcarsPopupContainerDispatchProps {
  reachGoal: typeof reachGoal
  closePopup: () => void
}

interface RentalcarsPopupContainerStateProps {
  data?: TicketData
  airports: Airports
}

interface RentalcarsPopupContainerProps
  extends WithTranslation,
    RentalcarsPopupContainerStateProps,
    RentalcarsPopupContainerDispatchProps {}

class RentalcarsPopupContainer extends Component<RentalcarsPopupContainerProps> {
  componentDidUpdate() {
    if (this.props.data) {
      this.props.reachGoal('RENTALCARS_POPUP_SHOWN')
    }
  }

  handleClose = () => {
    this.props.reachGoal('RENTALCARS_POPUP_CLOSED')
    this.props.closePopup()
  }

  handleBtnClick = () => {
    this.props.reachGoal('RENTALCARS_POPUP_BUTTON_CLICK')
    this.props.closePopup()
  }

  render() {
    const { data, airports, t } = this.props

    const isVisible = !!data

    const firstSegment = data && data.segment[0]
    const lastDepartureFlight = firstSegment && firstSegment.flight[firstSegment.flight.length - 1]
    const arrivalIata = lastDepartureFlight && lastDepartureFlight.arrival
    const cityName = arrivalIata && airports[arrivalIata].city

    const deepLink = data ? buildRentalcarsDeepLink(data) : ''

    return (
      <RentalcarsPopup
        isVisible={isVisible}
        onClose={this.handleClose}
        onButtonCLick={this.handleBtnClick}
        title={t('rentalcars_popup:title', { place: cityName })}
        caption={t('rentalcars_popup:caption')}
        buttonText={t('rentalcars_popup:button')}
        buttonLink={deepLink}
      />
    )
  }
}

const mapStateToProps = (state: AppState): RentalcarsPopupContainerStateProps => ({
  data: getPopupDataByType(state, PopupType.RentalCars) as any,
  airports: getAirports(state),
})

const mapDispatchToProps = (dispatch: Dispatch): RentalcarsPopupContainerDispatchProps =>
  bindActionCreators(
    {
      reachGoal,
      closePopup: () => removePopup(PopupType.RentalCars),
    },
    dispatch,
  )

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  withTranslation('rentalcars_popup'),
)(RentalcarsPopupContainer)
