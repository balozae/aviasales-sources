import * as React from 'react'
import update from 'immutability-helper'
import { PlaceType, PlaceField, Place, FormError } from 'form/components/avia_form/avia_form.types'
import { ANYWHERE, DEFAULT_PASSENGERS } from 'form/components/avia_form/avia_form.constants'
import Downshift, { ControllerStateAndHelpers, StateChangeOptions } from 'downshift'
import cn from 'clssnms'
import { InitialInputState } from 'form/types'
import Price from 'common/js/react_components/price/price.coffee'
import { HistoryItem } from './search_history'
import { SearchHistory, TripClass } from 'common/types'
import AutocompleteInput from './autocomplete_input'
import { escapeRegExp } from '../avia_form/utils'
import { useTranslation } from 'react-i18next'
import { checkTripClass } from 'common/utils/trip_class_helper'
import i18next from 'i18next'

const classNames = cn('autocomplete')
// NOTE: if you going to debug dropdown, switch this on to show dropdown always
const DEBUG_MODE = false

interface Props {
  items: Place[]
  historyItems: HistoryItem[]
  forwardedRef: React.RefObject<HTMLInputElement>
  type: PlaceField
  error?: FormError
  onChange: (item: any) => void
  selectedItem: Place
  onStateChange: (inputValue: string, place?: Place | null) => void
  onBlur: (value: string | null) => void
  onFocus: () => void
  allowOpenSearch: boolean
  initialInputState?: InitialInputState
  searchHistory?: SearchHistory[]
  placeholder: string
}

const getTranslatedSections = () => {
  ANYWHERE.name = i18next.t('avia_form:anywhere')

  return [
    { key: 'cities', title: i18next.t('avia_form:citiesAndAirports'), places: [] },
    { key: 'countries', title: i18next.t('avia_form:countries'), places: [] },
    { key: 'history', title: i18next.t('avia_form:searchHistory'), places: [] },
    { key: 'hotels', title: i18next.t('hotels_form:hotels'), places: [] },
    { key: 'anywhere', title: '', places: [ANYWHERE] },
  ]
}

const getSectionsList = (items: Array<Place | HistoryItem>, allowOpenSearch: boolean) => {
  const addHistoryItem = (acc, place: HistoryItem) =>
    update(acc, { 2: { places: { $push: [place] } } })

  const addPlace = (acc, place) => {
    switch (place.type) {
      case PlaceType.Airport:
        // NOTE: skip airports in metropolis here. Render it in the next case
        if (place.inMetropolis) {
          return acc
        }
        return update(acc, { 0: { places: { $push: [place] } } })
      case PlaceType.City:
        const airports = items.filter((airport: Place) => airport.cityIata === place.iata)
        // NOTE: concat airports with metropolis
        return update(acc, { 0: { places: { $push: [place].concat(airports) } } })
      case PlaceType.Country:
        return update(acc, { 1: { places: { $push: [place] } } })
      case PlaceType.HotelCity:
        return update(acc, { 0: { places: { $push: [place] } } })
      case PlaceType.Hotel:
        return update(acc, { 3: { places: { $push: [place] } } })
      default:
        return acc
    }
  }
  return items
    .reduce(
      (acc, place) =>
        place.type === 'history' ? addHistoryItem(acc, place as HistoryItem) : addPlace(acc, place),
      getTranslatedSections(),
    )
    .filter(
      (section) =>
        // NOTE: don't render 'anywhere' for origin and sections with empty places
        section.key === 'anywhere' ? allowOpenSearch : section.places.length,
    )
}

