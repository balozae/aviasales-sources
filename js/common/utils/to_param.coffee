encode = (value) -> encodeURIComponent(value)

serialize = (data, prefix) ->
  result = []
  for param, value of data
    key = if prefix then prefix + "[#{param}]" else param
    if typeof value is 'object'
      result.push(serialize(value, key))
    else
      result.push("#{encode(key)}=#{encode(value)}")
  result.join('&')

module.exports = serialize
