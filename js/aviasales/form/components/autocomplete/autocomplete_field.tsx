import * as React from 'react'
import { PlaceField, Place, FormError, PlaceType } from 'form/components/avia_form/avia_form.types'
import './autocomplete.scss'
import AutocompleteFetcher from 'form/components/autocomplete/autocomplete_fetcher'
import AutocompleteDropdown from 'form/components/autocomplete/autocomplete_dropdown'
import { DEFAULT_PLACE } from 'form/components/avia_form/avia_form.constants'
import throttle from 'lodash/throttle'
import { InitialInputState, FormType } from 'form/types'
import { SearchHistory } from 'common/types'
import SearchHistoryController, { HistoryItem } from './search_history'
import after from 'common/utils/after'
import { withTranslation, WithTranslation } from 'react-i18next'

interface Props extends WithTranslation {
  forwardedRef: React.RefObject<HTMLInputElement>
  error?: FormError
  onSelect: (suggestion: Place | HistoryItem, moveToNext?: boolean) => void
  value: Place
  initialInputState?: InitialInputState
  siblingValue?: Place
  searchHistory?: SearchHistory[]
  type: PlaceField
  allowOpenSearch: boolean
  reachGoal: (event: string, data?: any) => void
  formType?: FormType
  placeholder?: string
}

interface State {
  suggestions: Place[]
  historyItems?: HistoryItem[]
  inputValue: string
}

export type Suggestion = { title: string | null; places: Place[] }

class AutocompleteField extends React.Component<Props, State> {
  fetcher: AutocompleteFetcher

  // Тротлим выбр элемента чтобы избежать дублирующих срабатываний после блюра:
  // в дауншифте блюр срабатывает после выбора элемента и автоподстановка может перетереть
  // выбранный пользователем элемент.
  selectItem = throttle(
    (selectedItem: Place, moveToNext?: boolean) => {
      this.setState({ suggestions: [] })
      if (this.props.forwardedRef.current) {
        this.props.forwardedRef.current.blur()
      }
      this.props.onSelect(selectedItem, moveToNext)
    },
    300,
    { trailing: false },
  )

  static getDerivedStateFromProps(props: Props, state: State) {
    const { searchHistory, type, siblingValue = DEFAULT_PLACE } = props
    const historyItems = SearchHistoryController.getHistoryItems(
      searchHistory || [],
      state.suggestions,
      type,
      siblingValue,
      state.inputValue,
    )
    return { historyItems }
  }

  constructor(props: Props) {
    super(props)
    this.fetcher = new AutocompleteFetcher({
      allowOpenSearch: props.allowOpenSearch,
      fetchHotels: props.formType === 'hotel',
    })
    this.state = {
      suggestions: [],
      inputValue: '',
    }
  }

  componentDidMount() {
    if (this.props.initialInputState && this.props.initialInputState.value) {
      if (this.props.initialInputState.hasFocus) {
        this.handleInputChange(this.props.initialInputState.value)
      } else {
        this.suggestString(this.props.initialInputState.value)
      }
    } else if (
      (!this.props.value.iata || !this.props.value.name) &&
      this.props.value.type !== PlaceType.Anywhere
    ) {
      this.suggestString(this.props.value.iata || this.props.value.name)
    }
  }

  componentDidUpdate(prevProps: Props) {
    const isAirportAndNoIata: boolean =
      !this.props.value.iata && this.props.value.type === PlaceType.Airport

    if (
      prevProps.value !== this.props.value &&
      (isAirportAndNoIata || !this.props.value.name) &&
      this.props.value.type !== PlaceType.Anywhere
    ) {
      this.suggestString(this.props.value.iata || this.props.value.name)
    }
  }

  handleSelect = (selection: Place) => {
    this.selectItem(selection, true)
    this.props.reachGoal(`${this.props.type}Suggestion--select`)
  }

