export class AbortError extends Error {}
export class TimeoutError extends Error {}
export class ServerError extends Error {
  constructor(message, response) {
    super()
    this.message = message
    this.response = response
  }
}
