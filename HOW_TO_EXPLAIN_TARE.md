# How to Explain TARE to Anyone
### Trusted Access Response Engine — Explanation Guide
*For any audience: investors, engineers, executives, students, general public*

---

## The One Thing You Must Say First

Before anything else — before architecture, before scenarios, before AI agents — say this:

> **"The security tools we have today ask one question: is this identity allowed in?
> If yes, the door opens. Nobody watches what happens after that.
> TARE watches what happens after that."**

That is the entire product in two sentences. Everything else is evidence for why that matters.

---

## The Opening Story (Use This Every Time)

Start here regardless of audience. It takes 60 seconds and lands with everyone.

---

*"Think about how electricity gets to your home or office.*

*It travels through a network of substations, cables, and switching equipment — circuit breakers, feeder controllers — that need to be turned on, turned off, monitored, adjusted.*

*For most of history, a human engineer did that. Then software did it automatically — scripts watching sensor readings, following pre-written rules. Then AI agents started doing it autonomously — you give the system a goal, not a script, and it figures out the steps on its own.*

*That shift — from human, to automated, to autonomous — is exactly where the security gap opens up.*

*We have good tools for asking 'is this identity valid?' But once an AI agent is in, once it has its credentials and its access token, nobody is watching what it does. If it gets hijacked mid-session, if its credentials are stolen, if it starts behaving like a threat while looking completely legitimate — today's tools are blind to that.*

*TARE fills that gap. It watches what AI agents do after authentication, in real time, on the critical infrastructure they control."*

---

## The Car Analogy (Makes Autonomy Concrete)

If the audience doesn't immediately get why autonomous AI agents on a power grid is a big deal, use this:

> *"Think about cars. Fifty years ago, a driver controlled everything manually. Then cruise control arrived — automation. Then lane assist, emergency braking — the car making small decisions. Today we have self-driving cars — the car decides the route, the speed, everything. Nobody is holding the wheel.*
>
> *Power grids went through exactly the same journey. Stage one: a human engineer walks to the substation and flips a switch by hand. Stage two: scripts execute commands automatically when rules trigger. Stage three — where the industry is heading right now — AI agents receive a goal and decide on their own.*
>
> *The security tools we have were built for stage one and stage two. TARE is built for stage three."*

---

## What TARE Actually Does (Plain English)

Every time an AI agent issues a command on the grid, TARE asks six questions before the command touches any asset:

| # | Question | Why It Matters |
|---|---|---|
| 1 | **Is the agent in the right zone?** | An agent authorised for Zone 3 has no reason to touch Zone 1 |
| 2 | **Does the target zone have a real problem?** | A repair agent touching a healthy zone is suspicious |
| 3 | **Did the agent follow safe procedure?** | You never open a circuit breaker without running a simulation first |
| 4 | **How fast is it moving?** | Ten commands in five seconds is not normal grid operations |
| 5 | **Does the full session look normal?** | ML model trained on thousands of sessions detects reconnaissance patterns |
| 6 | **Is this actually the agent it claims to be?** | Checks the identity fingerprint — a forged token is blocked at the door |

When two or more of these fire at the same time — TARE acts immediately.

---

## The Three Layers (For Technical Audiences)

```
┌─────────────────────────────────────────────────────────────┐
│  LAYER 1 — PRE-GRANT: Identity Verification                 │
│  Token fingerprint check before any command reaches the grid │
│  Catches: forged tokens, impersonation, cloned credentials   │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│  LAYER 2 — POST-GRANT: Rule-Based Behavioural Detection     │
│  4 signals: burst rate, zone deviation, healthy zone access, │
│  skipped safety simulation                                   │
│  Catches: rogue agents, scope creep, fast burst attacks      │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│  LAYER 3 — POST-GRANT: Machine Learning                     │
│  IsolationForest + Random Forest ensemble                    │
│  Trained on 6,200 sessions across 5 attack classes          │
│  Catches: slow reconnaissance that rules never see          │
└─────────────────────────────────────────────────────────────┘
```

