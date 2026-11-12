import { useEffect, useState } from 'react'
import {
  Activity,
  ArrowDownToLine,
  ArrowLeftRight,
  ChevronDown,
  CircleHelp,
  Clock3,
  Code2,
  Command,
  Database,
  FilePlus2,
  FolderClosed,
  LayoutDashboard,
  LockKeyhole,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Table2,
  TerminalSquare,
  Wifi
} from 'lucide-react'

type NavItem = {
  label: string
  icon: typeof LayoutDashboard
}

const primaryNav: NavItem[] = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'SQL workspace', icon: Code2 },
  { label: 'Tables', icon: Table2 }
]

function App(): React.JSX.Element {
  const [activeNav, setActiveNav] = useState('Overview')
  const [appVersion, setAppVersion] = useState('0.1.0')

  useEffect(() => {
    void window.desktop.getAppVersion().then(setAppVersion)
  }, [])

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><Database size={19} strokeWidth={2.2} /></div>
          <div className="brand-copy">
            <span className="brand-name">UniDB</span>
            <span className="brand-product">DESKTOP</span>
          </div>
          <button className="icon-button workspace-switch" aria-label="Switch workspace"><ChevronDown size={15} /></button>
        </div>

        <button className="connection-picker">
          <span className="connection-indicator" />
          <span className="connection-copy">
            <strong>No connection</strong>
            <small>Connect to a UniDB server</small>
          </span>
          <ChevronDown size={15} className="muted-icon" />
        </button>

        <div className="sidebar-section">
          <span className="section-label">WORKSPACE</span>
          <nav>
            {primaryNav.map(({ label, icon: Icon }) => (
              <button
                className={`nav-item ${activeNav === label ? 'active' : ''}`}
                key={label}
                onClick={() => setActiveNav(label)}
              >
                <Icon size={17} />
                <span>{label}</span>
                {label === 'SQL workspace' && <span className="nav-shortcut">⌘ K</span>}
              </button>
            ))}
          </nav>
        </div>

        <div className="sidebar-section recent-section">
          <div className="section-heading">
            <span className="section-label">RECENT</span>
            <button className="tiny-icon-button" aria-label="Add recent item"><Plus size={14} /></button>
          </div>
          <div className="empty-recent">
            <Clock3 size={16} />
            <span>Your recent work will<br />show up here.</span>
          </div>
        </div>

        <div className="sidebar-bottom">
          <button className="nav-item"><CircleHelp size={17} /><span>Help & feedback</span></button>
          <button className="nav-item"><Settings2 size={17} /><span>Preferences</span></button>
          <div className="profile-row">
            <div className="avatar">S</div>
            <div className="profile-copy"><strong>Local workspace</strong><small>Personal environment</small></div>
            <button className="tiny-icon-button" aria-label="Workspace options"><ChevronDown size={14} /></button>
          </div>
        </div>
      </aside>

      <section className="main-panel">
        <header className="topbar">
          <div className="breadcrumbs"><span>Workspace</span><span className="crumb-divider">/</span><strong>{activeNav}</strong></div>
          <div className="topbar-actions">
            <span className="build-label">EARLY ACCESS</span>
            <button className="icon-button" aria-label="Search"><Search size={17} /></button>
            <button className="icon-button" aria-label="Activity"><Activity size={17} /></button>
            <div className="topbar-divider" />
            <button className="icon-button" aria-label="Download updates"><ArrowDownToLine size={17} /></button>
          </div>
        </header>

        <div className="page-content">
          <div className="welcome-row">
            <div>
              <div className="eyebrow"><Sparkles size={13} /> YOUR DATABASE WORKSPACE</div>
              <h1>Good to see you.</h1>
              <p className="page-subtitle">A clear view of your data starts here.</p>
            </div>
            <button className="primary-button" onClick={() => setActiveNav('SQL workspace')}>
              <Plus size={16} /> New workspace
            </button>
          </div>

          <section className="connection-card">
            <div className="connection-card-art">
              <div className="orbit orbit-one" />
              <div className="orbit orbit-two" />
              <div className="database-illustration"><Database size={48} strokeWidth={1.15} /></div>
              <span className="art-dot dot-one" /><span className="art-dot dot-two" /><span className="art-dot dot-three" />
            </div>
            <div className="connection-card-content">
              <span className="status-pill"><span /> NOT CONNECTED</span>
              <h2>Connect your first database</h2>
              <p>Connect to a running UniDB server to explore tables, write SQL, and work with your data from one place.</p>
              <button className="primary-button" disabled title="Database connections are coming in a later update">
                <Plus size={16} /> Add connection <span className="coming-soon">COMING SOON</span>
              </button>
              <span className="card-footnote"><LockKeyhole size={12} /> Your connection details will stay on this device.</span>
            </div>
          </section>

          <div className="section-heading overview-heading">
            <div><h3>Get started</h3><p>Everything you need, in one workspace.</p></div>
            <span className="subtle-label">3 QUICK STEPS</span>
          </div>

          <div className="steps-grid">
            <article className="step-card">
              <div className="step-icon purple"><Wifi size={18} /></div>
              <span className="step-number">01</span>
              <h3>Connect a server</h3>
              <p>Point UniDB Desktop to your running UniDB server.</p>
              <span className="step-link disabled-link">Connection setup <ArrowLeftRight size={13} /></span>
            </article>
            <article className="step-card">
              <div className="step-icon blue"><TerminalSquare size={18} /></div>
              <span className="step-number">02</span>
              <h3>Explore your data</h3>
              <p>Browse tables and understand what lives in your database.</p>
              <span className="step-link disabled-link">Table browser <FolderClosed size={13} /></span>
            </article>
            <article className="step-card">
              <div className="step-icon green"><Code2 size={18} /></div>
              <span className="step-number">03</span>
              <h3>Write your first query</h3>
              <p>Use the SQL workspace to query and inspect results.</p>
              <span className="step-link disabled-link">Open SQL editor <FilePlus2 size={13} /></span>
            </article>
          </div>

          <div className="bottom-note">
            <div className="note-icon"><ShieldCheck size={17} /></div>
            <div><strong>Built with security in mind</strong><span>UniDB Desktop runs locally. It connects to your server only when you choose to.</span></div>
            <button className="text-button">How it works <ArrowLeftRight size={13} /></button>
          </div>
        </div>

        <footer className="statusbar">
          <div><span className="statusbar-dot" /> All systems ready</div>
          <div><span>UniDB Desktop v{appVersion}</span><span className="status-divider" /><span>{window.desktop.platform}</span><span className="status-divider" /><span><Command size={12} /> Shortcuts</span></div>
        </footer>
      </section>
    </main>
  )
}

export default App
