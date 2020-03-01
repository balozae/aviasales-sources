import React from 'react'
import { createPortal } from 'react-dom'
import clssnms from 'clssnms'
import { CSSTransition } from 'react-transition-group'
import throttle from 'lodash/throttle'
import './tooltip.scss'

const cn = clssnms('b-tooltip')

const TOOLTIP_CORNER_HEIGHT = 6
const TOOLTIP_INDENT = 20

const body = document.body
let tooltips = document.querySelector('.tooltips')
if (!tooltips) {
  tooltips = document.createElement('div')
  tooltips.className = 'tooltips'
  body!.appendChild(tooltips)
}

export interface TooltipDefaultProps {
  position: 'top' | 'bottom' | 'left' | 'right'
  showDelay: number
  tooltipProps: object
  wrapperClassName: string
  noAnimation: boolean
  isInteraction: boolean
  fixPosition: {
    left?: number
    top?: number
  }
}

export interface TooltipProps {
  tooltip: (args: any) => any
  showByProps?: boolean
  isVisible?: boolean
  showingCallback?: () => any
  wrapperProps?: object
  nodeToShow?: HTMLElement | null
  onClose?: () => void
  className?: string
}

interface TooltipState {
  isShown: boolean
}

class Tooltip extends React.PureComponent<TooltipProps & TooltipDefaultProps, TooltipState> {
  static defaultProps: TooltipDefaultProps = {
    position: 'top',
    showDelay: 0,
    tooltipProps: {},
    wrapperClassName: '',
    noAnimation: false,
    isInteraction: false,
    fixPosition: {
      left: 0,
      top: 0,
    },
  }
  timeoutEnter?: number = 0
  timeoutLeave?: number = 0
  tooltipWrapper: React.RefObject<HTMLDivElement> = React.createRef()

  state = {
    isShown: false,
  }

  static getDerivedStateFromProps(props: TooltipProps, state: TooltipState) {
    if (props.showByProps && props.isVisible !== state.isShown) {
      return { isShown: props.isVisible }
    }
    return null
  }

  componentDidMount() {
    // Note: call forceUpdate to pass correct parentNode to tooltipContainer,
    // cause on first render ref this.tooltipWrapper will be undefined
    if (this.state.isShown) {
      this.forceUpdate()
    }
  }

  componentDidUpdate() {
    if (this.state.isShown) {
      window.addEventListener('click', this.handleWindowClick)
    } else {
      window.removeEventListener('click', this.handleWindowClick)
    }
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.handleWindowClick)
    clearTimeout(this.timeoutEnter)
    clearTimeout(this.timeoutLeave)
  }

  tooltipShowing() {
    if (this.props.showingCallback) {
      this.props.showingCallback()
    }
  }

  handleMouseEnter = () => {
    if (this.props.showByProps) {
      return
    }
    if (this.props.showDelay !== 0) {
      this.timeoutEnter = window.setTimeout(
        () => this.setState({ isShown: true }, this.tooltipShowing),
        this.props.showDelay,
      )
    } else {
      this.setState({ isShown: true }, this.tooltipShowing)
    }
    clearTimeout(this.timeoutLeave)
  }

  handleMouseLeave = () => {
    if (this.props.showByProps) {
      return
    }
    if (this.props.isInteraction) {
      this.timeoutLeave = window.setTimeout(() => this.setState({ isShown: false }), 300)
    } else {
      this.setState({ isShown: false })
    }
    clearTimeout(this.timeoutEnter)
  }

  handleWindowClick = (e) => {
    if (e.target.closest(`.${cn()}`)) {
      return
    }
    const tooltipWrapper = this.props.nodeToShow || this.tooltipWrapper.current
    if (tooltipWrapper && tooltipWrapper.contains(e.target)) {
      return
    }

    if (this.props.showByProps && this.props.onClose) {
      this.props.onClose()
      return
    }
    this.setState({ isShown: false })
  }

  handleTooltipEnter = () => {
    if (this.props.showByProps || !this.props.isInteraction) {
      return
    }
    clearTimeout(this.timeoutLeave)
    this.setState({ isShown: true })
  }

  handleTooltipLeave = () => {
    if (this.props.showByProps || !this.props.isInteraction) {
      return
    }
    this.timeoutLeave = window.setTimeout(() => {
      return this.setState({ isShown: false })
    }, 300)
  }

  render() {
    const { isShown } = this.state
    const { nodeToShow } = this.props
    return (
      <>
        {!nodeToShow && (
          <div
            {...this.props.wrapperProps}
            ref={this.tooltipWrapper}
            onMouseEnter={this.handleMouseEnter}
            onMouseLeave={this.handleMouseLeave}
            className={this.props.wrapperClassName}
            data-testid="tooltip-wrapper"
          >
            {this.props.children}
          </div>
        )}
        <TooltipContainer
          {...this.props}
          isShown={isShown}
          onMouseEnter={this.handleTooltipEnter}
          onMouseLeave={this.handleTooltipLeave}
          parentNode={nodeToShow || this.tooltipWrapper.current}
        />
      </>
    )
  }
}

interface TooltipContainerProps extends TooltipProps {
  parentNode: HTMLElement | null
  isShown: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
}

interface TooltipContainerState {
  top: number
  left: number
}

class TooltipContainer extends React.PureComponent<
  TooltipContainerProps & TooltipDefaultProps,
  TooltipContainerState
