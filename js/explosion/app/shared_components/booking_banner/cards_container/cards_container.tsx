import React from 'react'
import './cards_container.scss'
import { IBookingBannerCardsContainer } from './cards_container.types'

export default class BookingBannerCardsContainer extends React.PureComponent<
  IBookingBannerCardsContainer
> {
  static defaultProps = {
    orientation: 'horizontal',
  }

  onLogoClick = (e) => this.props.onClick && this.props.onClick(e, 'logo')
  onShowMoreClick = (e) => this.props.onClick && this.props.onClick(e, 'showMore')

  render() {
    const { showAllText, showAllLink, logoLink, orientation } = this.props

    return (
      <div className={`booking-banner-cards-container --${orientation}`}>
        <div className="booking-banner-cards-container-head">
          <a
            onClick={this.onLogoClick}
            target="_blank"
            href={logoLink}
            className="booking-banner-cards-container-head__logo"
          />
          {showAllText &&
            orientation === 'horizontal' && (
              <a
                onClick={this.onShowMoreClick}
                target="_blank"
                className="booking-banner-cards-container-head__showMore"
                href={showAllLink}
              >
                {showAllText}
              </a>
            )}
        </div>
        <div className="booking-banner-cards-container__cards">{this.props.children}</div>
      </div>
    )
  }
}
