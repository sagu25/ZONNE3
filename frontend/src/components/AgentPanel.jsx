/**
 * AgentPanel — Redesigned
 * Idle:  compact zone overview, nothing to digest
 * Active: Mission Flow timeline — agents appear step by step as they wake
 */

const AGENT_DEFS = {
  KORAL:    { zone:'Z3', icon:'📡', color:'#00d4ff', role:'Telemetry Observer',   tooltip:'Records every command and timestamp — the raw evidence that all other agents rely on.'  },
  MAREA:    { zone:'Z3', icon:'🌊', color:'#f59e0b', role:'Drift Analyst',        tooltip:'Compares commands against expected behaviour — catches burst rate, wrong zones, and ML anomalies.' },
  TASYA:    { zone:'Z3', icon:'🔗', color:'#a855f7', role:'Context Correlator',   tooltip:'Enriches raw signals with session context — is this a pattern or a one-off?' },
  NEREUS:   { zone:'Z3', icon:'🧠', color:'#00e87c', role:'Recommendation',       tooltip:'Synthesises all signals and advises TARE whether to freeze or stand by. Never acts alone.' },
  ECHO:     { zone:'Z2', icon:'🔬', color:'#38bdf8', role:'Diagnostics',          tooltip:'Confirms the fault is real and identifies exactly which assets need attention before any repair.' },
  SIMAR:    { zone:'Z2', icon:'🔭', color:'#fb923c', role:'Simulation',           tooltip:'Runs the repair plan in a safe simulation before anything touches the live grid.' },
  NAVIS:    { zone:'Z2', icon:'🗺', color:'#4ade80', role:'Change Planner',       tooltip:'Builds a step-by-step, compliance-checked execution plan from the diagnostic findings.' },
  RISKADOR: { zone:'Z2', icon:'⚖',  color:'#facc15', role:'Risk Scoring',        tooltip:'Scores the plan for blast radius and reversibility — gives it a go or a hold.' },
  TRITON:   { zone:'Z1', icon:'⚡', color:'#f43f5e', role:'Execution',            tooltip:'The only agent that actually touches the grid — and only with a TARE-issued permit for each step.' },
  AEGIS:    { zone:'Z1', icon:'🛡', color:'#e879f9', role:'Safety Validator',     tooltip:'Validates every step before TRITON executes it. Has full veto authority — can stop any command.' },
  TEMPEST:  { zone:'Z1', icon:'🌪', color:'#67e8f9', role:'Session Monitor',      tooltip:'Watches the pace of execution in real-time. If something moves too fast or too slow, it halts everything.' },
  LEVIER:   { zone:'Z1', icon:'↩',  color:'#86efac', role:'Rollback & Recovery', tooltip:'If execution fails or is stopped mid-way, LEVIER reverts every completed step cleanly.' },
}

const ZONE_META = {
  Z3: { label:'Reef',   sub:'Observe & Recommend', color:'#00d4ff', badgeClass:'z3', agents:['KORAL','MAREA','TASYA','NEREUS'] },
  Z2: { label:'Shelf',  sub:'Diagnose & Prepare',  color:'#fb923c', badgeClass:'z2', agents:['ECHO','SIMAR','NAVIS','RISKADOR'] },
  Z1: { label:'Trench', sub:'Execute with Safety', color:'#f43f5e', badgeClass:'z1', agents:['TRITON','AEGIS','TEMPEST','LEVIER'] },
}

const THREAT_COLORS = {
  NONE:     '#00e87c',
  MEDIUM:   '#f59e0b',
  HIGH:     '#f43f5e',
  CRITICAL: '#ff2d2d',
}