> {
  tooltipContainerHeight: number = 0
  tooltipContainerWidth: number = 0
  leftFix: number = 0
  rightFix: number = 0
  tooltipContainer: React.RefObject<HTMLDivElement> = React.createRef()
  tooltipArrow: HTMLDivElement | null
  updateArrowPositionFrame: number
  updateTooltipSizeFrame: number

  state = {
    top: 0,
    left: 0,
  }

  handleWindowResize = throttle(() => {
    this.updateTooltipSize()
  }, 200)

  componentDidMount() {
    if (this.props.isShown) {
      window.addEventListener('resize', this.handleWindowResize)
    }
  }

  componentDidUpdate(prevProps: TooltipContainerProps) {
    if (this.props.isShown) {
      if (
        prevProps.parentNode !== this.props.parentNode ||
        prevProps.isShown !== this.props.isShown
      ) {
        window.addEventListener('resize', this.handleWindowResize)
        this.updateTooltipSize()
      }
    } else {
      window.removeEventListener('resize', this.handleWindowResize)
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowResize)
    window.cancelAnimationFrame(this.updateTooltipSizeFrame)
    window.cancelAnimationFrame(this.updateArrowPositionFrame)
  }

  updateTooltipSize = () => {
    const tooltipContainer = this.tooltipContainer.current
    window.cancelAnimationFrame(this.updateTooltipSizeFrame)
    this.updateTooltipSizeFrame = window.requestAnimationFrame(() => {
      if (tooltipContainer) {
        this.tooltipContainerWidth = tooltipContainer.offsetWidth
        this.tooltipContainerHeight = tooltipContainer.offsetHeight
        this.updateTooltipPosition()
      }
    })
  }

  updateArrowPosition = () => {
    if (this.props.position === 'top' || this.props.position === 'bottom') {
      window.cancelAnimationFrame(this.updateArrowPositionFrame)
      this.updateArrowPositionFrame = window.requestAnimationFrame(() => {
        if (this.leftFix !== 0) {
          this.tooltipArrow!.style.left = this.leftFix * 2 + 'px'
        } else if (this.rightFix !== 0) {
          this.tooltipArrow!.style.left = -1 * this.rightFix * 2 + 'px'
        }
      })
    }
  }

  updateTooltipPosition = () => {
    const { parentNode, position: relativePosition, fixPosition } = this.props
    if (!parentNode) {
      return
    }
    const pNodePosition = parentNode.getBoundingClientRect()
    let left, top
    const position = {
      left: pNodePosition.left,
      top: pNodePosition.top,
      right: pNodePosition.right,
      bottom: pNodePosition.bottom,
      width: pNodePosition.right - pNodePosition.left,
      height: pNodePosition.bottom - pNodePosition.top,
    }
    const scrollTop =
      window.pageYOffset || document.documentElement!.scrollTop || body!.scrollTop || 0
    const scrollLeft =
      window.pageXOffset || document.documentElement!.scrollLeft || body!.scrollLeft || 0
    switch (relativePosition) {
      case 'top':
        left = position.left + (position.width - this.tooltipContainerWidth) / 2
        top = scrollTop + position.top - TOOLTIP_CORNER_HEIGHT - this.tooltipContainerHeight
        break
      case 'bottom':
        left = position.left + (position.width - this.tooltipContainerWidth) / 2
        top = scrollTop + position.bottom + TOOLTIP_CORNER_HEIGHT
        break
      case 'left':
        left = scrollLeft + position.left - TOOLTIP_CORNER_HEIGHT - this.tooltipContainerWidth
        top = scrollTop + position.top + position.height / 2 - this.tooltipContainerHeight / 2
        break
      case 'right':
        left = scrollLeft + position.right + TOOLTIP_CORNER_HEIGHT
        top = scrollTop + position.top + position.height / 2 - this.tooltipContainerHeight / 2
        break
      default:
    }
    // fix when tooltip is out of screen
    if (
      (relativePosition === 'top' || relativePosition === 'bottom') &&
      left + this.tooltipContainerWidth > body!.clientWidth - TOOLTIP_INDENT
    ) {
      this.leftFix = left + this.tooltipContainerWidth - body!.clientWidth + TOOLTIP_INDENT
      left = left - this.leftFix
    } else if (
      (relativePosition === 'top' || relativePosition === 'bottom') &&
      left < TOOLTIP_INDENT
    ) {
      this.rightFix = TOOLTIP_INDENT - left
      left = left + this.rightFix
    } else {
      this.leftFix = 0
      this.rightFix = 0
    }
    left = left + (fixPosition!.left || 0)
    top = top + (fixPosition!.top || 0)
    this.setState({
      top,
      left,
    })
  }

  render() {
    const {
      isShown,
      noAnimation,
      isInteraction,
      tooltip,
      tooltipProps,
      onMouseEnter,
      onMouseLeave,
      className,
    } = this.props
    const { top, left } = this.state

    const TooltipElement = tooltip

    if (!isShown && noAnimation) {
      return null
    }

    return createPortal(
      <CSSTransition
        classNames={'tooltip'}
        appear={!this.props.noAnimation}
        timeout={{ enter: 500, exit: 300 }}
        in={isShown}
        unmountOnExit={true}
      >
        <div
          ref={this.tooltipContainer}
          style={{
            top,
            left,
          }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          className={cn(null, {
            '--is-interaction': isInteraction!,
            [`--${this.props.position}`]: true,
            '--visible': true,
            [`${className}`]: !!className,
          })}
          data-testid="tooltip"
        >
          <div className={cn('inner')}>
            <TooltipElement {...tooltipProps} updatePositionCallback={this.updateTooltipSize} />
          </div>
          <div className={cn('arrow-wrapper')} ref={(div) => (this.tooltipArrow = div)}>
            <div className={cn('arrow')} />
          </div>
        </div>
      </CSSTransition>,
      tooltips!,
    )
  }
}

export default Tooltip
