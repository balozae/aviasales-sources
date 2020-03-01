pixelCode = 'VK-RTRG-188338-8acOA'

sendToPixel = (name, value) ->
  params = {
    p: pixelCode
  }
  switch name
    when 'event' then params.event = value
    when 'add' then params.audience = value
    when 'device' then params.device_id = value
  params = Object.keys(params).map((param) -> param + '=' + params[param]).join('&')
  pixel = new Image()
  pixel.src = "https://vk.com/rtrg?#{params}"

# NOTE: docs for openapi https://vkcom.github.io/vk-ads-retargeting-demo/
module.exports = {
  Hit: -> sendToPixel()

  Event: (arg) -> sendToPixel('event', arg)

  Add: (arg) -> sendToPixel('add', arg)

  Device: (arg) -> sendToPixel('device', arg)
}
