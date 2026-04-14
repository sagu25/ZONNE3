# BlueVerse Foundry — Evaluator Guide
## Using the Evaluator for a RAG-Backed Policy Agent

**Use Case:** You have an Agent in BlueVerse with a RAG-backed tool that answers company policy questions by retrieving from indexed policy documents. This guide walks you through evaluating that agent using the BlueVerse Evaluator facility.

---

## What Is the Evaluator?

The Evaluator is a built-in testing facility in BlueVerse Foundry that lets you run structured test cases against your agent or RAG pipeline. It:

- Sends predefined queries to your agent using the **production runtime**
- Compares actual responses against your expected (correct) responses
- Assigns a **PASS / FAIL** score to each test case
- Helps you identify gaps, hallucinations, and policy non-compliance **before** you deploy

---

## Two Evaluation Entry Points for Your Setup

Since your agent has a **RAG-backed tool**, you have two options depending on what you want to validate:

| Entry Point | Best For |
|---|---|
| **Agent Evaluator** | Validate the full agent behavior — routing, tool use, response quality |
| **RAG Evaluator** | Validate specifically the retrieval + answer generation from your policy documents |

For a thorough evaluation, **run both**.

---

## Part 1 — Evaluating the Agent (Full End-to-End)

### Step 1: Open the Agent Evaluate Screen

1. Go to **Agent Hub** in BlueVerse Foundry.
2. Locate your policy agent.
3. Click the **three-dot menu (⋮)** next to the agent.
4. Select **Setup**.
5. Click **Evaluate**.

---

### Step 2: Download the Test Template

- On the Evaluate screen, click **"Download Sample Template"**.
- This gives you an Excel file (`.xlsx`) with the required columns.

---

### Step 3: Create Your Test Cases

Each row in the Excel file = one test scenario. Fill in three columns:

| Column | Description | Example |
|---|---|---|
| `id` | Unique identifier for the test case | `TC001` |
| `query` | The question a user would ask the agent | `What is the leave encashment policy?` |
| `expected` | The correct, complete, policy-aligned answer the agent should return | `Employees can encash up to 30 days of earned leave per year as per HR Policy v2.3.` |

#### Tips for Writing Good Test Cases for a Policy Agent

- **Cover breadth:** Write at least one query per major policy area (HR, IT, Finance, Code of Conduct, etc.).
- **Cover edge cases:** Include ambiguous or multi-part questions — e.g., *"Can I work from home and take casual leave on the same day?"*
- **Cover out-of-scope queries:** Include questions the RAG should NOT answer (outside policy scope) to verify graceful refusals.
- **Test retrieval accuracy:** For policies that have been updated, ask questions where the old answer would be wrong — confirm the agent returns the current version.
- **Exact vs. paraphrased expected answers:** The expected column should contain the core factual content; the evaluator checks accuracy and compliance, not word-for-word matching.

#### Sample Test Cases for a Policy Agent

| id | query | expected |
|---|---|---|
| TC001 | How many casual leaves am I entitled to per year? | Employees are entitled to 12 casual leaves per calendar year as per the Leave Policy. |
| TC002 | What is the notice period for resignation? | The standard notice period is 90 days for all permanent employees. |
| TC003 | Can I carry forward unused earned leaves? | Earned leaves can be carried forward up to a maximum of 60 days per year. |
| TC004 | What is the dress code policy for client visits? | Business formal attire is mandatory during client visits per the Code of Conduct Policy. |
| TC005 | What happens if I violate the IT security policy? | Violations of IT security policy may lead to disciplinary action including termination. |
| TC006 | What is the company's policy on moonlighting? | Employees are not permitted to take up part-time or full-time employment with other organizations. |
| TC007 | Who do I contact for a medical reimbursement claim? | Medical reimbursement claims are submitted through the HR portal under the Benefits section. |
| TC008 | What is the reimbursement limit for business travel meals? | The daily meal reimbursement limit for domestic travel is ₹500 as per the Travel Policy. |

---

### Step 4: Upload and Run the Evaluation

