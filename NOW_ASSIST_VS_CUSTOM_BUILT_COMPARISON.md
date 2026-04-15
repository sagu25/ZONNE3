# Tool Comparison: ServiceNow Now Assist vs Custom-Built AI Assistant

---

## Overview

| | Now Assist | Custom-Built AI Assistant |
|---|---|---|
| **What it is** | GenAI layer built natively into ServiceNow platform | AI assistant built on a platform like BlueVerse Foundry, LangChain, or direct LLM APIs |
| **Vendor** | ServiceNow (NowLLM + Azure OpenAI / Claude / Gemini) | Self-built, LTIMindtree-owned |
| **Deployment** | SaaS — lives inside ServiceNow only | Flexible — cloud, on-prem, hybrid |
| **Time to deploy** | Weeks (configuration-heavy) | Varies — days to months depending on complexity |

---

## Feature-by-Feature Comparison

| Capability | Now Assist | Custom-Built |
|---|---|---|
| **Incident / Case Summarization** | ✅ Out-of-the-box | ✅ Buildable |
| **Chat & Virtual Agent** | ✅ Native | ✅ Buildable |
| **Email / Content Generation** | ✅ Native | ✅ Buildable |
| **RAG over company documents** | ⚠️ Limited to ServiceNow data only | ✅ Any data source (SharePoint, Confluence, PDFs, DBs) |
| **Multi-system knowledge** | ❌ ServiceNow-only | ✅ Any system via connectors |
| **Custom workflows** | ⚠️ Within ServiceNow flows only | ✅ Fully flexible |
| **Agent / Agentic workflows** | ✅ Available (2025+) | ✅ Fully buildable |
| **Model choice** | ⚠️ NowLLM, Claude, Azure OpenAI, Gemini (limited control) | ✅ Any LLM — full control |
| **Fine-tuning / custom model** | ❌ Not supported | ✅ Fully supported |
| **Guardrails & governance** | ⚠️ Basic, platform-enforced | ✅ Custom — full control |
| **Multi-language support** | ⚠️ English only (verified); other languages unverified | ✅ Configurable per language |
| **Integration with external tools** | ⚠️ Limited to ServiceNow ecosystem | ✅ Any API, MCP, tool |
| **Analytics & evaluation** | ⚠️ Limited native testing tools | ✅ Custom evaluation (e.g., BlueVerse Evaluator) |
| **ServiceNow-specific tasks** | ✅ Best-in-class | ⚠️ Requires custom integration |

---

## Data & Knowledge Access

| | Now Assist | Custom-Built |
|---|---|---|
| **ServiceNow records** | ✅ Native, deep access | ⚠️ Requires API integration |
| **SharePoint / OneDrive** | ❌ Not natively | ✅ Via connectors |
| **Confluence / Jira** | ❌ Not natively | ✅ Via connectors |
| **Internal PDFs / Policy docs** | ⚠️ Only if uploaded to ServiceNow | ✅ Direct RAG ingestion |
| **Custom databases** | ❌ | ✅ |
| **Real-time external data** | ❌ | ✅ Via tools/APIs |

---

## Customisation & Control

| | Now Assist | Custom-Built |
|---|---|---|
| **Prompt control** | ⚠️ Partial — some skills have locked prompts | ✅ Full prompt engineering control |
| **Response format** | ⚠️ Platform-defined | ✅ Fully configurable |
| **Persona / branding** | ⚠️ Limited | ✅ Full — own name, tone, avatar |
| **Business logic embedding** | ⚠️ Via ServiceNow flows only | ✅ Directly in agent logic |
| **Feedback loop / RLHF** | ❌ | ✅ Buildable |
| **Evaluation & testing** | ⚠️ Limited native tools | ✅ Full evaluation suite (BlueVerse Evaluator) |

---

## Cost & Licensing

| | Now Assist | Custom-Built |
|---|---|---|
| **Pricing model** | Quote-based, bundled into enterprise contracts | LLM API costs + build/maintain costs |
| **Transparency** | ❌ Opaque pricing, often expensive add-on | ✅ Pay-per-use, predictable |
| **Lock-in risk** | ❌ High — all config locked to ServiceNow | ✅ Low — portable |
| **Incremental cost per feature** | ❌ High — each Now Assist SKU priced separately | ✅ Marginal — extend existing build |

---

## Limitations of Now Assist

1. **Platform lock-in** — works only inside ServiceNow. If the client moves platforms, AI investment is lost.
2. **10–20% real resolution rate** — ServiceNow markets 40–60% self-service resolution but real-world deployments show 10–20%.
3. **Hallucination risk** — limits use to low-risk, well-defined workflows.
4. **Complex setup** — slow time-to-value despite being "out-of-the-box".
5. **No external knowledge** — cannot access Confluence, Google Docs, SharePoint, or any non-ServiceNow source natively.
6. **Limited model control** — customers cannot freely choose or switch LLMs.
7. **English-only verified** — multilingual support is experimental and unverified.

---

## Limitations of Custom-Built

1. **Build effort** — requires upfront development investment.
2. **ServiceNow deep integration** — accessing ServiceNow records requires API work.
3. **Maintenance** — team must own updates, model upgrades, and monitoring.
4. **Governance burden** — guardrails, audit, and compliance must be built from scratch.

---

## When to Choose Which

| Scenario | Recommended |
|---|---|
| Client is 100% on ServiceNow, no external data needed | Now Assist |
| Client needs AI across multiple platforms (ServiceNow + SharePoint + Confluence) | Custom-Built |
| Client wants to own the AI, brand it, and extend it freely | Custom-Built |
| Quick win for ITSM summarization with no custom needs | Now Assist |
| Client has sensitive data that cannot go to ServiceNow's cloud | Custom-Built |
| Client wants to evaluate and test AI quality rigorously | Custom-Built |
| Client wants full RAG over internal policy/HR/compliance documents | Custom-Built |
| Client is already paying for ServiceNow enterprise and wants low-friction AI | Now Assist |

---

## Summary Verdict

| Dimension | Winner |
|---|---|
| Speed to deploy (ITSM-specific) | Now Assist |
| Flexibility & extensibility | Custom-Built |
| Data coverage | Custom-Built |
| Cost transparency | Custom-Built |
| ServiceNow-specific tasks | Now Assist |
| Model control | Custom-Built |
| Evaluation & governance | Custom-Built |
| Vendor lock-in risk | Custom-Built |

> **Bottom line:** Now Assist wins for pure ServiceNow ITSM use cases where speed and native integration matter. Custom-Built wins everywhere else — multi-system knowledge, branded experiences, full control over prompts/models/evaluation, and any scenario where the client's data lives outside ServiceNow.

---

*Comparison prepared for LTIMindtree internal use — April 2026*
*Sources: ServiceNow Now Assist documentation, Gartner Peer Insights, Plat4mation, eesel AI, Crossfuze, Redress Compliance*
