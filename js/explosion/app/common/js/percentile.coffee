# Returns the value at a given percentile in a sorted numeric array.
# "Linear interpolation between closest ranks" method
module.exports = (arr, p) ->
  return 0 if arr.length is 0
  throw new TypeError('p must be a number') if typeof p isnt 'number'
  return arr[0] if p <= 0
  return arr[arr.length - 1] if p >= 1

  index = (arr.length - 1) * p
  lower = Math.floor(index)
  upper = lower + 1
  weight = index % 1

  if upper >= arr.length
    arr[lower]
  else
    arr[lower] * (1 - weight) + arr[upper] * weight
