/**
 * Agent TTS Engine
 * Each agent has a distinct voice + pitch/rate profile.
 * Voice preference lists are tried in order; first match wins.
 * Uses the browser's built-in Web Speech API (no external service).
 */

// ── Per-agent voice profiles ───────────────────────────────────────────────────
// voices: priority list — first available match is used
const PROFILES = {
  // Zone 3 — Reef agents
  KORAL:    { voices: ['Google UK English Female', 'Microsoft Hazel', 'Karen', 'Samantha'],          pitch: 1.15, rate: 1.15, volume: 0.9  },
  MAREA:    { voices: ['Google UK English Male',   'Microsoft George', 'Daniel', 'Alex'],             pitch: 0.95, rate: 1.0,  volume: 0.95 },
  TASYA:    { voices: ['Microsoft Zira',           'Google US English', 'Victoria', 'Samantha'],      pitch: 1.05, rate: 0.95, volume: 0.9  },
  NEREUS:   { voices: ['Microsoft David',          'Google UK English Male', 'Alex', 'Daniel'],       pitch: 0.8,  rate: 0.88, volume: 1.0  },

  // Zone 2 — Shelf agents
  ECHO:     { voices: ['Google UK English Female', 'Microsoft Hazel', 'Karen', 'Samantha'],          pitch: 1.1,  rate: 1.1,  volume: 0.85 },
  SIMAR:    { voices: ['Microsoft Mark',           'Google US English', 'Tom', 'Fred'],               pitch: 1.0,  rate: 1.05, volume: 0.85 },
  NAVIS:    { voices: ['Microsoft Zira',           'Google US English', 'Samantha', 'Victoria'],      pitch: 0.92, rate: 1.0,  volume: 0.9  },
  RISKADOR: { voices: ['Microsoft David',          'Google UK English Male', 'Daniel', 'Alex'],       pitch: 0.88, rate: 0.95, volume: 0.95 },

  // Zone 1 — Trench agents
  TRITON:   { voices: ['Microsoft Mark',           'Google UK English Male', 'Fred', 'Daniel'],       pitch: 0.82, rate: 1.1,  volume: 1.0  },
  AEGIS:    { voices: ['Microsoft David',          'Google UK English Male', 'Alex', 'Daniel'],       pitch: 0.78, rate: 0.85, volume: 1.0  },
  TEMPEST:  { voices: ['Google UK English Female', 'Microsoft Hazel', 'Karen', 'Samantha'],          pitch: 1.05, rate: 1.2,  volume: 0.85 },
  LEVIER:   { voices: ['Microsoft Zira',           'Google US English', 'Victoria', 'Samantha'],      pitch: 1.0,  rate: 0.9,  volume: 0.9  },

  // Zone 4 — BARRIER (most authoritative)
  BARRIER:  { voices: ['Microsoft Mark',           'Google UK English Male', 'Fred', 'Alex'],         pitch: 0.65, rate: 0.85, volume: 1.0  },
}

// ── Voice registry — loaded once, keyed by name ────────────────────────────────
let _voiceMap  = {}   // name → SpeechSynthesisVoice
let _anyVoice  = null // fallback

function loadVoices() {
  const all = window.speechSynthesis?.getVoices() || []
  _voiceMap  = {}
  all.forEach(v => { _voiceMap[v.name] = v })
  _anyVoice  = all.find(v => v.lang?.startsWith('en')) || all[0] || null
}

function pickVoice(preferenceList) {
  for (const name of preferenceList) {
    if (_voiceMap[name]) return _voiceMap[name]
  }
  return _anyVoice
}

if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = loadVoices
  loadVoices()
}

// ── TTS Queue ──────────────────────────────────────────────────────────────────
let _queue    = []
let _speaking = false
let _muted    = false

function processQueue() {
  if (_speaking || _queue.length === 0 || _muted) return
  const { agent, text } = _queue.shift()
  const profile = PROFILES[agent] || { voices: [], pitch: 1.0, rate: 1.0, volume: 0.9 }
  const voice   = pickVoice(profile.voices)

  const utt = new SpeechSynthesisUtterance(text)
  utt.pitch  = profile.pitch
  utt.rate   = profile.rate
  utt.volume = profile.volume
  if (voice) utt.voice = voice

  _speaking   = true
  utt.onend   = () => { _speaking = false; processQueue() }
  utt.onerror = () => { _speaking = false; processQueue() }

  window.speechSynthesis.speak(utt)
}

// ── Public API ─────────────────────────────────────────────────────────────────

export function speakAgent(agent, message) {
  if (!window.speechSynthesis || _muted) return
  const text = `${agent}: ${message}`
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
