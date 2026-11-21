import { contextBridge, ipcRenderer } from 'electron'

type SavedConnection = { id: string; name: string; host: string; port: number }
type ConnectionInput = Omit<SavedConnection, 'id'> & { id?: string }
type QueryResult =
  | { ok: true; kind: 'rows'; columns: Array<{ name: string; type: string }>; rows: Array<Array<string | number>> }
  | { ok: true; kind: 'command'; message: string; affected_rows: number }

contextBridge.exposeInMainWorld('desktop', {
  platform: process.platform,
  getAppVersion: (): Promise<string> => ipcRenderer.invoke('app:version'),
  listConnections: (): Promise<SavedConnection[]> => ipcRenderer.invoke('connections:list'),
  saveConnection: (connection: ConnectionInput): Promise<SavedConnection[]> =>
    ipcRenderer.invoke('connections:save', connection),
  deleteConnection: (id: string): Promise<SavedConnection[]> =>
    ipcRenderer.invoke('connections:delete', id),
  connect: (id: string): Promise<SavedConnection> => ipcRenderer.invoke('database:connect', id),
  disconnect: (): Promise<void> => ipcRenderer.invoke('database:disconnect'),
  executeQuery: (query: string): Promise<QueryResult> => ipcRenderer.invoke('database:query', query)
})
