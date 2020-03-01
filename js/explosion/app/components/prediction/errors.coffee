export class ErrorServer extends Error
  constructor: ->
    super('ServerError')
    @name = 'ServerError'
    @message = 'serverError.message'
    @shortMessage = 'serverError.shortMessage'
    @description = 'serverError.description'

export class ErrorConnection extends Error
  constructor: ->
    super('ConnectionError')
    @name = 'ConnectionError'
    @message = 'connectionError.message'
    @shortMessage = 'connectionError.shortMessage'
    @description = 'connectionError.description'
