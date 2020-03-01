import React from 'react'
import Container from '../cards_container/cards_container'
import Card from '../card/card'
import { IBookingBanner } from './cards_banner.types'
import DataFetch from '../hoc/cards_fetch_data'
import { createBookingUrl } from '../../hotels_utils/booking'
import { format } from 'finity-js'
import { Trans, withTranslation, WithTranslation } from 'react-i18next'

export class BookingBanner extends React.PureComponent<IBookingBanner & WithTranslation> {
  componentDidMount(): void {
    if (this.props.onShown) {
      this.props.onShown(this.props.type, this.props.variant)
    }
  }

  get dateFrom() {
    return this.props.dateFrom instanceof Date
      ? format(this.props.dateFrom, 'YYYY-MM-DD')
      : this.props.dateFrom
  }

  get dateTo() {
    return this.props.dateTo && this.props.dateTo instanceof Date
      ? format(this.props.dateTo, 'YYYY-MM-DD')
      : this.props.dateTo
  }

  onCardClick = (e, target, index) => {
    if (this.props.onCardClick) {
      this.props.onCardClick(e, target, this.props.type, this.props.variant, index)
    }
  }

  onContainerClick = (e, target) => {
    if (this.props.onContainerClick) {
      this.props.onContainerClick(e, target, this.props.type, this.props.variant)
    }
  }

  getBookingLink() {
    return createBookingUrl({
      destinationIATA: this.props.iata,
      dateFrom: this.dateFrom,
      dateTo: this.dateTo,
      childrenCount: this.props.children || 0,
      infantsCount: this.props.infants || 0,
      adultsCount: this.props.adults || 0,
      currency: this.props.currency,
      utm: this.props.utm || 'aviasales',
      utmCampaign: this.props.utm || 'aviasales',
      utmSource: this.props.utm_source || 'aviasales',
      utmMedium: this.props.utm_medium || 'aviasales',
      utmContent: this.props.utm_content,
    })
  }

  render() {
    const {
      showAllText,
      showAllLink,
      logoLink,
      cards,
      orientation,
      cardDesign,
      locationName,
    } = this.props

    const bookingLink = this.getBookingLink()

    if (!cards.length) {
      return null
    }

    let showAll =
      showAllText || locationName
        ? this.props.t('ad_booking_banner:allHotelsLink', {
            locationName,
          })
        : undefined

    return (
      <Container
        showAllText={showAll}
        showAllLink={showAllLink || bookingLink}
        logoLink={logoLink || bookingLink}
        onClick={this.onContainerClick}
        orientation={orientation}
      >
        {cards.map((card, idx) => (
          <Card
            {...card}
            key={card.id}
            index={idx}
            currency={this.props.currency}
            currencyRate={this.props.currencyRate}
            onClick={this.onCardClick}
            design={cardDesign}
            href={bookingLink}
          />
        ))}
      </Container>
    )
  }
}

export default DataFetch(withTranslation('ad_booking_banner')(BookingBanner))