  handleFocus = () => {
    this.setState({ suggestions: [] })
    after(55, () => {
      const ref = this.props.forwardedRef
      if (ref && ref.current && ref.current.setSelectionRange) {
        ref.current.setSelectionRange(0, 9999)
      }
    })
    // NOTE: its fix for all android devices - scroll
    // to form, cuz users didnt saw suggestions
    if (navigator.userAgent.toLowerCase().indexOf('android') > -1) {
      const formEl: HTMLElement | null = document.querySelector('.of_main_form')
      if (formEl) {
        window.scrollTo(0, formEl.offsetTop - 60)
      }
    }
    this.props.reachGoal(`${this.props.type}--focus`)
  }

  handleBlur = (value: string) => {
    if (!value) {
      return this.selectItem(DEFAULT_PLACE, false)
    }
    if (this.state.suggestions.length) {
      const suggestion = AutocompleteFetcher.getSuggestion(this.state.suggestions, value)
      this.selectItem(suggestion, false)
    } else if (this.fetcher.isInProgress()) {
      this.fetcher.onServerResponse((suggestions) => {
        const suggestion = AutocompleteFetcher.getSuggestion(suggestions, value)
        this.selectItem(suggestion, false)
      })
    }
    this.props.reachGoal(`${this.props.type}--blur`)
  }

  suggestString = async (query: string) => {
    if (!query) {
      return
    }
    const [result, suggestions] = await this.fetcher.performRequest(query)
    if (result === 'ok') {
      const suggestion = AutocompleteFetcher.getSuggestion(suggestions, query)
      if (suggestion.type !== PlaceType.Hotel) {
        this.props.onSelect(suggestion, false)
      } else {
        this.props.onSelect(DEFAULT_PLACE, false)
      }
    }
  }

  isFocused = () => {
    return this.props.forwardedRef.current === document.activeElement
  }

  checkExactlyMatch = (suggestions: Place[], query: string) => {
    query = query.toLowerCase()
    switch (suggestions.length) {
      case 0:
        return false
      case 1:
        return suggestions[0].name.toLowerCase() === query
      default:
        return suggestions[0].name.toLowerCase() === query && !suggestions[0].isMetropolis
    }
  }

  handleInputChange = async (value: string = '', place?: Place | null) => {
    value = value.trim()
    if (value === this.props.value.name || (place && place.iata)) {
      return
    }
    const [result, suggestions] = await this.fetcher.performRequest(value)
    if (result === 'ok') {
      this.setState({ suggestions, inputValue: value })
      if (this.checkExactlyMatch(suggestions, value)) {
        this.selectItem(AutocompleteFetcher.getSuggestion(suggestions, value), true)
      }
    } else {
      this.setState({ inputValue: value })
    }
  }

  getPlaceholder() {
    if (this.props.placeholder) {
      return this.props.placeholder
    }
    const { t } = this.props
    const isOrigin = this.props.type === 'origin'
    return isOrigin ? t('avia_form:originPlaceholder') : t('avia_form:destinationPlaceholder')
  }

  render() {
    return (
      <>
        <AutocompleteDropdown
          onChange={this.handleSelect}
          selectedItem={this.props.value}
          items={this.state.suggestions}
          historyItems={this.state.historyItems || []}
          type={this.props.type}
          forwardedRef={this.props.forwardedRef}
          onStateChange={this.handleInputChange}
          onBlur={this.handleBlur}
          onFocus={this.handleFocus}
          error={this.props.error}
          allowOpenSearch={this.props.allowOpenSearch}
          initialInputState={this.props.initialInputState}
          placeholder={this.getPlaceholder()}
        />
        {/* seems like we need this input for clicktripz or something like this */}
        <input
          name="origin_iata"
          type="hidden"
          value={this.props.value.iata || ''}
          data-city-iata={this.props.value.iata}
          readOnly={true}
        />
      </>
    )
  }
}

export default withTranslation('avia_form')(AutocompleteField)
