import * as React from 'react'
import { connect } from 'react-redux'
import clssnms from 'clssnms'
import { withTranslation, WithTranslation } from 'react-i18next'
import Guestia from 'guestia/client'
import { reachGoal } from 'common/js/redux/actions/metrics.actions'
import './quiz.scss'

export interface Question {
  id: string
  cookie_name: string
  text: string
  answers: Answer[]
}

export interface Answer {
  id: string
  text: string
}

interface SearchParams {
  [caseOrName: string]: any
}

interface Props extends WithTranslation {
  question: Question | undefined
  searchParams: SearchParams
  searchId: string
  reachGoal: (event: string, data: {}) => void
  onAnswered: (questionAndAnswer: { question: Question; answer: Answer }) => void
}

interface State {
  isAnswered: boolean
}

export const applyPlacesToText = (text: string, searchParams: SearchParams) =>
  text.replace(
    /%(origin|destination)(?:_([a-z]{2}))?%/g,
    (m: never, place: string, caseId: string) =>
      searchParams[`${place}_cases`]
        ? searchParams[`${place}_cases`][caseId]
        : undefined || searchParams[`${place}_name`],
  )

const classNames = clssnms('preroll-quiz')

export class Quiz extends React.Component<Props, State> {
  static displayName = 'PrerollQuiz'

  state: State = {
    isAnswered: false,
  }

  handleAnswerClick = (answer: Answer) => () => {
    const { question, onAnswered } = this.props

    if (question) {
      if (question.cookie_name) {
        Guestia.setSettings(question.cookie_name, answer.id)
      }

      this.setState({ isAnswered: true })

      // ! SMELL: global injection makes the component impure, functionality is impossible to test
      this.props.reachGoal('PREROLL_ANSWER_CLICK', {
        question: question.id,
        answer: answer.id,
        search_id: this.props.searchId,
      })

      onAnswered({ question, answer })
    }
  }

  applyPlacesToText = (text: string) => applyPlacesToText(text, this.props.searchParams)

  renderQuestion = ({ text, answers }: Question) => (
    <React.Fragment>
      <h3 className={classNames('question-title')}>{this.props.t('preroll:quiz.questionTitle')}</h3>
      <h1 className={classNames('question')} data-testid="question-text">
        {this.applyPlacesToText(text)}
      </h1>
      <div className={classNames('answers')} data-testid="answers-list">
        {answers.map((answer) => (
          <a
            key={answer.id}
            title={answer.text}
            onClick={this.handleAnswerClick(answer)}
            className={classNames('answer')}
            data-testid="answer"
          >
            {answer.text}
          </a>
        ))}
      </div>
    </React.Fragment>
  )

  renderThanks = () => (
    <div className={classNames('thanks')}>
      <div className={classNames('thanks-image')} />
      <h1 className={classNames('thanks-text')}>{this.props.t('preroll:quiz.thanksText')}</h1>
    </div>
  )

  render() {
    const { isAnswered } = this.state
    const { question } = this.props
    return (
      <div className={classNames()} data-testid="preroll-quiz">
        {question ? this.renderQuestion(question) : isAnswered ? this.renderThanks() : null}
      </div>
    )
  }
}

const mapStateToProps = (state: any) => ({
  searchId: state.searchId,
  searchParams: state.searchParams,
})

const mapDispatchToProps = (dispatch) => ({
  reachGoal: (event, data) => dispatch(reachGoal(event, data)),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation('preroll')(Quiz))
