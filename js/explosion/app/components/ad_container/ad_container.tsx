import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import AdDoubleClick from 'components/ad_double_click/ad_double_click.coffee'
import AdSense from 'components/ad_sense/ad_sense.coffee'
import AdTopPlacementContainer from 'components/ad_top_placement/ad_top_placement.container'
import AdMediaAlpha from 'components/ad_media_alpha/ad_media_alpha'
import AdIntentMedia from 'components/ad_intent_media/ad_intent_media'
import CardBookingBanner from 'shared_components/booking_banner/cards_banner/cards_banner'
import AdMobile from 'components/ad_mobile/ad_mobile'
import { TicketMediaQueryTypes } from 'shared_components/ticket/ticket.types'
import flagr from 'common/utils/flagr_client_instance'
import { withFlagr } from 'shared_components/flagr/flagr-react'
import { reachGoal } from 'common/js/redux/actions/metrics.actions'
import { setNextAdvertisement } from 'common/js/redux/actions/advertisement.actions'

interface OwnProps {
  name: string
  mediaQueryType?: TicketMediaQueryTypes
}

interface StateProps {
  searchParams: any
  advertisement: any
  currency: string
}

interface DispatchProps {
  setNextAdvertisement: (index: string) => void
  reachGoal: (event: string, data?: any) => void
}

type ADContainerProps = OwnProps & StateProps & DispatchProps

