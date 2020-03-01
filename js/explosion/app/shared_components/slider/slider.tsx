import React from 'react'
import clssnms from 'clssnms'
import nouislider from 'nouislider'
import { SliderEventCb } from './slider.types'

import './slider.scss'

const cn = clssnms('slider')

export interface SliderProps {
  range: {
    min: number
    max: number
  }
  start: number[] // actual values

  // optional
  step?: number
  format?: {
    from: Function
    to: Function
  }
  // https://refreshless.com/nouislider/slider-options/#section-connect
  connect?: boolean | boolean[]
  // https://refreshless.com/nouislider/behaviour-option/
  behaviour?: string
  // https://refreshless.com/nouislider/slider-options/#section-limit
  limit?: number
  // https://refreshless.com/nouislider/slider-options/#section-margin
  margin?: number
  // https://refreshless.com/nouislider/slider-options/#section-padding
  padding?: number | number[]
  keyboardSupport?: boolean
  className?: string

  // callbacks
  onStart?: SliderEventCb
  onSlide?: SliderEventCb
  onUpdate?: SliderEventCb
  onChange?: SliderEventCb
  onSet?: SliderEventCb
  onEnd?: SliderEventCb
}

class Slider extends React.PureComponent<SliderProps> {
  static defaultProps = {
    step: 1,
    connect: true,
    behaviour: 'tap',
    keyboardSupport: true,
    disabled: false,
    padding: 0,
    format: {
      from: (value: number) => Math.round(value),
      to: (value: number) => Math.round(value),
    },
  }

  sliderContainerRef: React.RefObject<HTMLDivElement> = React.createRef()
  slider: any

  componentDidMount() {
    if (this.sliderContainerRef.current && this.props.range) {
      this.initSlider()
    }
  }

  componentWillUnmount() {
    if (this.slider) {
      this.slider.destroy()
    }
  }

  componentDidUpdate(prevProps: SliderProps) {
    if (!this.slider) {
      return
    }

    if (this.props.range !== prevProps.range) {
      this.slider.updateOptions({ range: this.props.range }, false)
    }

    if (this.props.start !== prevProps.start) {
      this.slider.set(this.props.start, false)
    }
  }

  initSlider() {
    this.slider = nouislider.create(this.sliderContainerRef.current, { ...this.props })

    const { onStart, onSlide, onUpdate, onChange, onSet, onEnd } = this.props
    if (onStart) {
      this.slider.on('start', onStart)
    }

    if (onSlide) {
      this.slider.on('slide', onSlide)
    }

    if (onUpdate) {
      this.slider.on('update', onUpdate)
    }

    if (onChange) {
      this.slider.on('change', onChange)
    }

    if (onSet) {
      this.slider.on('set', onSet)
    }

    if (onEnd) {
      this.slider.on('end', onEnd)
    }
  }

  render() {
    return (
      <div
        className={cn('', this.props.className)}
        ref={this.sliderContainerRef}
        /**
         * Allow all children of this elem to receive touch moves
         * when it used in our modal, or in container with inited body-scroll-lock
         */
        body-scroll-lock-ignore=""
      />
    )
  }
}

export default Slider