export default function AutocompleteDropdown({ items, historyItems, ...props }: Props) {
  const sections: Array<any> = getSectionsList([...items, ...historyItems!], props.allowOpenSearch)
  useTranslation(['avia_form', 'hotels_form', 'additional_form_fields'])

  return (
    <Downshift
      id={props.type}
      {...props}
      initialInputValue={
        (props.initialInputState && props.initialInputState.value) || props.selectedItem.name
      }
      onStateChange={(options: StateChangeOptions<Place>) => {
        if (options.selectedItem && options.selectedItem.type === PlaceType.Anywhere) {
          return
        }
        props.onStateChange(options.inputValue || '', options.selectedItem)
      }}
      initialIsOpen={
        props.initialInputState &&
        !!props.initialInputState.value &&
        props.initialInputState.hasFocus
      }
      stateReducer={(state, changes) => {
        let newState = changes
        // NOTE: Reset highlighted item if user types something
        if (!changes.hasOwnProperty('highlightedIndex')) {
          newState = { ...newState, highlightedIndex: null }
        }
        const eventType = changes.type as string
        // HACK: Здесь хак связаный с порядком событий touch в iOS. В Downshift сделали обработку
        // какой-то проблемы связаную с этим для uncontrolled меню, а про controlled не сделали :(
        // Вот PR с пробемой, решение которой, нам всё ломает. https://github.com/paypal/downshift/pull/429
        if (
          eventType === '__autocomplete_touchstart__' &&
          state.inputValue &&
          !changes.inputValue
        ) {
          newState = { ...newState, inputValue: state.inputValue }
        }
        return newState
      }}
      itemToString={(item) => (item ? item.name : '')}
    >
      {(downshiftHelpers: ControllerStateAndHelpers<Place>) => {
        let placeIndex = 0
        return (
          <div className={classNames(null, { [`--${props.type}`]: true })}>
            <div
              className={classNames('input-wrapper', {
                '--error': !!props.error,
              })}
              data-error-message={props.error && props.error.message}
              data-testid={`autocomplete-${props.type}`}
            >
              <AutocompleteInput
                {...downshiftHelpers.getInputProps()}
                id={props.type}
                forwardedRef={props.forwardedRef}
                placeholder={props.placeholder}
                className={classNames('input')}
                initialInputState={props.initialInputState}
                autoFocus={props.initialInputState && props.initialInputState.hasFocus}
                onBlur={() => {
                  if (!DEBUG_MODE) {
                    downshiftHelpers.closeMenu()
                    props.onBlur(downshiftHelpers.inputValue)
                  }
                }}
                onFocus={() => {
                  if (
                    downshiftHelpers.inputValue === '' &&
                    (props.type === 'destination' || historyItems.length)
                  ) {
                    downshiftHelpers.openMenu()
                  }
                  props.onFocus()
                }}
                helpers={downshiftHelpers.getInputProps()}
                value={downshiftHelpers.inputValue || ''}
                onChange={downshiftHelpers.getInputProps().onChange}
              />
              <label
                className={classNames('label', {
                  '--filled':
                    !!downshiftHelpers.selectedItem && !!downshiftHelpers.selectedItem.name,
                })}
                {...downshiftHelpers.getLabelProps()}
              >
                {props.placeholder}
              </label>
              <span className={classNames('iata')}>
                {downshiftHelpers.selectedItem &&
                  downshiftHelpers.selectedItem.type !== PlaceType.Hotel &&
                  downshiftHelpers.selectedItem.iata}
              </span>
            </div>
            {(downshiftHelpers.isOpen && sections.length) || DEBUG_MODE ? (
              <div className={classNames('dropdown')}>
                {sections.map((section) => (
                  <section key={section.key}>
                    {renderSectionTitle(section, sections)}
                    {section.places.map((place) => {
                      const index = placeIndex++
                      const isHistory = place.type === 'history'
                      const iataKey = place.iata ? place.iata + place.type : place.name + place.type
                      const key = isHistory ? place.createdAt : iataKey
                      return (
                        <div
                          key={key}
                          data-testid={`suggest-${key}`}
                          {...downshiftHelpers.getItemProps({
                            item: place,
                            className: classNames('item', {
                              '--active': downshiftHelpers.highlightedIndex === index,
                              '--indent': !!place.inMetropolis,
                              [`--${place.type}`]: true,
                            }),
                          })}
                        >
                          <RenderSuggest item={place} query={downshiftHelpers.inputValue} />
                        </div>
                      )
                    })}
                  </section>
                ))}
              </div>
            ) : null}
          </div>
        )
      }}
    </Downshift>
  )
}

const HighlightSuggest = ({ query, name }: { query: string | null; name: string }) => {
  const r = new RegExp(`(${escapeRegExp(String(query))})`, 'gi')
  const matches = name.split(r)

  switch (matches.length) {
    case 3:
      const [head, match, tail] = matches
      return (
        <>
          <span>{head}</span>
          <span className={classNames('suggestion-highlight')}>{match}</span>
          <span>{tail}</span>
        </>
      )
    case 0:
      return <span>{name}</span>
    case 1:
    default:
      return <span>{matches.join('')}</span>
  }
}