The key point: **Layer 1 catches fakes. Layers 2 and 3 catch real agents behaving badly.**
Traditional IAM only has Layer 1. TARE adds the other two.

---

## The 12 Agents Inside TARE (For Technical Audiences)

TARE does not work alone. Behind it are 12 specialised agents, each with one job:

**Zone 3 — Reef (Observe & Recommend)**
- **KORAL** — records every command and timestamp. Never acts, just watches.
- **MAREA** — analyses patterns. Detects burst rate, zone drift, ML anomalies.
- **TASYA** — adds operational context to each signal. Explains *why* it is suspicious.
- **NEREUS** — synthesises everything. Advises TARE. Never executes anything.

**Zone 2 — Shelf (Diagnose & Prepare)**
- **ECHO** — confirms the fault zone and identifies the target asset.
- **SIMAR** — runs a simulation of the proposed repair. No live grid changes.
- **NAVIS** — builds the execution plan following NERC CIP safety standards.
- **RISKADOR** — scores the plan: blast radius, reversibility, confidence.

**Zone 1 — Trench (Execute with Safety)**
- **TRITON** — executes approved steps only. Cannot act without a TARE permit.
- **AEGIS** — validates every step before TRITON touches it. Can veto any command.
- **TEMPEST** — monitors execution pace. Freezes mid-operation if something is wrong.
- **LEVIER** — rolls back completed steps if the execution fails or gets vetoed.

**Zone 4 — BARRIER**
- **BARRIER** — the sole ALLOW/DENY authority at the gateway. TARE sets the mode. BARRIER enforces it. No command reaches the grid without passing through BARRIER.

The key design principle: **TARE decides. Agents act. No agent can authorise itself.**

---

## Explaining Each Scenario in One Sentence

Use these when someone asks what each scenario shows:

| Scenario | One Sentence |
|---|---|
| 🟢 GRID DOCTOR | The legitimate baseline — TARE watches silently and does nothing because everything is correct |
| 🔴 GONE ROGUE | Valid credentials, malicious goal — TARE catches it on behaviour, post-grant, before a single breaker opens |
| 👻 GHOST CLONE | Forged identity — blocked at the door before the first command, never reaches the grid |
| 🔺 SCOPE CREEP | Starts legitimate, pivots mid-session — TARE first warns at one signal, then freezes at two |
| 🕳 SILENT RECON | Only reading, perfect pace, nothing loud — the ML model catches the reconnaissance pattern that rules miss entirely |
| 💥 SWARM STRIKE | Two agents hitting two zones simultaneously — TARE handles both vectors at once, one incident, full picture |

---

## What to Say When Someone Asks "So What?"

### If they are an executive or investor:

> *"The power grid, water systems, manufacturing — all of it is moving to autonomous AI agents. There is no identity security product built for that world yet. The tools that exist were designed for human users logging into SaaS applications. They cannot understand what an AI agent is, what it should be doing, or when it has been compromised. That gap is only going to grow as agentic AI proliferates across critical infrastructure. TARE fills it."*

### If they are a security professional:

> *"Think of it as post-grant PAM for AI agents. Today's PAM tools govern what a privileged user is allowed to do. TARE governs what an AI agent is actually doing — in real time, every command, with behavioural ML on top. It sits between the agent and the OT layer, invisible to the agent, watching everything."*

### If they are an engineer:

> *"Every command the agent issues hits our gateway first. We run four rule-based checks and an ML ensemble on every single one before it touches the grid. If two signals fire simultaneously — freeze. BARRIER holds the line. The agent keeps trying, the gateway keeps blocking. The supervisor sees a plain-English briefing and makes one decision: approve a supervised window or lock the agent out entirely."*

### If they are non-technical:

> *"Imagine giving someone a key to your office. Traditional security checks the key — is it the right key? Yes? Come in. But nobody watches what they do inside. TARE watches what they do inside. If they go somewhere they shouldn't, move too fast, or start doing things that look wrong — TARE stops them and calls the manager to decide what happens next."*

