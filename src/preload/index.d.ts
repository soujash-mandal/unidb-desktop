export {}

type SavedConnection = { id: string; name: string; host: string; port: number }
type QueryResult =
  | { ok: true; kind: 'rows'; columns: Array<{ name: string; type: string }>; rows: Array<Array<string | number>> }
  | { ok: true; kind: 'command'; message: string; affected_rows: number }

declare global {
  interface Window {
    desktop: {
      platform: string
      getAppVersion: () => Promise<string>
      listConnections: () => Promise<SavedConnection[]>
      saveConnection: (connection: Omit<SavedConnection, 'id'> & { id?: string }) => Promise<SavedConnection[]>
      deleteConnection: (id: string) => Promise<SavedConnection[]>
      connect: (id: string) => Promise<SavedConnection>
      disconnect: () => Promise<void>
      executeQuery: (query: string) => Promise<QueryResult>
    }
  }
}
