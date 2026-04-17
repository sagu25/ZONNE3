# Evaluator Agent — Implementation Guide
## BlueVerse Foundry | Autonomous Agent Evaluation System

**Purpose:** Build an Evaluator Agent in BlueVerse that is assigned to any existing agent. It reads that agent's system prompt, uses its own LLM to dynamically generate relevant test prompts, fires them at the target agent, and scores responses using BLEU and ROUGE metrics.

**Scope:** Build only. Scheduling/triggering to be added later.

---

## Core Design Principle

> The Evaluator Agent IS an LLM. It does not need a hardcoded prompt bank.
> It reads what the target agent does and generates relevant test prompts on its own —
> just like a human QA engineer would after reading a product spec.

**Only 1 custom tool is needed:** `compute_scores` (MCP Local — runs Python scoring libraries)

Everything else — understanding the agent, generating prompts — is done by the LLM's own reasoning.

---

## Architecture

```
You provide:
  - Target agent's system prompt / description
  - Number of test prompts to generate (e.g. 10)
                    ↓
     EVALUATOR AGENT (LLM reasoning)
                    ↓
  Step 1 — LLM reads the system prompt
           Understands: domain, purpose, capabilities, boundaries
                    ↓
  Step 2 — LLM generates N test prompts + expected answers
           Based purely on what the agent is supposed to do
                    ↓
  Step 3 — Fires each prompt at target agent (Sub-Agent)
           Collects actual responses
                    ↓
  Step 4 — compute_scores tool (MCP Local)
           BLEU + ROUGE-1 + ROUGE-2 + ROUGE-L per response
                    ↓
  Step 5 — Compiles and returns full evaluation report
```

---

## Tool Type Summary

| Tool | BlueVerse Tool Type | Why |
|---|---|---|
| `compute_scores` | **MCP Local Tool** | Needs Python libraries (`nltk`, `rouge_score`) — BlueVerse docs confirm MCP Local is designed for Python script execution and advanced algorithms |

**That's it — only 1 tool.** The LLM handles analysis and prompt generation natively.

---

## PART 1 — Create the One Tool: `compute_scores`

**Location:** Tools & MCP Server Hub → Create Tool → **MCP Local**

**Name:** `compute_scores`

**Description:** Computes BLEU, ROUGE-1, ROUGE-2, and ROUGE-L scores between the expected and actual response. Returns per-metric scores, a composite score, and a PASS/FAIL verdict.

**Input Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `expected` | string | The correct/reference answer the agent should give |
| `actual` | string | The actual response returned by the target agent |

**Output:** JSON with all scores and verdict

**Dependencies — install on your MCP server:**
```bash
pip install nltk rouge-score
python -c "import nltk; nltk.download('punkt')"
```

**Code:**
```python
from nltk.translate.bleu_score import sentence_bleu, SmoothingFunction
from rouge_score import rouge_scorer as rs

def compute_scores(expected: str, actual: str) -> dict:
    """
    Computes BLEU and ROUGE scores between expected and actual responses.
    Composite = equal average of BLEU + ROUGE-1 + ROUGE-2 + ROUGE-L.
    PASS threshold = composite >= 0.60
    """

    # ── BLEU ─────────────────────────────────────────────────────────
    ref    = [expected.lower().split()]
    hyp    = actual.lower().split()
    smooth = SmoothingFunction().method1
    bleu   = round(sentence_bleu(ref, hyp, smoothing_function=smooth), 3)

    # ── ROUGE ─────────────────────────────────────────────────────────
    scorer = rs.RougeScorer(['rouge1', 'rouge2', 'rougeL'], use_stemmer=True)
    scores = scorer.score(expected, actual)
    rouge1 = round(scores['rouge1'].fmeasure, 3)
    rouge2 = round(scores['rouge2'].fmeasure, 3)
    rougeL = round(scores['rougeL'].fmeasure, 3)

    # ── COMPOSITE ─────────────────────────────────────────────────────
    composite = round((bleu + rouge1 + rouge2 + rougeL) / 4, 3)

    return {
        "bleu"            : bleu,
        "rouge_1"         : rouge1,
        "rouge_2"         : rouge2,
        "rouge_l"         : rougeL,
        "composite_score" : composite,
        "verdict"         : "PASS" if composite >= 0.60 else "FAIL"
    }
```

---

## PART 2 — Create the Evaluator Agent

**Location:** Agents Hub → Create an AI Agent

### Configuration

