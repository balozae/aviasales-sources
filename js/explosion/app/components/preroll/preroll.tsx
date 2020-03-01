import * as React from 'react'
import { connect } from 'react-redux'
import clssnms from 'clssnms'
import Quiz, { Question, Answer } from './quiz/quiz'
import PrerollTip, { TIP_VARIANTS, TipKey, TipVariants } from './tips/tips'
import MobileApps from 'shared_components/mobile_apps/mobile_apps'
import AppInfo from 'components/preroll/app_info/app_info'
import { getLink } from 'common/utils/app_links.utils'

import './preroll.scss'
import { updatePrerollQuestions } from 'common/js/redux/actions/preroll_questions.actions'

interface ComponentState {
  tipKey: TipKey
}

interface ComponentProps {
  defaultTipKey?: TipKey
}

interface DispatchProps {
  updateQuestions: (updateQuestionsRequest: { question: Question; answer: Answer }) => void
}

interface StateProps {
  questions: Question[] | null
}

type Props = ComponentProps & DispatchProps & StateProps

function getRandomTipKey(obj: TipVariants): TipKey {
  const names = Object.keys(obj)
  return names[Math.floor(Math.random() * names.length)] as TipKey
}

const classNames = clssnms('preroll')

export class Preroll extends React.Component<Props, ComponentState> {
  static displayName = 'Preroll'

  state = {
    tipKey: this.props.defaultTipKey || getRandomTipKey(TIP_VARIANTS),
  }

  isLoading = () => this.props.questions === null

  renderSpinner = () => (
    <div className={classNames('spinner', 'preroll-spinner')} data-testid="spinner" />
  )

  renderContent = () => {
    const { questions, updateQuestions } = this.props

    return questions && questions.length ? (
      <Quiz question={questions[0]} onAnswered={updateQuestions} />
    ) : (
      <PrerollTip tipKey={this.state.tipKey} />
    )
  }

  render() {
    return (
      <div className={classNames()}>
        <div className={classNames('content')}>
          {this.isLoading() ? this.renderSpinner() : this.renderContent()}
        </div>
        <div className={classNames('footer')}>
          <div className={classNames('footer-rating')}>
            <AppInfo appIconClassName={classNames('footer-app-icon')} />
          </div>
          <div className={classNames('footer-actions')}>
            <MobileApps
              campaing="preroll"
              variant="responsive"
              googlePlayUrl={getLink('android', { c: 'preroll' })}
              appStoreUrl={getLink('ios', { c: 'preroll' })}
            />
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state: any) => ({
  questions: state.prerollQuestions,
})

const mapDispatchToProps = (dispatch: any) => ({
  updateQuestions: (data: any) => dispatch(updatePrerollQuestions(data)),
})

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps,
)(Preroll)