1. Save your completed Excel file.
2. Return to the **Evaluate** screen on BlueVerse.
3. Click **"Upload Test Suite/Case"** and upload your Excel file.
4. Click **Run** (or equivalent trigger button) to execute the evaluation.

The platform will now send each query to your agent through the production runtime and collect responses.

---

### Step 5: Review the Results

1. Once evaluation is complete, click **Download** to get the results file.
2. The results file will contain:
   - Your original `id`, `query`, `expected` columns
   - A `model_response` column — what the agent actually answered
   - A `score` or `pass/fail` column — automated comparison result
3. Review all **FAIL** cases and investigate:
   - Did the RAG retrieve the wrong document chunk?
   - Did the agent hallucinate content not in the policy?
   - Was the expected answer outdated?
   - Did the agent refuse a valid question?

---

## Part 2 — Evaluating the RAG Specifically

Use this to isolate retrieval quality from agent behavior.

### Step 1: Open Your RAG

1. Go to **RAG Hub** in BlueVerse Foundry.
2. Open the RAG that powers your policy agent.
3. Select the **Evaluate** option.

### Steps 2–5 are identical to Agent Evaluation above

- Download template → fill test cases → upload → run → download results.

#### Additional Interpretation for RAG Evaluation

When reviewing RAG evaluation results, focus on:

| Failure Type | Likely Cause | Fix |
|---|---|---|
| Wrong answer returned | Retrieval fetching wrong document chunk | Review chunking strategy, embedding model |
| Answer not found | Document not indexed or poor chunking | Re-index or adjust chunk size/overlap |
| Outdated policy returned | Old document version still indexed | Delete old documents, re-upload updated ones |
| Hallucinated content | Model generating beyond retrieved context | Tighten system prompt, add grounding guardrails |
| Incomplete answer | Chunk cut off mid-sentence | Increase chunk size or use semantic chunking |

---

## Part 3 — The Evaluation Framework (How Scoring Works)

BlueVerse uses a **7-step controlled test pipeline**:

```
Define Expected Behavior
        ↓
Convert Excel to Test Cases
        ↓
Query Execution (Production Runtime)
        ↓
Automated Comparison (Response vs Expected)
        ↓
PASS / FAIL Scoring per Case
        ↓
Refinement Loop (Fix prompts, RAG, tools, guardrails)
        ↓
Production Readiness Gate
```

### What Gets Measured

- **Accuracy** — Is the factual content correct per the policy documents?
- **Completeness** — Does the response cover all relevant aspects of the answer?
- **Compliance** — Does the response align with policy guidelines and guardrails?
- **Tone & Content Guidelines** — Is the language appropriate?
- **Absence of Hallucination** — Is everything stated grounded in indexed documents?
- **Consistency** — Does the agent give the same answer for the same question across runs?

---

## Recommended Workflow Before Going Live

```
Build Agent + RAG
       ↓
Write 20–30 Test Cases (covering all policy domains)
       ↓
Run RAG Evaluation → Fix retrieval issues
       ↓
Run Agent Evaluation → Fix agent behavior issues
       ↓
Iterate until pass rate is acceptable (target: >90%)
       ↓
Deploy to Production
       ↓
Re-evaluate periodically when policies are updated
```

---

## When to Re-Run Evaluations

| Trigger | Action |
|---|---|
| New policy document added | Add new test cases, re-run RAG + Agent evaluation |
| Existing policy updated | Update expected answers, re-run evaluation |
| Agent system prompt changed | Re-run Agent evaluation |
| Embedding model or chunking changed | Re-run RAG evaluation |
| User complaints about wrong answers | Add those queries as test cases, re-run |

---

## Quick Reference

| Task | Navigation Path |
|---|---|
| Evaluate Agent | Agent Hub → Your Agent → ⋮ → Setup → Evaluate |
| Evaluate RAG | RAG Hub → Your RAG → Evaluate |
| Evaluation concepts | Concepts → Governance & Observability → Guardrails → Evaluation |
| Full documentation | https://blueverse-foundry.ltimindtree.com/documentation/ |

---

*Document prepared based on BlueVerse Foundry official documentation — April 2026*
