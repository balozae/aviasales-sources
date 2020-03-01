import React, { PureComponent, createRef } from 'react'
import clssnms from 'clssnms'
import './app_section.scss'
const serpMetrics = require('analytics/metrics')

import AppSlider from './app_slider'
import MobileApps from 'shared_components/mobile_apps/mobile_apps'

const reachGoal = (event: string) => {
  serpMetrics.reach_goal(`app-section--${event}`)
}

const classNames = clssnms('app-section')

export interface ImageData {
  sources: {
    srcSet: string
    type: string
    media?: string
  }[]
  src: string
  text: string
}

export interface AppSectionProps {
  title: string
  description: string
  images: ImageData[]
  appStoreUrl: string
  googlePlayUrl: string
}

export interface AppSectionState {
  visible: boolean
  imagesLoaded: boolean[]
}

export default class AppSection extends PureComponent<AppSectionProps, AppSectionState> {
  state: AppSectionState = {
    visible: false,
    imagesLoaded: Array(this.props.images.length).fill(false),
  }

  wrapEl = createRef<HTMLDivElement>()
  observer: IntersectionObserver

  componentDidMount() {
    this.observer = new IntersectionObserver(this.handleIntersection)
    this.observer.observe(this.wrapEl.current!)
  }

  handleIntersection: IntersectionObserverCallback = (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        this.setState({ visible: true })
        reachGoal('scroll--visible')
        this.observer.unobserve(entry.target)
      }
    })
  }

  handleAppStoreClick = () => {
    reachGoal('app-store--click')
  }

  handleGooglePlayClick = () => {
    reachGoal('google-play--click')
  }

  handleImageLoaded(index: number) {
    const { imagesLoaded } = this.state

    return () => {
      this.setState({
        imagesLoaded: imagesLoaded.map((value, i) => (!value && i === index ? true : value)),
      })
    }
  }

  render() {
    const { title, description, images, appStoreUrl, googlePlayUrl } = this.props

    if (!images || images.length < 5) {
      return null
    }

    const { visible, imagesLoaded } = this.state
    const allImagesLoaded = imagesLoaded.every((v) => v)

    return (
      <div className={classNames(null)} ref={this.wrapEl}>
        <h2 className={classNames('title', { '--fade-top': visible })}>{title}</h2>
        <p className={classNames('desc', { '--fade-top': visible })}>{description}</p>

        <AppSlider
          visible={visible}
          expanded={visible && allImagesLoaded}
          auto={true}
          animationDelay={3000}
        >
          {visible
            ? images.map(({ sources, src, text }, i) => (
                <picture key={`picture-${i}`} data-text={text} onLoad={this.handleImageLoaded(i)}>
                  {sources.map((sourceProps, j) => (
                    <source key={`source-${i}-${j}`} {...sourceProps} />
                  ))}
                  <img src={src} />
                </picture>
              ))
            : []}
        </AppSlider>

        <MobileApps
          className={classNames('links')}
          campaing="app_section"
          variant="responsive"
          onAppStoreClick={this.handleAppStoreClick}
          onGooglePlayClick={this.handleGooglePlayClick}
          appStoreUrl={appStoreUrl}
          googlePlayUrl={googlePlayUrl}
        />
      </div>
    )
  }
}