export default function AgentPanel({ agentStates = {}, activeAgents = {}, agentLog = [], pipelineLog = [], scenarioCtx = null, scenarioOutcome = null, agentVoices = {} }) {
  const totalActive = Object.keys(activeAgents).length
  const hasActivity = totalActive > 0 || agentLog.length > 0

  return (
    <div className="agent-panel">
      {scenarioCtx && <ScenarioHeader ctx={scenarioCtx} />}
      {scenarioOutcome && <OutcomeCard outcome={scenarioOutcome} />}
      {!scenarioOutcome && hasActivity && (
        <MissionFlow activeAgents={activeAgents} agentLog={agentLog} pipelineLog={pipelineLog} agentStates={agentStates} agentVoices={agentVoices} />
      )}
      {!scenarioOutcome && !hasActivity && !scenarioCtx && <StandbyView />}
      {!scenarioOutcome && !hasActivity && scenarioCtx && (
        <div className="ap-scenario-waiting">
          <span className="ap-waiting-dot" />
          Waiting for agents to activate...
        </div>
      )}
      <BarrierStrip agentStates={agentStates} activeAgents={activeAgents} />
    </div>
  )
}

/* ── Scenario Header ──────────────────────────────────── */
function ScenarioHeader({ ctx }) {
  const threatColor = THREAT_COLORS[ctx.threat_level] || '#888'
  const featured = ctx.featured_agents || []

  return (
    <div className="ap-scenario-header">
      <div className="ap-sch-top">
        <span className="ap-sch-title">{ctx.title}</span>
        <span className="ap-sch-threat" style={{ color: threatColor, borderColor: threatColor + '55', background: threatColor + '12' }}>
          {ctx.threat_level}
        </span>
      </div>
      <div className="ap-sch-desc">{ctx.description}</div>
      <div className="ap-sch-agents">
        {featured.map(a => {
          const def = AGENT_DEFS[a] || {}
          return (
            <span key={a} className="ap-sch-agent-chip" style={{ borderColor: def.color + '66', color: def.color }}>
              {def.icon} {a}
              {def.tooltip && <span className="ap-chip-tooltip">{def.tooltip}</span>}
            </span>
          )
        })}
      </div>
      <div className="ap-sch-pipeline">{ctx.pipeline_label}</div>
    </div>
  )
}

/* ── Standby: nothing running ─────────────────────────── */
function StandbyView() {
  return (
    <div className="ap-standby">
      <div className="ap-standby-header">
        <span className="ap-standby-dot" />
        <span className="ap-standby-title">Agent Network · Standby</span>
      </div>
      {Object.entries(ZONE_META).map(([zk, zm]) => (
        <div key={zk} className="ap-zone-row">
          <span className={`azh-badge ${zm.badgeClass}`}>{zk}</span>
          <div className="ap-zone-info">
            <span className="ap-zone-name">{zm.label}</span>
            <span className="ap-zone-sub">{zm.sub}</span>
          </div>
          <span className="ap-zone-idle">idle</span>
        </div>
      ))}
      <div className="ap-standby-hint">Run a scenario to see agents activate</div>
    </div>
  )
}

