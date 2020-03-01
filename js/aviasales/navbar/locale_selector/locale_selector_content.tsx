import React from 'react'
import i18next from 'i18next'
import { cn } from './locale_selector'
import { LocaleSelectorType, LocaleData } from './locale_selector.types'
import { ITabData } from './tabs/tabs.types'
import SelectList from './select_list/select_list'
import Tabs from './tabs/tabs'

import './locale_selector.scss'

export interface ILocaleSelectorContentProps {
  currency: string
  language: string
  country: string
  localeData: LocaleData | null
  onChangeCurrency?: (currency: string) => void
  onChangeLanguage?: (language: string) => void
  onChangeCountry?: (country: string) => void
  onShow?: () => void
  onSelectorTypeChange?: (type: LocaleSelectorType) => void
}

interface ILocaleSelectorContentState {
  tabs: ITabData[]
}

class LocaleSelectorContent extends React.PureComponent<
  ILocaleSelectorContentProps,
  ILocaleSelectorContentState
> {
  state = {
    tabs: [],
  }

  setSelectHandler = (name: LocaleSelectorType) => {
    const { onChangeCurrency, onChangeLanguage, onChangeCountry } = this.props

    switch (name) {
      case LocaleSelectorType.currency:
        return onChangeCurrency
      case LocaleSelectorType.language:
        return onChangeLanguage
      case LocaleSelectorType.country:
        return onChangeCountry
      default:
        return () => null
    }
  }

  componentDidMount() {
    const { props } = this
    const { localeData } = props

    // Генерим контент для табов из данных
    if (!localeData) {
      return
    }

    const localeDataKeys = Object.keys(localeData).filter((key) => !!localeData[key])

    const tabs: ITabData[] = []

    localeDataKeys.forEach((key: LocaleSelectorType) => {
      tabs.push({
        id: key,
        title: i18next.t(`common:${key}`),
        subtitle: this.getTabSubtitle(key), // Нынешнее значение для подзаголовка таба
        content: localeData[key]!.length ? ( // Пустые ключи отфильтрованы выше
          <SelectList
            items={localeData[key]!} // Пустые ключи отфильтрованы выше
            value={props[key]}
            withFlags={key === LocaleSelectorType.country}
            onSelect={this.setSelectHandler(key)}
            className={`--${key}`}
          />
        ) : (
          <></>
        ),
      })
    })

    this.setState({ tabs })
  }

  getTabSubtitle = (tabId: LocaleSelectorType) => {
    const { props } = this
    const { localeData } = this.props

    // Ищем в данных таба лейбл для выбранного значения, чтобы вывести в подзаголовке таба.
    // ID таба совпадает с ключом в props
    const selectItem =
      localeData &&
      Array.isArray(localeData[tabId]) &&
      localeData[tabId]!.find((item) => {
        return item.value === props[tabId]
      })

    if (!selectItem) {
      return
    }

    return selectItem.text
  }

  handleTabChange = (tabId: LocaleSelectorType) => {
    const { onSelectorTypeChange } = this.props

    if (onSelectorTypeChange) {
      onSelectorTypeChange(tabId)
    }
  }

  render() {
    const { tabs } = this.state

    if (!tabs.length) {
      return <></>
    }

    return <Tabs tabs={tabs} className={cn('tabs')} onTabChange={this.handleTabChange} />
  }
}

export default LocaleSelectorContent
