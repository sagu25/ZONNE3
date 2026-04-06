import { useMemo, useState, useRef, useEffect } from 'react'
import { narrationEngine, narStart, narStop, narTogglePause, narToggleMute } from './LandingPage'

const SRC_META = {
  GATEWAY:    { icon: '⟳', label: 'GATEWAY',    cls: 'ls-gateway' },
  TARE:       { icon: '⚡', label: 'TARE',       cls: 'ls-tare'    },
  AUTH:       { icon: '🔐', label: 'AUTH',       cls: 'ls-auth'    },
  ServiceNow: { icon: '■',  label: 'S-NOW',      cls: 'ls-snow'    },
  SUPERVISOR: { icon: '◆',  label: 'SUPERVISOR', cls: 'ls-super'   },
  ML:         { icon: '🤖', label: 'ML',         cls: 'ls-ml'      },
}

const SCENARIOS = [
  {
    label: '🟢 GRID DOCTOR', key: 'normal', threat: 'NONE',
    title: 'Authorized Fault Repair',
    what: 'A real voltage fault is injected into Zone 3. An authorized AI agent diagnoses it and repairs it — every single command goes through TARE\'s gateway before anything touches the grid.',
    watch: [
      'Watch all 12 agents activate in sequence across 3 zones',
      'Zone 2 plans the repair. Zone 1 executes it step-by-step',
      'This is what a clean, approved operation looks like',
    ],
  },
  {
    label: '🔴 GONE ROGUE', key: 'rogue', threat: 'HIGH',
    title: 'Rogue Agent — Burst Attack',
    what: 'A compromised agent receives a malicious directive and immediately hammers all three zones with high-impact commands, skipping every safety check.',
    watch: [
      'KORAL clocks the command burst — too many, too fast',
      'MAREA fires: out-of-zone access + safety protocol bypassed',
      'TARE freezes the agent before any command lands',
    ],
  },
  {
    label: '👻 GHOST CLONE', key: 'impersonator', threat: 'CRITICAL',
    title: 'Forged Identity — Ghost Clone',
    what: 'An attacker clones the identity of a legitimate agent and presents a forged authentication token. No other agents even wake up — the door is shut at the auth layer.',
    watch: [
      'Only BARRIER activates — it\'s the authentication checkpoint',
      'Token fingerprint doesn\'t match — rejected instantly',
      'Zero commands reach the grid. No other agents needed',
    ],
  },
  {
    label: '🔺 SCOPE CREEP', key: 'escalation', threat: 'HIGH',
    title: 'Privilege Escalation — Scope Creep',
    what: 'The agent starts with legitimate, authorized work in Zone 3. Mid-session, without any new work order, it quietly expands into Zone 1 and Zone 2.',
    watch: [
      'First few commands look completely normal — TARE allows them',
      'MAREA tracks the session and catches the zone drift',
      'TASYA correlates the escalation pattern across the session',
    ],
  },
  {
    label: '🕳 SILENT RECON', key: 'slowlow', threat: 'MEDIUM',
    title: 'Silent Recon — Slow & Low',
    what: 'The agent moves slowly — one status check every 4 seconds — deliberately staying under the burst-rate detection threshold. Rules stay silent. Only the ML model eventually catches it.',
    watch: [
      'No burst, no high-impact commands — rule-based checks pass',
      'KORAL quietly builds up the session history',
      'MAREA\'s ML model eventually identifies the recon pattern',
    ],
  },
  {
    label: '💥 SWARM STRIKE', key: 'coordinated', threat: 'CRITICAL',
    title: 'Coordinated Attack — Swarm Strike',
    what: 'Two separate rogue agents hit Zone 1 and Zone 2 simultaneously. Each attack alone might look borderline — together, TARE sees a coordinated pattern.',
    watch: [
      'KORAL tracks two command streams running in parallel',
      'MAREA fires signals across both zones at the same time',
      'TARE issues a single FREEZE that stops both vectors',
    ],
  },
]

const THREAT_COLORS = {
  NONE: '#00e87c', MEDIUM: '#f59e0b', HIGH: '#f43f5e', CRITICAL: '#ff2d2d',
}

