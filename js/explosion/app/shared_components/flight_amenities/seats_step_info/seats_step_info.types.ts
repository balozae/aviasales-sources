export interface CompleteInfo {
  pitch?: number
  label: string
  size: string
  quality?: 'bad' | 'good'
}

// TODO: use const enum when https://github.com/babel/babel/issues/8741 will done
export enum SeatsSizeType {
  Average = 'average',
  Narrow = 'narrow',
  Wide = 'wide',
}
