export type Maybe<T> = T | null
export type Dirty<T> = T | undefined

export type Map<T> = { [key: string]: T }

export enum SearchStatus {
  Inited = 'INITED',
  Started = 'STARTED',
  Shown = 'SHOWN',
  Finished = 'FINISHED',
  Expired = 'EXPIRED',
}
