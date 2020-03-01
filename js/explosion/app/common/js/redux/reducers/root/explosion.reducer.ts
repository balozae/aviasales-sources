import searchParams from '../search_params.reducer'
import prerollQuestions from '../preroll_questions.reducer'
import searchStatus from '../search_status.reducer'
import airlines from '../airlines.reducer'
import popups from '../popups.reducer'
import advertisement from '../advertisement.reducer'
import tickets from '../tickets.reducer'
import searchHistory from '../search_history.reducer'
import popularFilters from '../popular_filters.reducer'
import filters from '../filters.reducer'
import prediction from '../prediction.reducer'
import fixedFlights from '../fixed_flights.reducer'
import gatesMeta from '../gates_meta.reducer'
import serverName from '../server_name.reducer'
import debugSettings from '../debug_settings.reducer'
import sysState from '../sys_state.reducer'
import pageHeader from '../page_header.reducer'
import currency from '../currency.reducer'
import calendarPrices from '../calendar_prices.reducer'
import offline from '../offline.reducer'
import selectedScheduleTickets from '../selected_schedule_tickets.reducer'
import aviaParams from '../avia_params.reducer'
import hotelParams from '../hotel_params.reducer'
import multiwayParams from '../multiway_params.reducer'
import requestId from '../request_id.reducer'
import flightInfo from '../flight_info.reducer'
import adSenseParams from '../adSense_params.reducer'
import topPlacementTicket from '../top_placement_ticket.reducer'
import cheapestTicket from '../cheapest_ticket.reducer'
import cityDistance from '../city_distance.reducer'
import savedFiltersHighlighted from '../saved_filters_highlighted.reducer'
import savedFilters from '../saved_filters.reducer'
import bestSellerData from '../best_seller_data.reducer'
import heaviestTopPlacementCampaign from '../heaviest_top_placement_campaign.reducer'
import showGatesFeedbackData from '../show_gates_feedback_data.reducer'
import creditPartner from '../credit_partner.reducer'
import sort from '../sort.reducer'
import searchId from '../search_id.reducer'
import airports from '../airports.reducer'
import gates from '../gates.reducer'
import currencies from '../currencies.reducer'
import highlightedTicketParams from '../highlighted_ticket_params.reducer'
import cheapestStops from '../cheapest_stops.reducer'
import error from '../error.reducer'
import isBlackOverlayShown from '../is_black_overlay_shown.reducer'
import firstTicketArrivedAt from '../first_ticket_arrived_at.reducer'
import isSearchFinished from '../is_search_finished.reducer'
import isTopPlacementShown from '../is_top_placement_shown.reducer'
import errorDuringSearch from '../error_during_search.reducer'
import travelpayoutsBarProps from '../travelpayouts_bar_props.reducer'
import uncheckVisaFilterNotify from '../uncheck_visa_filter_notify.reducer'
import calendarLoader from '../calendar_loader.reducer'
import browserHistory from '../browser_history.reducer'
import currentPage from '../current_page.reducer'
import ticketsBadges from '../tickets_badges.reducer'
import ticketShortUrls from '../ticket_short_urls.reducer'
import { chinaNotify } from '../china_notify.reducer'

/**
 * new reducers after merge
 */
import userInfo from 'user_account/reducers/user_info.reducer'
import userSettings from 'user_account/reducers/user_settings.reducer'
import ticketSubscriptions from '../ticket_subscriptions.reducer'
import woodySubscriptions from '../woody_subscriptions.reducer'
import subscriptionsInformer from '../subscriptions_informer.reducer'
import emailChangeNotify from '../email_change_notify.reducer'

/**
 * ticketSubstrate
 * ticketSubstrateOpened
 * ticketsLayoutControlsHighlighted
 * isSubscriptionIframeLoading
 *
 *
 * TODO UPDATE_SEARCH_DATA экшен через все редьюсеры. каждый бедет от него свое.
 */