const ADContainer: React.FC<ADContainerProps> = React.memo((props) => {
  const { currency, reachGoal, searchParams } = props
  const { segments, passengers, tripType } = searchParams
  let segment

  if (tripType === 'multiway') {
    segment = searchParams.segments[searchParams.segments.length - 1]
  } else {
    segment = searchParams.segments[0]
  }

  const onShown = React.useCallback(
    (type, variant) => {
      reachGoal('HOTEL_BANNER_SHOWN', {
        banner_type: type,
        banner_variant: variant,
      })
    },
    [reachGoal],
  )

  const onShownWithoutVariant = React.useCallback(
    (type) => {
      reachGoal('HOTEL_BANNER_SHOWN', {
        banner_type: type,
      })
    },
    [reachGoal],
  )

  const onContainerClick = React.useCallback(
    (e, target, type, variant) => {
      reachGoal('HOTEL_BANNER_CLICK', {
        banner_type: type,
        click_type: target,
        banner_variant: variant,
      })
    },
    [reachGoal],
  )

  const onContainerClickWithoutVariant = React.useCallback(
    (e, target, type) => {
      reachGoal('HOTEL_BANNER_CLICK', {
        banner_type: type,
        click_type: target,
      })
    },
    [reachGoal],
  )

  const onCardClick = React.useCallback(
    (e, target, type, variant, idx) => {
      reachGoal('HOTEL_BANNER_CLICK', {
        banner_type: type,
        click_type: target,
        position: idx,
        banner_variant: variant,
      })
    },
    [reachGoal],
  )

  const onCardClickWithoutVariant = React.useCallback(
    (e, target, type, variant, idx) => {
      reachGoal('HOTEL_BANNER_CLICK', {
        banner_type: type,
        click_type: target,
        position: idx,
      })
    },
    [reachGoal],
  )

  const handleAdNotRendered = () => {
    props.setNextAdvertisement(props.name)
  }

  const pickRandomdAdsIfNoResults = () => {
    switch (props.name) {
      case 'product_3':
        return (
          <CardBookingBanner
            iata={segment.destination}
            dateFrom={segments[0].date}
            dateTo={segments[segments.length - 1] ? segments[segments.length - 1].date : undefined}
            adults={passengers.adults}
            children={passengers.children}
            infants={passengers.infants}
            currency={currency}
            onShown={onShownWithoutVariant}
            onContainerClick={onContainerClickWithoutVariant}
            onCardClick={onCardClickWithoutVariant}
            utm="results_3d_ticket"
            type="results_3d_ticket"
            variant="cards_banner"
            utm_medium="search_results"
          />
        )
      case 'extra_content':
        return (
          <CardBookingBanner
            iata={segment.destination}
            dateFrom={segments[0].date}
            dateTo={segments[segments.length - 1] ? segments[segments.length - 1].date : undefined}
            adults={passengers.adults}
            children={passengers.children}
            infants={passengers.infants}
            currency={currency}
            onShown={onShownWithoutVariant}
            onContainerClick={onContainerClickWithoutVariant}
            onCardClick={onCardClickWithoutVariant}
            orientation="vertical"
            cardDesign="minimal"
            utm="results_vertical_banner"
            type="results_vertical_banner"
            variant="cards_banner"
            utm_medium="search_results"
          />
        )
      default:
        return null
    }
  }

  const pickRandomBasedAds = () => {
    const firstSegment = props.searchParams.segments[0]
    const isInternational =
      firstSegment.origin_country === 'RU' && firstSegment.destination_country !== 'RU'

    switch (props.name) {
      case 'product_3':
        if (isInternational && Math.random() >= 0.7) {
          return (
            <CardBookingBanner
              iata={segment.destination}
              dateFrom={segments[0].date}
              dateTo={
                segments[segments.length - 1] ? segments[segments.length - 1].date : undefined
              }
              adults={passengers.adults}
              children={passengers.children}
              infants={passengers.infants}
              currency={currency}
              onShown={onShown}
              onContainerClick={onContainerClick}
              onCardClick={onCardClick}
              utm="results_3d_ticket"
              utm_content="cards_banner"
              utm_medium="search_results"
              type="results_3d_ticket"
              variant="cards_banner"
            />
          )
        }
        if (Math.random() >= 0.5 && flagr.is('avs-feat-intent')) {
          return (
            <AdIntentMedia onAdNotRendered={handleAdNotRendered} name={'IntentMediaIntercard'} />
          )
        } else {
          return <AdMediaAlpha onAdNotRendered={handleAdNotRendered} placement={props.name} />
        }
      case 'extra_content':
        if (Math.random() >= 0.5 && flagr.is('avs-feat-intent')) {
          return <AdIntentMedia onAdNotRendered={handleAdNotRendered} name={'IntentMediaRail'} />
        } else {
          return <AdMediaAlpha onAdNotRendered={handleAdNotRendered} placement={props.name} />
        }
      default:
        return null
    }
  }

  if (!props.advertisement) {
    return pickRandomdAdsIfNoResults()
  }

  const isMobile = props.mediaQueryType === TicketMediaQueryTypes.Mobile
  switch (props.advertisement.type) {
    case 'AdDoubleClick':
      if (!isMobile) {
        return (
          <AdDoubleClick
            key={props.advertisement.id}
            placement={props.advertisement.placement}
            id={props.advertisement.id}
            size={props.advertisement.size}
            metricsName={props.advertisement.metricsName}
            onAdNotRendered={handleAdNotRendered}
            zoneid={props.advertisement.zoneid}
          />
        )
      }
      if (isMobile && props.advertisement.metricsName === 'first_place') {
        return <AdMobile searchParams={props.searchParams} onAdNotRendered={handleAdNotRendered} />
      }
      return null
    case 'AdTopPlacement':
      return (
        <AdTopPlacementContainer
          onAdNotRendered={handleAdNotRendered}
          mediaQueryType={props.mediaQueryType}
        />
      )
    case 'AdSense':
      return <AdSense name={props.name} onAdNotRendered={handleAdNotRendered} />
    case 'AdMediaAlpha':
      return pickRandomBasedAds()
    default:
      return null
  }
})

const mapStateToProps = (state, { name }: OwnProps): StateProps => ({
  searchParams: state.searchParams,
  advertisement: state.advertisement[name],
  currency: state.currency,
})

const mapDispatchToProps = (dispatch): DispatchProps => ({
  setNextAdvertisement: (index: string) => dispatch(setNextAdvertisement(index)),
  reachGoal: (event: string, data?: any): void => {
    dispatch(reachGoal(event, { ...data }))
  },
})

export default withFlagr(flagr, ['avs-feat-intent'])(
  connect<StateProps, DispatchProps>(
    mapStateToProps,
    mapDispatchToProps,
  )(ADContainer),
)
