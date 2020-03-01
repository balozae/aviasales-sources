export enum FilterNames {
  Airlines = 'airlines',
  Airports = 'airports',
  Baggage = 'baggage',
  DepartureArrival = 'departureArrival',
  Duration = 'duration',
  Gates = 'gates',
  PaymentMethods = 'paymentMethods',
  Price = 'price',
  Stopover = 'stopover',
  Stops = 'stops',
  StopsDuration = 'stopsDuration',
  Visa = 'visa',
  China = 'china',
}

export type UncheckedFilters = { [key: string]: boolean }

export type Boundaries = { [key: string]: number }
