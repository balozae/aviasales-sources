import { ServerNameActions, UPDATE_SERVER_NAME } from '../types/server_name.types'

export const updateServerName = (requestId: string, serverName: string): ServerNameActions => ({
  type: UPDATE_SERVER_NAME,
  requestId,
  serverName,
})
