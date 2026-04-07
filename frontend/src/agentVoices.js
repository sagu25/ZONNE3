/**
 * Agent TTS Engine
 * Each agent has a distinct voice profile — pitch, rate, volume.
 * Messages are queued so agents never talk over each other.
 * Uses the browser's built-in Web Speech API (no external service).
 */

// ── Per-agent voice profiles ───────────────────────────────────────────────────
const PROFILES = {
  KORAL:    { pitch: 1.1,  rate: 1.15, volume: 0.9  },  // crisp, fast, data-focused
  MAREA:    { pitch: 0.95, rate: 1.0,  volume: 0.95 },  // measured, analytical
  TASYA:    { pitch: 1.05, rate: 0.95, volume: 0.9  },  // thoughtful, deliberate
  NEREUS:   { pitch: 0.85, rate: 0.9,  volume: 1.0  },  // deep, decisive — the advisor
  ECHO:     { pitch: 1.1,  rate: 1.1,  volume: 0.85 },  // clinical, precise
  SIMAR:    { pitch: 1.0,  rate: 1.05, volume: 0.85 },  // neutral, methodical
  NAVIS:    { pitch: 0.95, rate: 1.0,  volume: 0.9  },  // structured, calm
  RISKADOR: { pitch: 0.9,  rate: 0.95, volume: 0.95 },  // deliberate, weighing
  TRITON:   { pitch: 0.8,  rate: 1.1,  volume: 1.0  },  // direct, no-nonsense executor
  AEGIS:    { pitch: 0.85, rate: 0.85, volume: 1.0  },  // firm, authority — safety gatekeeper
  TEMPEST:  { pitch: 1.05, rate: 1.2,  volume: 0.85 },  // watchful, alert
  LEVIER:   { pitch: 1.0,  rate: 0.9,  volume: 0.9  },  // composed, recovery-focused
  BARRIER:  { pitch: 0.7,  rate: 0.85, volume: 1.0  },  // lowest, most authoritative
}

// ── TTS Queue ──────────────────────────────────────────────────────────────────
let _queue    = []
let _speaking = false
let _muted    = false
let _voice    = null   // preferred browser voice (loaded async)

// Load best available voice (prefer a natural English one)
function loadVoice() {
  const voices = window.speechSynthesis?.getVoices() || []
  const preferred = [
    'Google UK English Male',
    'Google UK English Female',
    'Microsoft George',
    'Microsoft Zira',
    'Google US English',
    'Alex',
    'Samantha',
  ]
  for (const name of preferred) {
    const match = voices.find(v => v.name === name)
    if (match) { _voice = match; return }
  }
  // Fallback: first English voice
  _voice = voices.find(v => v.lang?.startsWith('en')) || voices[0] || null
}

if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = loadVoice
  loadVoice()
}

function processQueue() {
  if (_speaking || _queue.length === 0 || _muted) return
  const { agent, text } = _queue.shift()
  const profile = PROFILES[agent] || { pitch: 1.0, rate: 1.0, volume: 0.9 }

  const utt = new SpeechSynthesisUtterance(text)
  utt.pitch  = profile.pitch
  utt.rate   = profile.rate
  utt.volume = profile.volume
  if (_voice) utt.voice = _voice

  _speaking    = true
  utt.onend    = () => { _speaking = false; processQueue() }
  utt.onerror  = () => { _speaking = false; processQueue() }

  window.speechSynthesis.speak(utt)
}

// ── Public API ─────────────────────────────────────────────────────────────────

export function speakAgent(agent, message) {
  if (!window.speechSynthesis || _muted) return
  // Prepend agent name so you always know who's speaking
  const text = `${agent} says: ${message}`
  _queue.push({ agent, text })
  processQueue()
}

export function setVoiceMuted(muted) {
  _muted = muted
  if (muted) {
    window.speechSynthesis?.cancel()
    _queue    = []
    _speaking = false
  }
}

export function isVoiceMuted() { return _muted }

export function clearVoiceQueue() {
  window.speechSynthesis?.cancel()
  _queue    = []
  _speaking = false
}
