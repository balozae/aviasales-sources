import React from 'react'
import star from './images/star.svg'
import './card.scss'
import { IBookingBannerCard } from './card.types'
import Price from 'shared_components/price/price'
import { Trans, withTranslation, WithTranslation } from 'react-i18next'

class BookingBannerCard extends React.PureComponent<IBookingBannerCard & WithTranslation> {
  static ratings = [
    { min: 0, max: 7.9, i18nKey: 'good' },
    { min: 8, max: 8.5, i18nKey: 'veryGood' },
    { min: 8.6, max: 8.9, i18nKey: 'wonderful' },
    { min: 9, max: 9.5, i18nKey: 'excellent' },
    { min: 9.6, max: 10, i18nKey: 'exceptional' },
  ]

  static getRatingTitleKey(rating: number) {
    for (const ratingTitle of BookingBannerCard.ratings) {
      if (rating >= ratingTitle.min && rating <= ratingTitle.max) {
        return ratingTitle.i18nKey
      }
    }

    return BookingBannerCard.ratings[0].i18nKey
  }

  onImageClick = (e) => this.props.onClick && this.props.onClick(e, 'image', this.props.index)
  onTitleClick = (e) => this.props.onClick && this.props.onClick(e, 'title', this.props.index)
  onButtonClick = (e) => this.props.onClick && this.props.onClick(e, 'button', this.props.index)

  render() {
    const { image, stars, price, currency, rating, title, currencyRate, design, t } = this.props

    return (
      <div className={`booking-banner-card${design ? ' --' + design : ''}`}>
        <a
          href={this.props.href}
          target="_blank"
          className="booking-banner-card__image"
          style={{ backgroundImage: `url('${image}')` }}
          onClick={this.onImageClick}
        />
        <div className="booking-banner-card-stars">
          {Array.apply(null, { length: stars }).map((empty, index) => (
            <img src={star} className="booking-banner-card-stars__star" alt="" key={index} />
          ))}
        </div>
        <a
          onClick={this.onTitleClick}
          href={this.props.href}
          target="_blank"
          className="booking-banner-card__title"
        >
          {title}
        </a>
        <a
          onClick={this.onButtonClick}
          href={this.props.href}
          target="_blank"
          className="booking-banner-card__button"
        >
          <Trans ns="ad_booking_banner" i18nKey="priceFrom">
            <Price value={price / (currencyRate || 1)} currency={currency} />
          </Trans>
        </a>
        <div className="booking-banner-card-rating">
          {design !== 'minimal' && (
            <>
              {t(`ad_booking_banner:${BookingBannerCard.getRatingTitleKey(rating)}`)}
              &nbsp;
            </>
          )}
          <span
            className="booking-banner-card-rating__rating"
            title={t(`ad_booking_banner:${BookingBannerCard.getRatingTitleKey(rating)}`)}
          >
            {rating}
          </span>
        </div>
      </div>
    )
  }
}

export default withTranslation('ad_booking_banner')(BookingBannerCard)