export default {
  /**
   * searchParams
   * !!! Вроде не нужно сбрасывать, так как относительно их и происходит сброс остального
   */
  searchParams,

  /**
   * prerollQuestions
   *
   * Не сбрасывается
   * Итак обновляются когда придут новые в новом запросе.
   */
  prerollQuestions,

  /**
   * searchStatus
   *
   * Не сбрасывается
   * Он меняется от события UPDATE_SEARCH_STATUS. Если сбросить то будет inited
   */
  searchStatus,

  /**
   * airlines
   * !!! Проверить, должно сбросится когда обновятся данные фильтров.
   */
  airlines,

  /**
   * popups
   *
   * Не сбрасывается
   * Попапы сбрасывать не зачем, там логика вкл/выкл
   */
  popups,

  /**
   * advertisement
   *
   * ! Нужно сбросить
   * Посде показа старой рекламы, нужно обновить последовательность
   */
  advertisement,

  /**
   * tickets
   *
   * Не сбрасывается
   * Итак обновится когда придут новые билеты
   */
  tickets,

  /**
   * searchHistory
   *
   * Не сбрасывается
   * Был написан клон когда все сбрасиывалось
   */
  searchHistory,

  /**
   * popularFilters
   *
   * Не сбрасывается
   * Сам обновится при новом любом значении popularFilters
   * в экшене UPDATE_SEARCH_DATA
   */
  popularFilters,

  /**
   * filters
   * !!! Есть методы по сбросу, нужно перепроверить очищается или нет
   */
  filters,

  /**
   * prediction
   *
   * !!! Проверить, но должно сбрасываться само
   */
  prediction,

  /**
   * fixedFlights
   *
   * Пины
   */
  fixedFlights,

  /**
   * gatesMeta
   *
   * !!! Проверить, сбросится само
   */
  gatesMeta,

  /**
   * serverName
   *
   * Не меняется от поиска к поиску
   */
  serverName,

  /**
   * debugSettings
   *
   * Не сбрасывается
   * Был написан клон когда все сбрасиывалось
   */
  debugSettings,

  /**
   * sysState
   *
   * Не меняется от поиска к поиску
   */
  sysState,

  /**
   * pageHeader
   *
   * Не меняется от поиска к поиску
   */
  pageHeader,

  /**
   * currency
   *
   * Не сбрасывается
   * Был написан клон когда все сбрасиывалось
   */
  currency,

  /**
   * calendarPrices
   *
   * !!! Проверить, должно обновлятся
   */
  calendarPrices,

  /**
   * offline
   *
   * Не меняется от поиска к поиску
   */
  offline,

  /**
   * calendarPrices
   *
   * !!! Проверить, должно обновлятся
   */
  selectedScheduleTickets,

  /**
   * aviaParams
   *
   * Не меняется от поиска к поиску
   */
  aviaParams,

  /**
   * hotelParams
   *
   * Не меняется от поиска к поиску
   */
  hotelParams,

  /**
   * multiwayParams
   *
   * Не меняется от поиска к поиску
   */
  multiwayParams,

  /**
   * requestId
   *
   * ! Обновляется в мидлваре update_search_data_middleware.ts
   */
  requestId,

  /**
   * flightInfo
   *
   * ! Обновляется в мидлваре update_search_data_middleware.ts
   */
  flightInfo,

  /**
   * adSenseParams
   *
   * ! Обновляется в мидлваре update_search_data_middleware.ts
   */
  adSenseParams,

  /**
   * topPlacementTicket
   *
   * ! Обновляется в мидлваре update_search_data_middleware.ts
   */
  topPlacementTicket,

  /**
   * cheapestTicket
   *
   * ! Обновляется в мидлваре update_search_data_middleware.ts
   */
  cheapestTicket,

  /**
   * cityDistance
   *
   * ! Обновляется в мидлваре update_search_data_middleware.ts
   */
  cityDistance,

  /**
   * savedFiltersHighlighted
   *
   * ! Обновляется в мидлваре update_search_data_middleware.ts
   */
  savedFiltersHighlighted,

  /**
   * savedFilters
   *
   * ! Обновляется в мидлваре update_search_data_middleware.ts
   */
  savedFilters,

  /**
   * bestSellerData
   *
   * ! Обновляется в мидлваре update_search_data_middleware.ts
   */
  bestSellerData,

  /**
   * heaviestTopPlacementCampaign
   *
   * ! Обновляется в мидлваре update_search_data_middleware.ts
   */
  heaviestTopPlacementCampaign,

  /**
   * showGatesFeedbackData
   *
   * ! Обновляется в мидлваре update_search_data_middleware.ts
   */
  showGatesFeedbackData,

  /**
   * creditPartner
   *
   * ! Обновляется в мидлваре update_search_data_middleware.ts
   */
  creditPartner,

  /**
   * sort
   *
   * ! Обновляется в мидлваре update_search_data_middleware.ts
   */
  sort,

  /**
   * searchId
   *
   * ! Обновляется в мидлваре update_search_data_middleware.ts
   */
  searchId,

  /**
   * highlightedTicketParams
   *
   * Не сбрасывается
   * Был написан клон когда все сбрасиывалось
   */
  highlightedTicketParams,

  /**
   * airports
   *
   * ! Обновляется в мидлваре update_search_data_middleware.ts
   */
  airports,

  /**
   * gates
   *
   * ! Обновляется в мидлваре update_search_data_middleware.ts
   */
  gates,

  /**
   * currencies
   *
   * ! Обновляется в мидлваре update_search_data_middleware.ts
   */
  currencies,

  /**
   * cheapestStops
   *
   * !!! Проверить должно обновляться
   */
  cheapestStops,

  /**
   * error
   *
   * !!! Проверить должно обновляться
   */
  error,

  /**
   * isUserLogged
   *
   * !!! Проверить Не сбрасывается, там примитив
   */
  isBlackOverlayShown,

  /**
   * firstTicketArrivedAt
   *
   * TODO не понимаю зачем вообще это
   * !!! Проверить, там всегда новое значение
   */
  firstTicketArrivedAt,

  /**
   * isSearchFinished
   *
   * !!! Проверить Не сбрасывается, там примитив
   */
  isSearchFinished,

  /**
   * isTopPlacementShown
   *
   * !!! Проверить Не сбрасывается, там примитив
   */
  isTopPlacementShown,

  /**
   * errorDuringSearch
   *
   * !!! Проверить Не сбрасывается, там примитив
   */
  errorDuringSearch,

  /**
   * travelpayoutsBarProps
   *
   * Не сбрасывается
   * Был написан клон когда все сбрасиывалось
   */
  travelpayoutsBarProps,

  /**
   * calendarLoader
   *
   * !!! Проверить Не сбрасывается, там примитив
   */
  calendarLoader,
  browserHistory,
  currentPage,
  userInfo,
  userSettings,
  ticketSubscriptions,
  woodySubscriptions,
  subscriptionsInformer,
  ticketsBadges,
  uncheckVisaFilterNotify,
  ticketShortUrls,
  emailChangeNotify,
  chinaNotify,
}
