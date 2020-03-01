export const UPDATE_SERVER_NAME = 'UPDATE_SERVER_NAME'

interface UpdateServerNameAction {
  type: typeof UPDATE_SERVER_NAME
  serverName: string
  requestId: string
}

export type ServerNameActions = UpdateServerNameAction

export type ServerNameState = {
  name: string | null
  requestId: string | null
}
