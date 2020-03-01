module.exports =
  avia_form:
    _selectorPrefix: '.header .of_main_form--avia'
    click:
      passengersDropdown: '& .of_dropdown__over'
      passengersDropdownClose: '& .of_dropdown__close'
      passengersDropdownAction: '& .of_dropdown__action'
      adultsMinus: '& .of_additional__row:nth-child(2) .of_numeric_input__dec'
      adultsPlus: '& .of_additional__row:nth-child(2) .of_numeric_input__inc'
      childrenMinus: '& .of_additional__row:nth-child(3) .of_numeric_input__dec'
      childrenPlus: '& .of_additional__row:nth-child(3) .of_numeric_input__inc'
      infantsMinus: '& .of_additional__row:nth-child(4) .of_numeric_input__dec'
      infantsPlus: '& .of_additional__row:nth-child(4) .of_numeric_input__inc'
      tripClass: '& .of_additional__trip_class input'
      swapPlaces: '& .of_main_form__swap_places'
      destinationSuggestion: '& .of_form_part--destination .of_autocomplete__suggestion, & .of_form_part--destination .of_autocomplete__suggestion *'
      originSuggestion: '& .of_form_part--origin .of_autocomplete__suggestion, & .of_form_part--origin .of_autocomplete__suggestion *'
      searchHotelsSet: '& #clicktripz:not(:checked) + .of_input_checkbox__label'
      searchHotelsUnset: '& #clicktripz:checked + .of_input_checkbox__label'
      changeToMultiwayForm: '& .of_main_form__change_form_link'
    mousedown:
      departDateClose: '& .of_form_part--depart_date .of_datepicker__close, & .of_form_part_map--departdate .of_datepicker__close'
      returnDateClose: '& .of_form_part--return_date .of_datepicker__close, & .of_form_part_map--returndate .of_datepicker__close'
      returnDateClear: '& .of_form_part--return_date .of_datepicker__oneway, & .of_form_part_map--returndate .of_return_clear'
      departDateNextMoth: '& .of_form_part--depart_date .pika-next, & .of_form_part_map--departdate .pika-next'
      departDatePrevMoth: '& .of_form_part--depart_date .pika-prev, & .of_form_part_map--returndate .pika-prev'
      returnDateNextMoth: '& .of_form_part--return_date .pika-next, & .of_form_part_map--returndate .pika-next'
      returnDatePrevMoth: '& .of_form_part--return_date .pika-prev, & .of_form_part_map--returndate .pika-prev'
      departDateDay: '& .of_form_part--depart_date .pika-day, & .of_form_part_map--departdate .pika-day'
      returnDateDay: '& .of_form_part--return_date .pika-day, & .of_form_part_map--returndate .pika-day'
    focus:
      origin: '& .of_form_part--origin input'
      destination: '& .of_form_part--destination input'
    submit:
      allSubmits: '&'
  footer_avia_form:
    _selectorPrefix: '.of_main_form--footer_avia'
    click:
      passengersDropdown: '& .of_dropdown__over'
      passengersDropdownClose: '& .of_dropdown__close'
      passengersDropdownAction: '& .of_dropdown__action'
      adultsMinus: '& .of_additional__row:nth-child(2) .of_numeric_input__dec'
      adultsPlus: '& .of_additional__row:nth-child(2) .of_numeric_input__inc'
      childrenMinus: '& .of_additional__row:nth-child(3) .of_numeric_input__dec'
      childrenPlus: '& .of_additional__row:nth-child(3) .of_numeric_input__inc'
      infantsMinus: '& .of_additional__row:nth-child(4) .of_numeric_input__dec'
      infantsPlus: '& .of_additional__row:nth-child(4) .of_numeric_input__inc'
      tripClass: '& .of_additional__trip_class input'
      swapPlaces: '& .of_main_form__swap_places'
      destinationSuggestion: '& .of_form_part--destination .of_autocomplete__suggestion, & .of_form_part--destination .of_autocomplete__suggestion *'
      originSuggestion: '& .of_form_part--origin .of_autocomplete__suggestion, & .of_form_part--origin .of_autocomplete__suggestion *'
    mousedown:
      departDateClose: '& .of_form_part--depart_date .of_datepicker__close'
      returnDateClose: '& .of_form_part--return_date .of_datepicker__close'
      returnDateClear: '& .of_form_part--return_date .of_form_part__clear'
      departDateNextMoth: '& .of_form_part--depart_date .pika-next'
      departDatePrevMoth: '& .of_form_part--depart_date .pika-prev'
      returnDateNextMoth: '& .of_form_part--return_date .pika-next'
      returnDatePrevMoth: '& .of_form_part--return_date .pika-prev'
      departDateDay: '& .of_form_part--depart_date .pika-day'
      returnDateDay: '& .of_form_part--return_date .pika-day'
    focus:
      origin: '& .of_form_part--origin input'
      destination: '& .of_form_part--destination input'
    submit:
      allSubmits: '&'
  hotelForm:
    _selectorPrefix: '.of_main_form--hotel'
    click:
      checkinDateClose: '& .of_form_part--checkin .of_datepicker__close'
      checkoutDateClose: '& .of_form_part--checkout .of_datepicker__close'
      guestsDropdown: '& .of_dropdown__over'
      guestsDropdownClose: '& .of_dropdown__close'
      guestsDropdownAction: '& .of_dropdown__action'
      adultsMinus: '& .of_additional__row:nth-child(2) .of_numeric_input__dec'
      adultsPlus: '& .of_additional__row:nth-child(2) .of_numeric_input__inc'
      childrenMinus: '& .of_additional__row:nth-child(3) .of_numeric_input__dec'
      childrenPlus: '& .of_additional__row:nth-child(3) .of_numeric_input__inc'
      childrenAge: '& .of_age_select select'
    mousedown:
      autocompleteSuggestion: '& .of_autocomplete__suggestion, & .of_autocomplete__suggestion *'
      checkinDateNextMoth: '& .of_form_part--checkin .pika-next'
      checkoutDateNextMoth: '& .of_form_part--checkout .pika-next'
      checkinDatePrevMoth: '& .of_form_part--checkin .pika-prev'
      checkoutDatePrevMoth: '& .of_form_part--checkout .pika-prev'
      checkinDateDay: '& .of_form_part--checkin .pika-day'
      checkoutDateDay: '& .of_form_part--checkout .pika-day'
    focus:
      destination: '& .of_form_part--destination input'
      checkIn: '& .of_form_part--checkin input'
      checkOut: '& .of_form_part--checkout input'
    submit:
      allSubmits: '&'
  multiwayForm:
    _selectorPrefix: '.of_main_form--multiway'
    click:
      removeSegment: '& .of_multiway_segment__remove'
      passengersDropdown: '& .of_dropdown__over'
      passengersDropdownClose: '& .of_dropdown__close'
      passengersDropdownAction: '& .of_dropdown__action'
      adultsMinus: '& .of_additional__row:nth-child(2) .of_numeric_input__dec'
      adultsPlus: '& .of_additional__row:nth-child(2) .of_numeric_input__inc'
      childrenMinus: '& .of_additional__row:nth-child(3) .of_numeric_input__dec'
      childrenPlus: '& .of_additional__row:nth-child(3) .of_numeric_input__inc'
      infantsMinus: '& .of_additional__row:nth-child(4) .of_numeric_input__dec'
      infantsPlus: '& .of_additional__row:nth-child(4) .of_numeric_input__inc'
      tripClass: '& .of_additional__trip_class input'
      addSegment: '& .of_multiway_segment__add'
      changeToAviaForm: '& .of_main_form__change_form_link'
    mousedown:
      originSuggestion: '& .of_form_part--multiway_origin .of_autocomplete__suggestion, & of_form_part--multiway_origin .of_autocomplete__suggestion *'
      destinationSuggestion: '& .of_form_part--multiway_destination .of_autocomplete__suggestion, & .of_form_part--multiway_destination .of_autocomplete__suggestion *'
      departDateNextMoth: '& .of_form_part--multiway_depart_date .pika-next'
      departDatePrevMoth: '& .of_form_part--multiway_depart_date .pika-prev'
      departDateDay: '& .of_form_part--multiway_depart_date .pika-day'
      departDateClose: '& .of_form_part--multiway_depart_date .of_datepicker__close'
    focus:
      origin: '& .of_form_part--multiway_origin input'
      destination: '& .of_form_part--multiway_destination input'
      departDate: '& .of_form_part--multiway_depart_date input'
    submit:
      allSubmits: '&'
  insuranceForm:
    _selectorPrefix: '.of_main_form--insurance'
    click:
      multiTripsSet: '& #trips:not(:checked) + .of_input_checkbox__label'
      multiTripsUnset: '& #trips:checked + .of_input_checkbox__label'
    focus:
      destination: '& .of_form_part--country input'
      departDate: '& .of_form_part--from input'
      returnDate: '& .of_form_part--till input'
    submit:
      allSubmits: '&'
  carsForm:
    _selectorPrefix: '.of_main_form--cars'
    focus:
      pickup: '& .of_form_part--pl input'
      dropoff: '& .of_form_part--dl input'
      pickupDate: '& .of_form_part--pt input'
      dropoffDate: '& .of_form_part--dt input'
    submit:
      allSubmits: '&'

  new_calendar_widget:
    _selectorPrefix: '[data-goal-category="new_calendar_widget"]'
    click:
      month: '& [data-role="month"], & [data-role="month"] *'
      day: '& [data-role="day"], & [data-role="day"] *'

  specialOffersForm:
    _selectorPrefix: '.special-offer__container'
    click:
      chooseDates: '& .special-offer__choose-dates-button'
      search: '& .offers-search-form__submit'