/* ── Mission Flow: scenario in progress ───────────────── */
function MissionFlow({ activeAgents, agentLog, pipelineLog, agentStates, agentVoices }) {
  const totalActive = Object.keys(activeAgents).length
  const steps = agentLog.filter(e => e.action === 'wake').slice(0, 14)

  return (
    <div className="ap-flow">
      <div className="ap-flow-header">
        <span className="ap-flow-dot" />
        <span className="ap-flow-title">Mission Flow</span>
        {totalActive > 0 && (
          <span className="ap-flow-badge">{totalActive} active</span>
        )}
      </div>

      <div className="ap-flow-timeline">
        {steps.map((step, i) => {
          const def    = AGENT_DEFS[step.agent] || {}
          const isLive = !!activeAgents[step.agent]
          const voice  = agentVoices[step.agent]
          return (
            <div key={i} className={`ap-step ${isLive ? 'ap-step-live' : 'ap-step-done'}`}>
              <div className="ap-step-left">
                <div className="ap-step-connector">
                  <div className={`ap-step-node ${isLive ? 'ap-step-node-live' : ''}`}
                       style={{ background: isLive ? def.color : 'transparent',
                                borderColor: def.color }} />
                  {i < steps.length - 1 && <div className="ap-step-line" />}
                </div>
              </div>
              <div className="ap-step-body">
                <div className="ap-step-top">
                  <span className="ap-step-icon">{def.icon}</span>
                  <span className="ap-step-name" style={{ color: isLive ? def.color : 'var(--text-primary)' }}>
                    {step.agent}
                  </span>
                  <span className="ap-step-zone">{def.zone}</span>
                  <span className="ap-step-role">{def.role}</span>
                  {isLive && <span className="ap-step-live-tag">live</span>}
                </div>
                {/* Agent voice — first-person, italic */}
                {voice && (
                  <div className="ap-step-voice" style={{ borderLeftColor: def.color + '88' }}>
                    <span className="ap-step-voice-quote">"</span>
                    {voice}
                    <span className="ap-step-voice-quote">"</span>
                  </div>
                )}
                {/* Fallback task label when no voice yet */}
                {!voice && (
                  <div className="ap-step-task">{step.task}</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Outcome Card — shown when scenario ends ──────────── */
const RESULT_META = {
  clean:           { label:'Clean Run',        color:'#00e87c', icon:'✓' },
  caught:          { label:'Threat Caught',     color:'#f43f5e', icon:'🛑' },
  blocked_at_auth: { label:'Blocked at Auth',   color:'#a855f7', icon:'🔐' },
}

function OutcomeCard({ outcome }) {
  const meta = RESULT_META[outcome.result] || { label: outcome.result, color: '#888', icon: '●' }

  return (
    <div className="ap-outcome" style={{ borderColor: meta.color + '55' }}>
      <div className="ap-oc-top">
        <span className="ap-oc-icon">{meta.icon}</span>
        <span className="ap-oc-label" style={{ color: meta.color }}>{meta.label}</span>
        {outcome.caught_by && (
          <span className="ap-oc-chain">{outcome.caught_by}</span>
        )}
      </div>

      <p className="ap-oc-summary">{outcome.summary}</p>

      {outcome.signals?.length > 0 && (
        <div className="ap-oc-signals">
          <span className="ap-oc-sig-label">Signals fired</span>
          {outcome.signals.map(s => (
            <span key={s} className="ap-oc-sig-chip">{s.replace(/_/g,' ')}</span>
          ))}
        </div>
      )}

      <div className="ap-oc-stats">
        <div className="ap-oc-stat">
          <span className="ap-oc-stat-num">{outcome.total ?? 0}</span>
          <span className="ap-oc-stat-lbl">Commands</span>
        </div>
        <div className="ap-oc-stat">
          <span className="ap-oc-stat-num" style={{ color:'#00e87c' }}>{outcome.allowed ?? 0}</span>
          <span className="ap-oc-stat-lbl">Approved</span>
        </div>
        <div className="ap-oc-stat">
          <span className="ap-oc-stat-num" style={{ color:'#f43f5e' }}>{outcome.blocked ?? 0}</span>
          <span className="ap-oc-stat-lbl">Blocked</span>
        </div>
      </div>
    </div>
  )
}

/* ── BARRIER — always pinned at bottom ────────────────── */
function BarrierStrip({ agentStates, activeAgents }) {
  const info  = agentStates['BARRIER'] || {}
  const active = !!activeAgents['BARRIER']
  const mode  = info.mode || 'NORMAL'
  const modeColor = { NORMAL:'#00e87c', FREEZE:'#ff2d2d', DOWNGRADE:'#f59e0b', TIMEBOX_ACTIVE:'#a855f7' }[mode] || '#888'

  return (
    <div className={`ap-barrier ${active ? 'ap-barrier-active' : ''}`}>
      <span className="ap-barrier-icon">🛡</span>
      <div className="ap-barrier-info">
        <span className="ap-barrier-name">BARRIER</span>
        <span className="ap-barrier-role">Sole ALLOW/DENY Authority</span>
      </div>
      <div className="ap-barrier-right">
        <span className="ap-barrier-status">● {active ? 'ACTIVE' : 'LISTENING'}</span>
        <span className="ap-barrier-mode" style={{ color: modeColor }}>{mode}</span>
      </div>
    </div>
  )
}