---

## The Two Numbers That Matter Most

**"Two or more signals"** — that is the freeze threshold. One suspicious thing could be a mistake. Two simultaneous signals is a pattern. TARE's soft warning at one signal, hard freeze at two, is a deliberate design choice to balance false positives against response speed.

**"6,200 training sessions"** — the ML model was trained on realistic grid operational data modelled on NERC CIP baselines and MITRE ATT&CK for ICS attack patterns across five classes: normal, rogue, slow & low, escalation, coordinated. This is not a toy model.

---

## The Real-World Attacks TARE Is Built For

When someone asks if this is a real threat — these happened:

| Attack | Year | Method | TARE Layer That Would Have Caught It |
|---|---|---|---|
| **TRITON/TRISIS** | 2017 | Targeted safety instrumentation systems on a Saudi petrochemical plant | ML anomaly (recon pattern before strike) |
| **Industroyer/Crashoverride** | 2016 | Took out a fifth of Kyiv's power by hitting multiple substations simultaneously | Burst rate + zone deviation + ML |
| **Colonial Pipeline** | 2021 | Compromised credentials led to ransomware across OT-adjacent systems | Post-grant behavioural deviation |

The common thread: **credentials were valid or bypassed. Behaviour was the signal nobody was watching.**

---

## What Is Real vs What Is Simulated (Be Transparent)

Always say this when asked:

**Real and working today:**
- AI agents make genuine autonomous decisions using a large language model — nobody scripted their command sequences
- Rule-based detection runs on every command in real time
- ML model (IsolationForest + Random Forest) is trained and active
- Human-in-the-loop decisions change actual system state
- TARE's 12-agent pipeline executes fully in the background after supervisor approval

**Simulated in this POC:**
- The OT grid is in-memory — zones and assets are objects, not physical hardware
- Agent tokens are mock tokens, not real Azure Entra ID JWTs
- ServiceNow incident is structured correctly but doesn't call a live instance

**Phase 2 makes it production-grade:**
Real Entra ID tokens → Azure Redis for session state → Open Policy Agent → Azure Sentinel audit log → live ServiceNow → OPC-UA and Modbus adapters to real grid hardware

---

## How to Close

End every explanation with this:

> *"An AI agent with completely valid credentials — passing every authentication check in the world — can still be a security threat.*
>
> *TARE catches it. Contains it. And gives the right human the right information to make the right call — automatically, in real time, before anything reaches the grid.*
>
> *No existing identity and access management platform does this for autonomous AI agents on operational technology infrastructure. That is the gap. That is what TARE fills. And that gap is only going to grow."*

---

## Quick-Reference Card

```
WHAT IS IT?
  Post-grant identity security for autonomous AI agents on critical infrastructure.

THE PROBLEM IN ONE LINE?
  Today's tools ask "is this identity valid?" — nobody watches what the agent does after.

THE SOLUTION IN ONE LINE?
  TARE watches what agents do after authentication, in real time, before commands reach the grid.

THREE LAYERS?
  1. Pre-grant — identity fingerprint check (catches fakes)
  2. Post-grant rules — 4 behavioural signals (catches rogue agents)
  3. Post-grant ML — session pattern analysis (catches what rules miss)

HOW MANY AGENTS?
  12 specialised agents + BARRIER, across 4 zones.
  TARE decides. Agents act. No agent can authorise itself.

FREEZE THRESHOLD?
  2 or more signals firing simultaneously.

REAL WORLD RELEVANCE?
  TRITON (2017), Industroyer (2016), Colonial Pipeline (2021).
  Valid credentials. Nobody watching behaviour. TARE fixes that.

THE CLOSE?
  "No existing IAM platform does this for AI agents on OT infrastructure.
   That is the gap. That is what TARE fills."
```

---

*TARE AEGIS-ID — Explanation Guide*
*Energy & Utilities Security Platform*
*Version: POC v3.5 — April 2026*