const renderPlaceItem = ({ item, query }: { item: Place; query: string | null }) => {
  const higlightedSuggest = <HighlightSuggest name={item.name} query={query} />
  switch (item.type) {
    case PlaceType.Airport:
      return (
        <>
          <div className={classNames('suggestion-icon', '--airport')} />
          <div
            className={classNames('suggestion-info')}
            title={`${item.name}, ${item.countryName}`}
          >
            <span className={classNames('suggestion-main-name')}>
              {higlightedSuggest}
              {!item.inMetropolis && <span>, </span>}
            </span>
            {!item.inMetropolis && (
              <span className={classNames('suggestion-additional')}>{item.cityName}</span>
            )}
          </div>
          <div className={classNames('suggestion-hint')}>{item.iata}</div>
        </>
      )
    case PlaceType.City:
      return (
        <>
          <div
            className={classNames('suggestion-info')}
            title={`${item.name}, ${item.countryName}`}
          >
            <span className={classNames('suggestion-main-name')}>
              {higlightedSuggest}
              <span>, </span>
            </span>
            <span className={classNames('suggestion-additional')}>{item.countryName}</span>
          </div>
          <div className={classNames('suggestion-hint')}>{item.iata}</div>
        </>
      )
    case PlaceType.Country:
      return (
        <>
          <div
            className={classNames('suggestion-icon', {
              [`flag --${item.iata.toLocaleLowerCase()}`]: true,
              '--flag': true,
            })}
          />
          <div className={classNames('suggestion-info')} title={`${item.name}`}>
            {higlightedSuggest}
          </div>
          <div className={classNames('suggestion-hint')}>{item.iata}</div>
        </>
      )
    case PlaceType.Anywhere:
      return (
        <>
          <div className={classNames('suggestion-icon', '--anywhere')} />
          <div
            className={classNames('suggestion-info')}
            title={i18next.t('avia_form:findTicketsAroundTheGlobe')}
          >
            <span className={classNames('suggestion-main-name')}>
              {i18next.t('avia_form:anywhere')}
            </span>
            <span className={classNames('suggestion-additional', '--anywhere')}>
              {i18next.t('avia_form:anywhereDescriptions')}
            </span>
          </div>
        </>
      )
    case PlaceType.Hotel:
      return (
        <>
          <div className={classNames('suggestion-info')} title={item.name}>
            <span className={classNames('suggestion-main-name')}>
              {higlightedSuggest}
              <span>, </span>
            </span>
            <span className={classNames('suggestion-additional')}>{item.cityName}</span>
          </div>
        </>
      )
    case PlaceType.HotelCity:
      return (
        <>
          <div className={classNames('suggestion-info')} title={item.name}>
            <span className={classNames('suggestion-main-name')}>
              {higlightedSuggest}
              <span>, </span>
            </span>
            <span className={classNames('suggestion-additional')}>{item.countryName}</span>
            <div className={classNames('suggestion-hint', '--hotels-hint')}>
              {i18next.t('hotels_form:hotelsCount', { count: item.hotelsCount })}
            </div>
          </div>
        </>
      )
    default:
      return item ? <span>item.name</span> : null
  }
}

const renderSectionTitle = (section, sections) => {
  if (!section.title) {
    return null
  }
  const isHistory = section.key === 'history'
  const isHotels = section.key === 'hotels'
  if (isHistory || sections.length > 2 || (sections.length > 1 && isHotels)) {
    return <div className={classNames('section-title')}>{section.title}</div>
  }
  return null
}

const RenderSuggest = ({ item, query }) =>
  item.type === 'history' ? renderHistoryItem(item) : renderPlaceItem({ item, query })

const renderHistoryItem = (item: HistoryItem) => {
  const passengers = item.passengers || DEFAULT_PASSENGERS
  const paxCount = passengers.adults + passengers.children + passengers.infants
  const tripClass = i18next.t(
    `additional_form_fields:tripClasses.codes.${checkTripClass(item.tripClass)}`,
  )

  return (
    <>
      <div className={classNames('suggestion-icon', '--history')} />
      <div
        className={classNames('suggestion-info')}
        title={`${item.originIata} : ${item.destinationIata}`}
      >
        <span className={classNames('suggestion-main-name')}>
          {item.originCityIata || item.originIata} {item.isOneWay ? '→' : '↔︎'}{' '}
          {item.destinationCityIata || item.destinationIata}
        </span>
        <span className={classNames('suggestion-additional', '--history')}>
          {item.date}, {paxCount}, {tripClass.toLowerCase()}
        </span>
      </div>
      <div className={classNames('suggestion-hint')}>
        <Price valueInRubles={item.price} />
      </div>
    </>
  )
}