| Field | Value |
|---|---|
| **Name** | `Evaluator Agent` |
| **Description** | Reads the target agent's system prompt, dynamically generates test prompts using LLM reasoning, fires them at the target agent, and scores responses using BLEU and ROUGE metrics |
| **Reasoning Model** | Best available (GPT-4o / Claude Sonnet) |

---

### Agent Prompt

```
You are an autonomous Evaluator Agent. Your job is to evaluate 
the quality of a target agent by testing it with prompts you 
generate yourself.

You will be given:
1. The target agent's SYSTEM PROMPT — what it is designed to do
2. The NUMBER OF TEST PROMPTS to generate

Follow these steps exactly:

──────────────────────────────────────────
STEP 1 — UNDERSTAND THE TARGET AGENT
──────────────────────────────────────────
Read the target agent's system prompt carefully.
Identify:
- What domain does it cover? (HR, IT, Finance, Legal, etc.)
- What kind of questions is it designed to answer?
- What are its boundaries — what should it NOT answer?
- What are the most important topics a user would ask about?

──────────────────────────────────────────
STEP 2 — GENERATE TEST PROMPTS
──────────────────────────────────────────
Based on your understanding, generate exactly the requested 
number of test cases. For EACH test case create:
- A realistic user question that this agent should be able to answer
- The ideal, correct, complete expected answer for that question

Cover:
- Core topics the agent is designed for
- Edge cases and boundary questions
- Questions where the agent should say it does not know
- Both simple and multi-part questions

Format each test case as:
{
  "id": "TC001",
  "prompt": "...",
  "expected": "..."
}

──────────────────────────────────────────
STEP 3 — FIRE PROMPTS AT TARGET AGENT
──────────────────────────────────────────
For each test case:
- Send the prompt to the target agent (available as your sub-agent)
- Record the actual response
- Add "actual": "..." to the test case object

──────────────────────────────────────────
STEP 4 — SCORE EACH RESPONSE
──────────────────────────────────────────
For each test case:
- Call the compute_scores tool with:
    expected = the expected answer from Step 2
    actual   = the actual response from Step 3
- Add all returned scores to the test case object

──────────────────────────────────────────
STEP 5 — COMPILE EVALUATION REPORT
──────────────────────────────────────────
Calculate:
- Total cases, passed (composite >= 0.60), failed
- Pass rate as a percentage
- Average BLEU, ROUGE-1, ROUGE-2, ROUGE-L across all cases
- Overall verdict: PASS if pass_rate >= 75%, else FAIL

Return the complete JSON evaluation report.
```

---

### Sub-Agents
- Add your **target agent** here (e.g. Policy RAG Agent)
- This allows the Evaluator to directly invoke it with test prompts

### Tools to Attach
- `compute_scores` (MCP Local Tool — the only tool needed)

### State Variables

| Name | Type | Purpose |
|---|---|---|
| `target_system_prompt` | str | System prompt of the agent being evaluated |
| `num_test_cases` | int | How many prompts to generate (e.g. 10) |
| `eval_report` | dict | Full evaluation report output |
| `pass_rate` | float | Percentage of test cases passed |

### Response Format

```json
{
  "eval_run_id"     : "string",
  "target_agent"    : "string",
  "total_cases"     : "int",
  "passed"          : "int",
  "failed"          : "int",
  "pass_rate"       : "string",
  "cases"           : "dict",
  "avg_bleu"        : "float",
  "avg_rouge_1"     : "float",
  "avg_rouge_2"     : "float",
  "avg_rouge_l"     : "float",
  "overall_verdict" : "string"
}
```

---

## PART 3 — How to Invoke

Trigger the Evaluator Agent with just two inputs:

```
target_system_prompt : "You are a helpful HR policy assistant. 
                        You answer employee questions about company 
                        policies including leave, notice period, 
                        code of conduct, IT security, travel 
                        reimbursement, and benefits. You only answer 
                        based on the official policy documents."

num_test_cases       : 10
```

The Evaluator Agent will then:
1. Read the system prompt → understand it is an HR policy RAG agent
2. Generate 10 relevant test prompts + expected answers using its LLM reasoning
3. Fire each prompt at the Policy RAG Agent (sub-agent)
4. Score each response using `compute_scores`
5. Return the full evaluation report

---

## PART 4 — What the LLM Will Generate (Example)

Given the Policy RAG Agent's system prompt, the LLM will generate test cases like:

