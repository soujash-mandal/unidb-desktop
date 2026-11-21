import { app, BrowserWindow, ipcMain } from 'electron'
import { randomUUID } from 'node:crypto'
import { readFile, rename, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { UniDB } from 'unidb-node'

type SavedConnection = { id: string; name: string; host: string; port: number }
type ConnectionInput = Omit<SavedConnection, 'id'> & { id?: string }

const connectionsFile = (): string => join(app.getPath('userData'), 'connections.json')
let activeClient: UniDB | null = null
let activeConnectionId: string | null = null

async function readConnections(): Promise<SavedConnection[]> {
  try {
    const contents = await readFile(connectionsFile(), 'utf8')
    const parsed: unknown = JSON.parse(contents)
    return Array.isArray(parsed) ? (parsed as SavedConnection[]) : []
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []
    throw error
  }
}

async function writeConnections(connections: SavedConnection[]): Promise<void> {
  const file = connectionsFile()
  const temporaryFile = file + '.tmp'
  await writeFile(temporaryFile, JSON.stringify(connections, null, 2), { mode: 0o600 })
  await rename(temporaryFile, file)
}

function validateConnection(input: ConnectionInput): void {
  if (!input.name.trim()) throw new Error('Connection name is required.')
  if (!input.host.trim()) throw new Error('Host is required.')
  if (!Number.isInteger(input.port) || input.port < 1 || input.port > 65535) {
    throw new Error('Port must be between 1 and 65535.')
  }
}

ipcMain.handle('connections:list', () => readConnections())

ipcMain.handle('connections:save', async (_event, input: ConnectionInput) => {
  validateConnection(input)
  const connections = await readConnections()
  const id = input.id ?? randomUUID()
  const saved: SavedConnection = {
    id,
    name: input.name.trim(),
    host: input.host.trim(),
    port: input.port
  }
  const next = [...connections.filter((connection) => connection.id !== id), saved]
  await writeConnections(next)
  return next
})

ipcMain.handle('connections:delete', async (_event, id: string) => {
  if (activeConnectionId === id) {
    await activeClient?.close()
    activeClient = null
    activeConnectionId = null
  }
  const next = (await readConnections()).filter((connection) => connection.id !== id)
  await writeConnections(next)
  return next
})

ipcMain.handle('database:connect', async (_event, id: string) => {
  const connection = (await readConnections()).find((item) => item.id === id)
  if (!connection) throw new Error('Saved connection not found.')

  await activeClient?.close()
  activeClient = null
  activeConnectionId = null

  const client = new UniDB({ host: connection.host, port: connection.port })
  await client.connect()
  activeClient = client
  activeConnectionId = id
  return connection
})

ipcMain.handle('database:disconnect', async () => {
  await activeClient?.close()
  activeClient = null
  activeConnectionId = null
})

ipcMain.handle('database:query', async (_event, query: string) => {
  if (!activeClient) throw new Error('Connect to a UniDB server before executing a query.')
  if (typeof query !== 'string' || !query.trim()) throw new Error('Enter a query first.')
  // The current wire protocol accepts one statement per line. Normalize editor
  // line breaks so a formatted single statement can still be executed.
  const statement = query.replace(/\s*\r?\n\s*/g, ' ').trim()
  return activeClient.query(statement)
})

ipcMain.handle('app:version', () => app.getVersion())

function createWindow(): void {
  const window = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1080,
    minHeight: 680,
    title: 'UniDB Desktop',
    backgroundColor: '#0b0d12',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    void window.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    void window.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('before-quit', () => {
  void activeClient?.close()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
