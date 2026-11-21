import { useEffect, useState } from 'react'
import type { KeyboardEvent } from 'react'
import {
  Check, ChevronDown, CircleHelp, Code2, Database, History, LoaderCircle,
  Plus, Play, PlugZap, Settings2, ShieldCheck, Trash2, X
} from 'lucide-react'

type SavedConnection = { id: string; name: string; host: string; port: number }
type QueryResult =
  | { ok: true; kind: 'rows'; columns: Array<{ name: string; type: string }>; rows: Array<Array<string | number>> }
  | { ok: true; kind: 'command'; message: string; affected_rows: number }

function App(): React.JSX.Element {
  const [connections, setConnections] = useState<SavedConnection[]>([])
  const [activeConnection, setActiveConnection] = useState<SavedConnection | null>(null)
  const [showConnectionForm, setShowConnectionForm] = useState(false)
  const [connectionName, setConnectionName] = useState('Local UniDB')
  const [host, setHost] = useState('127.0.0.1')
  const [port, setPort] = useState('7432')
  const [query, setQuery] = useState('SELECT * FROM users;')
  const [result, setResult] = useState<QueryResult | null>(null)
  const [queryError, setQueryError] = useState('')
  const [elapsedMs, setElapsedMs] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('Not connected')
  const [appVersion, setAppVersion] = useState('0.2.0')

  useEffect(() => {
    void Promise.all([window.desktop.listConnections(), window.desktop.getAppVersion()])
      .then(([saved, version]) => {
        setConnections(saved)
        setAppVersion(version)
      })
      .catch((error: Error) => setStatus(error.message))
  }, [])

  async function saveConnection(): Promise<void> {
    const numericPort = Number(port)
    if (!connectionName.trim() || !host.trim() || !Number.isInteger(numericPort) || numericPort < 1 || numericPort > 65535) {
      setStatus('Enter a connection name, host and valid port.')
      return
    }
    try {
      const saved = await window.desktop.saveConnection({
        name: connectionName.trim(),
        host: host.trim(),
        port: numericPort
      })
      setConnections(saved)
      setShowConnectionForm(false)
      setStatus('Connection saved')
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not save connection')
    }
  }

  async function connectTo(connection: SavedConnection): Promise<void> {
    setBusy(true)
    setStatus('Connecting…')
    try {
      const connected = await window.desktop.connect(connection.id)
      setActiveConnection(connected)
      setStatus('Connected')
      setQueryError('')
    } catch (error) {
      setActiveConnection(null)
      setStatus(error instanceof Error ? error.message : 'Connection failed')
    } finally {
      setBusy(false)
    }
  }

  async function disconnect(): Promise<void> {
    await window.desktop.disconnect()
    setActiveConnection(null)
    setStatus('Not connected')
  }

  async function deleteConnection(id: string): Promise<void> {
    try {
      const saved = await window.desktop.deleteConnection(id)
      setConnections(saved)
      if (activeConnection?.id === id) {
        setActiveConnection(null)
        setStatus('Connection deleted')
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not delete connection')
    }
  }

  async function executeQuery(): Promise<void> {
    if (!activeConnection) {
      setQueryError('Connect to a UniDB server before executing a query.')
      return
    }
    setBusy(true)
    setQueryError('')
    setResult(null)
    const started = performance.now()
    try {
      const response = await window.desktop.executeQuery(query)
      setResult(response)
      setElapsedMs(Math.round(performance.now() - started))
    } catch (error) {
      setQueryError(error instanceof Error ? error.message : 'Query execution failed')
      setElapsedMs(Math.round(performance.now() - started))
    } finally {
      setBusy(false)
    }
  }

  function handleEditorKeyDown(event: KeyboardEvent<HTMLTextAreaElement>): void {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault()
      void executeQuery()
    }
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><Database size={19} /></div>
          <div><strong>UniDB</strong><span>DESKTOP</span></div>
          <ChevronDown size={15} className="muted-icon" />
        </div>
        <div className="sidebar-heading">
          <span>CONNECTIONS</span>
          <button className="icon-button small" onClick={() => setShowConnectionForm(true)} title="Add connection"><Plus size={16} /></button>
        </div>
        <button className="add-connection" onClick={() => setShowConnectionForm(true)}><Plus size={16} /> Add connection</button>
        <div className="connection-list">
          {connections.length === 0 && <p className="empty-copy">Your saved connections will appear here.</p>}
          {connections.map((connection) => (
            <div className={'connection-item' + (activeConnection?.id === connection.id ? ' selected' : '')} key={connection.id}>
              <button className="connection-select" onClick={() => void connectTo(connection)} disabled={busy}>
                <Database size={16} />
                <span><strong>{connection.name}</strong><small>{connection.host}:{connection.port}</small></span>
                {activeConnection?.id === connection.id && <span className="connected-dot" />}
              </button>
              <button className="icon-button small delete-button" title="Delete connection" onClick={() => void deleteConnection(connection.id)}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
        <div className="sidebar-bottom">
          <div className="sidebar-link"><History size={16} /> Query history <span>Later</span></div>
          <div className="sidebar-link"><Settings2 size={16} /> Preferences <span>Later</span></div>
          <div className="sidebar-link"><CircleHelp size={16} /> Help & feedback</div>
          <div className="local-profile"><div className="avatar">U</div><div><strong>Local workspace</strong><small>Stored on this device</small></div></div>
        </div>
      </aside>

      <section className="main-panel">
        <header className="topbar">
          <div className="breadcrumbs"><span>Workspace</span><span>/</span><strong>Query editor</strong></div>
          <div className="topbar-right">
            <span className={'connection-status' + (activeConnection ? ' online' : '')}><i />{activeConnection ? activeConnection.name : 'Not connected'}</span>
            {activeConnection && <button className="secondary-button compact" onClick={() => void disconnect()}>Disconnect</button>}
          </div>
        </header>
        <div className="workspace">
          <div className="workspace-heading">
            <div><div className="eyebrow"><Code2 size={14} /> QUERY WORKSPACE</div><h1>Query editor</h1><p>Write a UQL statement and run it against your UniDB server.</p></div>
            <button className="primary-button" onClick={() => setShowConnectionForm(true)}><Plus size={16} /> New connection</button>
          </div>
          {!activeConnection && <div className="connection-banner"><PlugZap size={18} /><div><strong>Connect to a database to get started</strong><span>Choose a saved connection or add your UniDB server details.</span></div><button className="secondary-button" onClick={() => setShowConnectionForm(true)}>Add connection</button></div>}
          <section className="editor-card">
            <div className="panel-toolbar"><div className="tab-label"><Code2 size={15} /> query.uql <span className="unsaved-dot" /></div><span className="editor-hint">UQL · One statement per execution</span></div>
            <div className="editor-body"><div className="line-number">1</div><textarea aria-label="UQL query editor" spellCheck={false} value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={handleEditorKeyDown} placeholder="Write your UQL query here…" /></div>
            <div className="editor-footer"><span>⌘ Enter to execute</span><button className="primary-button execute-button" onClick={() => void executeQuery()} disabled={busy || !activeConnection}>{busy ? <LoaderCircle size={15} className="spin" /> : <Play size={15} fill="currentColor" />}{busy ? 'Running…' : 'Execute query'}</button></div>
          </section>
          <section className="results-card">
            <div className="results-toolbar"><div><strong>Results</strong><span>{result?.kind === 'rows' ? result.rows.length + ' rows' : result?.kind === 'command' ? 'Command completed' : 'Query output'}</span></div>{elapsedMs !== null && <span className="duration">{elapsedMs} ms</span>}</div>
            {queryError && <div className="error-state"><X size={17} /><div><strong>Query failed</strong><span>{queryError}</span></div></div>}
            {!queryError && !result && <div className="empty-results"><Database size={24} /><strong>No results yet</strong><span>Execute a query to see its results here.</span></div>}
            {result?.kind === 'rows' && <div className="table-scroll"><table className="results-table"><thead><tr>{result.columns.map((column) => <th key={column.name}>{column.name}<small>{column.type}</small></th>)}</tr></thead><tbody>{result.rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((value, columnIndex) => <td key={columnIndex}>{String(value)}</td>)}</tr>)}{result.rows.length === 0 && <tr><td colSpan={Math.max(result.columns.length, 1)} className="no-rows">The query returned no rows.</td></tr>}</tbody></table></div>}
            {result?.kind === 'command' && <div className="command-result"><Check size={18} /><div><strong>{result.message}</strong><span>{result.affected_rows} affected rows</span></div></div>}
          </section>
          <div className="security-note"><ShieldCheck size={15} /><span>Connection details are stored locally on this device. The current client supports non-TLS TCP connections only. TLS support will be added separately.</span></div>
        </div>
        <footer className="statusbar"><span><i className={activeConnection ? 'online' : ''} />{status}</span><span>UniDB Desktop v{appVersion} <b /> {window.desktop.platform}</span></footer>
      </section>

      {showConnectionForm && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowConnectionForm(false) }}>
        <section className="connection-modal" role="dialog" aria-modal="true" aria-labelledby="connection-title">
          <div className="modal-heading"><div><span className="eyebrow">DATABASE SETUP</span><h2 id="connection-title">Add connection</h2><p>Enter the address of your running UniDB server.</p></div><button className="icon-button" onClick={() => setShowConnectionForm(false)} aria-label="Close"><X size={18} /></button></div>
          <label>Connection name<input value={connectionName} onChange={(event) => setConnectionName(event.target.value)} placeholder="e.g. Local UniDB" autoFocus /></label>
          <label>Host<input value={host} onChange={(event) => setHost(event.target.value)} placeholder="127.0.0.1" /></label>
          <label>Port<input type="number" min="1" max="65535" value={port} onChange={(event) => setPort(event.target.value)} placeholder="7432" /></label>
          <div className="modal-note"><ShieldCheck size={15} /> Only connection name, host and port are saved. Do not use this form for remote servers requiring TLS yet.</div>
          <div className="modal-actions"><button className="secondary-button" onClick={() => setShowConnectionForm(false)}>Cancel</button><button className="primary-button" onClick={() => void saveConnection()}><Check size={15} /> Save connection</button></div>
        </section>
      </div>}
    </main>
  )
}

export default App
