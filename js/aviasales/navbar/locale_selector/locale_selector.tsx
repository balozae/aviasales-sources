import React from 'react'
import i18next from 'i18next'
import { useTranslation } from 'react-i18next'
import { connect } from 'react-redux'
import clssnms from 'clssnms'
import { setCurrency } from 'common/utils/currencies'
import { changeLanguage } from 'common/js/redux/actions/i18n.actions'
import { LocaleSelectorType, LocaleData } from './locale_selector.types'
import { getLocaleData } from './locale_selector.utils'
import Dropdown from 'shared_components/dropdown/dropdown'
import LocaleSelectorContent from './locale_selector_content'
import { reachGoal } from 'common/js/redux/actions/metrics.actions'
import { updateCurrency } from 'common/js/redux/actions/currency.actions'

import './locale_selector.scss'

export const cn = clssnms('locale-selector')

interface ILocaleSelectorStateProps {
  currency: string // 3-letter currency code
}

interface ILocaleSelectorDispatchProps {
  onChangeCurrency?: (currency: string) => void
  onChangeLanguage?: (language: string) => void
  onChangeCountry?: (country: string) => void
  onShow?: () => void
  onSelectorTypeChange?: (type: LocaleSelectorType) => void
}

export type ILocaleSelectorProps = ILocaleSelectorStateProps & ILocaleSelectorDispatchProps

interface ILocaleSelectorState {
  language: string // 2-letter language code
  country: string // 2-letter country code
  localeData: LocaleData | null
  isDropdownVisible: boolean
}

export class LocaleSelector extends React.PureComponent<
  ILocaleSelectorProps,
  ILocaleSelectorState
> {
  state = {
    language: i18next.language || 'ru',
    country: 'ru',
    localeData: null,
    isDropdownVisible: false,
  }

  componentDidMount() {
    // TODO Move localeData to container
    this.setState({ localeData: getLocaleData() })

    i18next.on('loaded', () => {
      this.setState({ localeData: getLocaleData() })
    })
  }

  toggleDropdown = () => {
    this.setState(({ isDropdownVisible }) => {
      const newIsDropdownVisible = !isDropdownVisible

      if (newIsDropdownVisible && this.props.onShow) {
        this.props.onShow()
      }

      return { isDropdownVisible: newIsDropdownVisible }
    })
  }

  closeDropdown = () => {
    this.setState({ isDropdownVisible: false })
  }

  handleLanguageChange = (language: string) => {
    const { onChangeLanguage } = this.props

    this.setState({ language, isDropdownVisible: false })

    if (onChangeLanguage) {
      onChangeLanguage(language)
    }
  }

  handleCountryChange = (value: string) => {
    const { onChangeCountry } = this.props

    this.closeDropdown()

    if (onChangeCountry) {
      onChangeCountry(value)
    }
  }

  handleCurrencyChange = (value: string) => {
    const { onChangeCurrency } = this.props

    this.closeDropdown()

    if (onChangeCurrency) {
      onChangeCurrency(value)
    }
  }

  getDropdownContent = () => {
    const { language, country, localeData } = this.state
    const { currency, onSelectorTypeChange } = this.props

    return (
      <div className={cn('')}>
        <LocaleSelectorContent
          currency={currency}
          language={language}
          country={country}
          localeData={localeData}
          onChangeCurrency={this.handleCurrencyChange}
          onChangeLanguage={this.handleLanguageChange}
          onChangeCountry={this.handleCountryChange}
          onSelectorTypeChange={onSelectorTypeChange}
        />
      </div>
    )
  }

  render() {
    const { language, localeData = {} as LocaleData, isDropdownVisible } = this.state

    const showLang = language && localeData && localeData.language ? true : false

    // @ts-ignore
    const langLabel = showLang && localeData.language.find((item) => item.value === language).label

    // NOTE: added specific min-width to prevent different widths with diff params
    // example: TZS and UAH have different width
    const controlClassName =
      showLang && this.props.currency ? cn('control', ['--wide']) : cn('control')

    return (
      <Dropdown
        visible={isDropdownVisible}
        dropdownContent={this.getDropdownContent()}
        onClose={this.closeDropdown}
        modalHeader={<ModalHeader />}
      >
        <div className={cn()}>
          <button className={controlClassName} onClick={this.toggleDropdown} type="button">
            {!!this.props.currency && (
              <span className={cn('label-text', ['--currency'])}>{this.props.currency}</span>
            )}
            {showLang &&
              langLabel && <span className={cn('label-text', ['--lang'])}>{langLabel}</span>}
          </button>
        </div>
      </Dropdown>
    )
  }
}

const ModalHeader: React.FC = () => {
  const { t } = useTranslation()
  return <>{t('common:settings')}</>
}

const mapStateToProps = (state): ILocaleSelectorStateProps => ({
  currency: state.currency,
})

const mapDispatchToProps = (dispatch): ILocaleSelectorDispatchProps => ({
  onChangeCurrency: (currency) => {
    setCurrency(currency)
    dispatch(updateCurrency(currency))
    dispatch(reachGoal('locale-selector--currency-change', { currency }))
  },
  onChangeLanguage: (language) => {
    dispatch(changeLanguage(language))
    dispatch(reachGoal('locale-selector--language-change', { language }))
  },
  onChangeCountry: (country) => {
    dispatch(reachGoal('locale-selector--country-change', { country }))
  },
  onShow: () => {
    dispatch(reachGoal('locale-selector--open'))
  },
  onSelectorTypeChange: (type) => {
    dispatch(reachGoal(`locale-selector--show-${type}`))
  },
})

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(LocaleSelector)
