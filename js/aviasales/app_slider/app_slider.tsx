import React, { PureComponent, ReactElement } from 'react'
import clssnms from 'clssnms'
import throttle from 'lodash/throttle'
import { Swipeable } from 'react-swipeable'
import './app_slider.scss'
const serpMetrics = require('analytics/metrics')

import ArrowButton from 'shared_components/arrow_button/arrow_button'

const classNames = clssnms('app-slider')

interface SliderProps {
  visible: boolean
  expanded: boolean
  children: ReactElement<HTMLPictureElement>[]
  animationDelay?: number
  auto: boolean
}

interface SliderState {
  sliderState: 'collapsed' | 'expanding' | 'expanded'
  currSlideIndex: number
  hovered: boolean
}

interface ClassNamesMap {
  [slideIndex: number]: string
}

class AppSliderComponent extends PureComponent<SliderProps, SliderState> {
  static defaultProps: Partial<SliderProps> = {
    expanded: false,
    children: [],
    animationDelay: 3000,
    auto: true,
  }
  state: SliderState = {
    sliderState: 'collapsed',
    currSlideIndex: 2,
    hovered: false,
  }
  timer: number

  handleNext = throttle(() => {
    this.setState({
      currSlideIndex: this.getNextSlideIndex(this.state.currSlideIndex),
    })
  }, 300)

  handlePrev = throttle(() => {
    this.setState({
      currSlideIndex: this.getPrevSlideIndex(this.state.currSlideIndex),
    })
  }, 300)

  static getDerivedStateFromProps(props: SliderProps, state: SliderState): SliderState {
    return props.expanded && state.sliderState === 'collapsed'
      ? { ...state, sliderState: 'expanding' }
      : state
  }

  componentDidUpdate() {
    const { auto, expanded, animationDelay } = this.props
    const { hovered, sliderState } = this.state

    if (this.timer) {
      clearTimeout(this.timer)
    }

    if (!hovered && auto && expanded) {
      this.timer = setTimeout(this.handleNext, animationDelay)
    }

    if (sliderState === 'expanding') {
      setTimeout(() => this.setState({ sliderState: 'expanded' }), 1100)
    }
  }

  handleMouseEnter = () => {
    this.setState({ hovered: true })
  }

  handleMouseLeave = () => {
    this.setState({ hovered: false })
  }

  handleToggleClick = () => {
    this.reachGoal('bullet--click')
  }

  handleArrowLeft = () => {
    this.handlePrev()
    this.reachGoal('arrow-left--click')
  }

  handleArrowRight = () => {
    this.handleNext()
    this.reachGoal('arrow-right--click')
  }

  handleSwipeLeft = () => {
    this.handleNext()
    this.reachGoal('swipe--left')
  }

  handleSwipeRight = () => {
    this.handlePrev()
    this.reachGoal('swipre--right')
  }

  getNextSlideIndex = (slide: number): number =>
    slide < this.props.children.length * 2 - 1 ? slide + 1 : 0

  getPrevSlideIndex = (slide: number): number =>
    slide > 0 ? slide - 1 : this.props.children.length * 2 - 1

  getClassNamesMap = (currSlide: number): ClassNamesMap => {
    const { children } = this.props

    if (children.length < 5) {
      return {}
    }

    const prevClassNamesMap: ClassNamesMap = Array<number>(children.length - 2)
      .fill(0)
      .reduce(
        (arr, _, i) => [...arr, this.getPrevSlideIndex(arr.length > 0 ? arr[i - 1] : currSlide)],
        [],
      )
      .reduce(
        (classNamesMap, slideIndex, i) => ({ ...classNamesMap, [slideIndex]: `--prev-${i}` }),
        {},
      )
    const nextClassNamesMap = Array<number>(children.length - 2)
      .fill(0)
      .reduce(
        (arr, _, i) => [...arr, this.getNextSlideIndex(arr.length > 0 ? arr[i - 1] : currSlide)],
        [],
      )
      .reduce(
        (classNamesMap, slideIndex, i) => ({ ...classNamesMap, [slideIndex]: `--next-${i}` }),
        {},
      )

    return {
      [currSlide]: '--current',
      ...nextClassNamesMap,
      ...prevClassNamesMap,
    }
  }

  getIndex = (currSlideIndex: number) =>
    currSlideIndex < this.props.children.length
      ? currSlideIndex
      : currSlideIndex - this.props.children.length

  reachGoal(event: string, data?: Object) {
    serpMetrics.reach_goal(`app-slider--${event}`, data)
  }

  render() {
    const { children, expanded, visible } = this.props
    const { currSlideIndex, sliderState } = this.state

    if (children.length < 5) {
      return null
    }

    const classNamesMap = this.getClassNamesMap(currSlideIndex)
    const index = this.getIndex(currSlideIndex)
    const hint = children[index].props['data-text']

    return (
      <div className={classNames(null, { '--visible': visible })}>
        <div
          className={classNames('slides-wrap')}
          onMouseEnter={this.handleMouseEnter}
          onMouseLeave={this.handleMouseLeave}
        >
          <div className={classNames('slides', { '--hide-bg': expanded })}>
            {children.concat(children).map((slide, i) => (
              <div
                key={i}
                className={classNames('slide-item', [classNamesMap[i], `--${sliderState}`])}
                children={slide}
              />
            ))}
          </div>

          <Swipeable
            className={classNames('swipeable')}
            onSwipedLeft={this.handleSwipeLeft}
            onSwipedRight={this.handleSwipeRight}
            preventDefaultTouchmoveEvent={true}
            trackMouse={true}
          />
          <ArrowButton
            className={classNames('arrow-left')}
            position="left"
            onClick={this.handleArrowLeft}
            withSYS={false}
          />
          <ArrowButton
            className={classNames('arrow-right')}
            position="right"
            onClick={this.handleArrowRight}
            withSYS={false}
          />
        </div>

        {hint && <p className={classNames('hint', `--${sliderState}`)}>{hint}</p>}

        <div className={classNames('toggles')}>
          {children.map((_, i) => (
            <span
              key={i}
              className={classNames('toggle-item', { '--active': index === i })}
              onClick={this.handleToggleClick}
            />
          ))}
        </div>
      </div>
    )
  }
}

export default AppSliderComponent