export default function RightPanel({
  feedItems, stats, wsConnected, scenarioActive,
  onReset, onAgentNormal, onAgentRogue, onAgentImpersonator,
  onAgentCoordinated, onAgentEscalation, onAgentSlowLow,
}) {
  const [ddOpen,          setDdOpen]          = useState(false)
  const [pendingScenario, setPendingScenario] = useState(null)
  const ddRef = useRef(null)
  const [narState, setNarState] = useState({
    playing: narrationEngine.playing,
    paused:  narrationEngine.paused,
    muted:   narrationEngine.muted,
  })

  useEffect(() => {
    const sync = () => setNarState({
      playing: narrationEngine.playing,
      paused:  narrationEngine.paused,
      muted:   narrationEngine.muted,
    })
    narrationEngine.listeners.push(sync)
    return () => { narrationEngine.listeners = narrationEngine.listeners.filter(f => f !== sync) }
  }, [])

  const counts = useMemo(() => {
    const c = {}
    feedItems.forEach(f => { c[f.source] = (c[f.source] || 0) + 1 })
    return c
  }, [feedItems])

  const latest = feedItems[0]

  const HANDLERS = {
    normal: onAgentNormal, rogue: onAgentRogue, impersonator: onAgentImpersonator,
    escalation: onAgentEscalation, slowlow: onAgentSlowLow, coordinated: onAgentCoordinated,
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e) { if (ddRef.current && !ddRef.current.contains(e.target)) setDdOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const openBriefing = (scenario) => { setPendingScenario(scenario); setDdOpen(false) }
  const runScenario  = () => {
    if (!pendingScenario) return
    HANDLERS[pendingScenario.key]?.()
    setPendingScenario(null)
  }

  return (
    <div className="panel right-monitor-panel">
      {/* Scenario Briefing Modal */}
      {pendingScenario && (
        <div className="briefing-overlay" onClick={() => setPendingScenario(null)}>
          <div className="briefing-card" onClick={e => e.stopPropagation()}>
            <div className="briefing-top">
              <span className="briefing-label">SCENARIO BRIEFING</span>
              <span
                className="briefing-threat"
                style={{ color: THREAT_COLORS[pendingScenario.threat], borderColor: THREAT_COLORS[pendingScenario.threat] + '55', background: THREAT_COLORS[pendingScenario.threat] + '14' }}
              >
                {pendingScenario.threat}
              </span>
            </div>
            <div className="briefing-title">{pendingScenario.title}</div>
            <p className="briefing-what">{pendingScenario.what}</p>
            <div className="briefing-watch-label">What to watch for</div>
            <ul className="briefing-watch-list">
              {pendingScenario.watch.map((w, i) => <li key={i}>{w}</li>)}
            </ul>
            <div className="briefing-actions">
              <button className="briefing-cancel" onClick={() => setPendingScenario(null)}>Cancel</button>
              <button className="briefing-run" onClick={runScenario}>
                ▶ Run Scenario
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="panel-title">
        <span style={{ color:'var(--text-secondary)' }}>■</span>&nbsp;Live Event Monitor
      </div>

      {/* Source chips — 2 rows × 3 cols */}
      <div className="ls-source-grid">
        {Object.entries(SRC_META).map(([src, meta]) => (
          <span key={src} className={`ls-chip ${meta.cls}`}>
            <span className="ls-icon">{meta.icon}</span>
            <span className="ls-label">{meta.label}</span>
            <span className="ls-num">{counts[src] || 0}</span>
          </span>
        ))}
      </div>

      {/* Session stats */}
      {stats && (
        <div className="ls-session-stats">
          <span className="ls-stat-chip ls-sc-total"><b>{stats.total ?? 0}</b><span>CMDS</span></span>
          <span className="ls-stat-chip ls-sc-allow"><b>{stats.allowed ?? 0}</b><span>ALLOW</span></span>
          <span className="ls-stat-chip ls-sc-deny" ><b>{stats.denied ?? 0}</b><span>DENY</span></span>
          <span className="ls-stat-chip ls-sc-frz"  ><b>{stats.freeze_events ?? 0}</b><span>FRZ</span></span>
        </div>
      )}

      {/* Latest event */}
      <div className="ls-latest-wrap">
        <span className="ls-latest-label">LATEST</span>
        {latest ? (
          <div className="ls-latest">
            <span className="ls-latest-src">{latest.source}</span>
            <span className="ls-latest-msg">{latest.message}</span>
          </div>
        ) : (
          <div className="ls-latest"><span className="ls-latest-msg ls-dim">Awaiting events…</span></div>
        )}
      </div>

      <div style={{ flex:1 }} />

      {/* Narration controls */}
      <div className="rp-narration">
        <span className="rp-nar-label">🔈 NARRATION</span>
        <div className="rp-nar-btns">
          {!narState.playing && (
            <button className="rp-nar-btn" onClick={() => narStart(narrationEngine.index)} title="Start / Resume narration">▶ Start</button>
          )}
          {narState.playing && (
            <button className="rp-nar-btn" onClick={narTogglePause} title={narState.paused ? 'Resume' : 'Pause'}>
              {narState.paused ? '▶' : '⏸'}
            </button>
          )}
          {narState.playing && (
            <button className="rp-nar-btn rp-nar-stop" onClick={narStop} title="Stop">■</button>
          )}
          <button className={`rp-nar-btn ${narState.muted ? 'rp-nar-muted' : ''}`} onClick={narToggleMute} title={narState.muted ? 'Unmute' : 'Mute'}>
            {narState.muted ? '🔇' : '🔊'}
          </button>
        </div>
      </div>

      {/* Scenario dropdown + Reset */}
      <div className="rp-actions">

        {/* Scenarios dropdown */}
        <div className="rp-dd-wrap" ref={ddRef}>
          <button
            className={`rp-btn rp-btn-scenario ${ddOpen ? 'rp-btn-scenario-open' : ''}`}
            disabled={!wsConnected || scenarioActive}
            onClick={() => setDdOpen(o => !o)}
            title={scenarioActive ? 'Scenario running — Reset to stop' : 'Select a scenario'}
          >
            {scenarioActive ? '⏳ Running…' : `▶ Scenarios ${ddOpen ? '▲' : '▼'}`}
          </button>

          {ddOpen && (
            <div className="rp-dd-menu">
              {SCENARIOS.map(s => (
                <button
                  key={s.key}
                  className="rp-dd-item"
                  onClick={() => openBriefing(s)}
                >
                  {s.label}
                  <span className="rp-dd-desc">{s.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reset */}
        <button className="rp-btn rp-btn-reset" onClick={onReset} disabled={!wsConnected}>
          ↺ Reset
        </button>
      </div>
    </div>
  )
}

export function LiveStatsBar() { return <div /> }
