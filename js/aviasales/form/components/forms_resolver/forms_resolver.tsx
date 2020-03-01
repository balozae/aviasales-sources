import React from 'react'
import viewport from 'browser-viewport'
import TripParams from 'utils/trip_params.coffee'
import clssnms from 'clssnms'
import Resizer from 'shared_components/resizer'
import { FormType, InitialInputValues } from 'form/types'
import AviaForm from '../avia_form/avia_form'
import Spinner from 'components/spinner/spinner'
import { SearchParams } from '../avia_form/avia_form.types'
import { CollapsedForm } from '../collapsed_form/collapsed_form'
import { isValidSegment } from 'common/js/redux/actions/start_search/start_search.utils'
import './forms_resolver.scss'

const cn = clssnms('forms-resolver')

export interface FormsResolverProps {
  activeForm: FormType
  isDarkTheme: boolean
  initialInputValues: InitialInputValues
  isStickyHeader?: boolean
  requestId: string
  onCollapse: (isCollapsed: boolean) => void
  reachGoal: (event: string, data?: any) => void
  formParams: {
    avia: SearchParams
    multiway: SearchParams
  }
  isFormCollapsable: boolean
}

interface State {
  isCollapsed: boolean
  isCollapsable: boolean
  prevProps: Partial<FormsResolverProps>
}

const formTypeToComponent = {
  avia: AviaForm,
  multiway: React.lazy(() =>
    import(/* webpackChunkName: "multiway_form" */ '../multiway_form/multiway_form'),
  ),
  hotel: React.lazy(() => import(/* webpackChunkName: "hotel_form" */ '../hotel_form/hotel_form')),
}

export class FormsResolver extends React.PureComponent<FormsResolverProps, State> {
  state: State = {
    isCollapsed: false,
    isCollapsable: false,
    prevProps: {},
  }

  static getIsCollapsable(props: FormsResolverProps) {
    const formParams: SearchParams = props.formParams[props.activeForm]
    return (
      ['avia', 'multiway'].includes(props.activeForm) &&
      formParams.segments.some((segment) => isValidSegment(segment, true)) &&
      props.isFormCollapsable &&
      (TripParams.isOpenJaw(formParams.segments) || Resizer.matches('mobile, mobileLandscape'))
    )
  }

  static getDerivedStateFromProps(props: FormsResolverProps, state: State) {
    const newState: Partial<State> = { isCollapsable: FormsResolver.getIsCollapsable(props) }

    if (props.requestId !== state.prevProps.requestId && newState.isCollapsable) {
      newState.isCollapsed = true
    }

    if (props.isStickyHeader && !state.prevProps.isStickyHeader && newState.isCollapsable) {
      newState.isCollapsed = true
    }

    return {
      ...newState,
      prevProps: { requestId: props.requestId, isStickyHeader: props.isStickyHeader },
    }
  }

  componentDidUpdate(prevProps: FormsResolverProps, prevState: State) {
    if (prevState.isCollapsed !== this.state.isCollapsed) {
      this.props.onCollapse(this.state.isCollapsed)
    }
  }

  componentDidMount() {
    if (this.state.isCollapsed) {
      this.props.onCollapse(this.state.isCollapsed)
    }
    Resizer.onMode(
      'mobile, mobileLandscape',
      this.handleResizeModeChange,
      this.handleResizeModeChange,
    )
  }

  componentWillUnmount() {
    this.props.onCollapse(false)
    Resizer.offMode(
      'mobile, mobileLandscape',
      this.handleResizeModeChange,
      this.handleResizeModeChange,
    )
  }

  handleResizeModeChange = () =>
    this.setState({ isCollapsable: FormsResolver.getIsCollapsable(this.props) })

  handleToggleCollapse = (source: 'edit-button' | 'collapsed-plate' | 'collapse') => {
    this.setState({ isCollapsed: !this.state.isCollapsed })
    this.props.reachGoal(`collapsed-form--${source}-click`)
    if (this.state.isCollapsed) {
      viewport.scrollTop(0, 300)
    }
  }

  handleCollapse = () => this.handleToggleCollapse('collapse')

  render() {
    const { isCollapsed, isCollapsable } = this.state
    const { isDarkTheme, initialInputValues, activeForm } = this.props
    const formParams = this.props.formParams[activeForm]
    const Form = formTypeToComponent[activeForm]

    return (
      <React.Suspense fallback={<Spinner mod={isDarkTheme ? 'primary' : 'white'} />}>
        <div className={cn()}>
          <div className={cn('forms-wrap')}>
            {!(isCollapsable && isCollapsed) ? (
              <>
                <Form shouldFocusFirstEmptyField={true} initialInputValues={initialInputValues} />
                {isCollapsable &&
                  !isCollapsed && <div className={cn('collapse')} onClick={this.handleCollapse} />}
              </>
            ) : (
              <CollapsedForm formParams={formParams} onEditClick={this.handleToggleCollapse} />
            )}
          </div>
        </div>
      </React.Suspense>
    )
  }
}
