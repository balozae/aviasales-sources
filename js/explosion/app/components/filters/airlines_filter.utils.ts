import { UncheckedFilters } from './filters.types'

type Keys = string[]

export enum FilterCheckStatus {
  checked = 'checked',
  unchecked = 'unchecked',
}

export const without = (array: Keys, values: Keys) => array.filter((key) => !values.includes(key))

export const calcCheckStatus = (uncheckedKeys: Keys, boundariesKeys: Keys) =>
  uncheckedKeys.length > boundariesKeys.length / 2
    ? FilterCheckStatus.checked
    : FilterCheckStatus.unchecked

export const getUncheckedKeys = (
  keys: Keys,
  checkStatus: FilterCheckStatus,
  boundariesKeys: Keys,
) => (checkStatus === FilterCheckStatus.unchecked ? keys : without(boundariesKeys, keys))

export const calcAirlinesState = (
  unchecked: UncheckedFilters,
  boundariesKeys: Keys,
  isCodeshareIncluded: boolean,
) => {
  const uncheckedKeys = Object.keys(unchecked)
  const nextCheckStatus = calcCheckStatus(uncheckedKeys, boundariesKeys)
  const keys =
    nextCheckStatus === FilterCheckStatus.unchecked
      ? uncheckedKeys
      : without(boundariesKeys, uncheckedKeys)

  return {
    keys,
    checkStatus: nextCheckStatus,
    isCodeshareIncluded,
  }
}