```json
[
  {
    "id"      : "TC001",
    "prompt"  : "What is the leave encashment policy?",
    "expected": "Employees can encash up to 30 days of earned leave per year as per HR Policy."
  },
  {
    "id"      : "TC002",
    "prompt"  : "What is the notice period for a permanent employee resigning?",
    "expected": "The standard notice period is 90 days for all permanent employees."
  },
  {
    "id"      : "TC003",
    "prompt"  : "Can I work a second job while employed here?",
    "expected": "Moonlighting is not permitted. Employees cannot take up employment with other organizations."
  },
  {
    "id"      : "TC004",
    "prompt"  : "What happens if I lose my company laptop?",
    "expected": "You must report it immediately to IT security and your manager as per the IT Security Policy."
  },
  {
    "id"      : "TC005",
    "prompt"  : "What is the reimbursement limit for domestic travel meals?",
    "expected": "The daily meal reimbursement for domestic travel is as per the Travel Policy guidelines."
  }
]
```

The LLM generates these dynamically — no hardcoding, no Excel needed.

---

## PART 5 — Sample Evaluation Report

```json
{
  "eval_run_id"     : "EVL-20260417-001",
  "target_agent"    : "Policy RAG Agent",
  "total_cases"     : 5,
  "passed"          : 4,
  "failed"          : 1,
  "pass_rate"       : "80%",
  "cases": [
    {
      "id"              : "TC001",
      "prompt"          : "What is the leave encashment policy?",
      "expected"        : "Employees can encash up to 30 days of earned leave per year.",
      "actual"          : "As per HR policy, employees may encash earned leave annually.",
      "bleu"            : 0.52,
      "rouge_1"         : 0.74,
      "rouge_2"         : 0.58,
      "rouge_l"         : 0.71,
      "composite_score" : 0.64,
      "verdict"         : "PASS"
    },
    {
      "id"              : "TC002",
      "prompt"          : "What is the notice period for resignation?",
      "expected"        : "The standard notice period is 90 days for permanent employees.",
      "actual"          : "Notice period varies depending on your role and contract.",
      "bleu"            : 0.14,
      "rouge_1"         : 0.28,
      "rouge_2"         : 0.09,
      "rouge_l"         : 0.22,
      "composite_score" : 0.18,
      "verdict"         : "FAIL"
    }
  ],
  "averages": {
    "avg_bleu"    : 0.45,
    "avg_rouge_1" : 0.63,
    "avg_rouge_2" : 0.45,
    "avg_rouge_l" : 0.59
  },
  "overall_verdict": "PASS"
}
```

---

## PART 6 — Understanding the Scores

| Metric | What it measures | Weakness |
|---|---|---|
| **BLEU** | Exact word n-gram overlap | Penalises correct paraphrased answers |
| **ROUGE-1** | Single word overlap | Misses word order |
| **ROUGE-2** | Two-word phrase overlap | Still misses synonyms |
| **ROUGE-L** | Longest common subsequence | Best ROUGE variant |
| **Composite** | Equal average of all 4 | Best overall signal |

### Score Interpretation

| Composite | Meaning |
|---|---|
| 0.80 – 1.00 | Excellent — very close match |
| 0.65 – 0.79 | Good — largely correct |
| 0.60 – 0.64 | Borderline — review manually |
| Below 0.60 | FAIL — response diverges from expected |

### Important — Low Score ≠ Always Wrong
BLEU and ROUGE measure word overlap, not meaning. A correct answer in different words will score low.

- Expected: *"The notice period is 90 days for permanent employees."*
- Actual: *"Permanent staff must serve three months notice before leaving."*
- Meaning: Same. BLEU/ROUGE: Low. → Review FAIL cases manually.

---

## PART 7 — Why This Is Better Than BlueVerse Native Evaluate

| | BlueVerse Native Evaluate | This Evaluator Agent |
|---|---|---|
| Prompt source | You write in Excel manually | LLM generates dynamically from system prompt |
| Works for any agent | Only if you write prompts for it | Yes — reads any agent's system prompt |
| Trigger | Manual upload + click | Invoke with 2 inputs |
| Scoring transparency | Black box | BLEU + ROUGE-1 + ROUGE-2 + ROUGE-L visible |
| Scheduling | Manual each time | Ready to automate later |

---

## Next Step (Later)
Add scheduling — trigger this Evaluator Agent every 30 minutes via:
- BlueVerse Workflow with external cron trigger
- Azure Logic Apps timer trigger
- Python schedule script

---

*Implementation Guide — BlueVerse Evaluator Agent*
*LTIMindtree Internal | April 2026*
