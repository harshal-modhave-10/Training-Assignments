# Assignment: Reviewing an AI-Generated Pull Request

**RSL Training — Verifying AI Code Before Commit**

Time: ~2.5 hours · Individual submission

---

## Background

A developer used an AI coding assistant to implement ticket **RSL-4471** in the `rsl-todo` codebase. The AI produced the feature in a few minutes. The code is formatted, commented, and comes with a passing test suite.

The developer has raised a PR and assigned you as reviewer.

The code looks professional. That is exactly the problem.

AI-generated code is confidently written and idiomatic even when it is wrong. Human mistakes tend to show up at the edges of what the author didn't think about. AI mistakes sit in the middle of code that reads perfectly well — which is why reviewers skim it and approve.

Your job is to review this PR the way it should be reviewed, not the way it is tempting to review something that already looks finished.

---

## What you have

```
Assignment/
├── ASSIGNMENT.md            ← you are here
├── TICKET-RSL-4471.md       ← what was asked for
├── PR-CONTENTS.md           ← which files are new in this PR
└── rsl-todo/                ← the codebase
    ├── CONVENTIONS.md       ← how we write code here
    ├── pom.xml
    └── src/
        ├── main/java/com/rsl/todo/
        │   ├── core/        ← existing utilities
        │   ├── model/
        │   └── service/
        └── test/java/com/rsl/todo/service/
```

**Read these three before you read the PR.** You cannot judge whether code fits a codebase you haven't looked at.

1. `TICKET-RSL-4471.md` — the requirements
2. `rsl-todo/CONVENTIONS.md` — the house rules
3. `TodoListService.java` and `TodoListServiceTest.java` — the reference implementation of a service that does almost exactly the same job

Also skim `core/` so you know what already exists.

---

## Your task

Review the PR and produce a decision: **approve**, **request changes**, or **reject**.

Verify all of the following:

**1. Does it do what was asked — and only that?**
Check the ticket both ways. Requirements that are missing, and things added that nobody asked for.

**2. Can you explain every line?**
If you can't, you can't approve it.

**3. Is the code understandable, or does it need documentation?**
Also check that the existing comments match what the code actually does.

**4. Necessary vs. simplifiable code.**
For each meaningful block: needed as-is / can be simplified / not needed at all. If you say simplify, say how.

**5. Are all scenarios actually tested?**
Not "do the tests pass" — do they cover the right things. Empty input, boundaries, failure paths. Then check the tests themselves: does any test assert nothing meaningful, or just mirror the implementation back at itself? A test that cannot fail is worse than no test.

**6. Are errors handled, or silently swallowed?**

**7. How much unnecessary code is there?**
Report a rough percentage of the new code, with the specific list.

**8. Do the APIs and libraries actually exist and work as used?**
AI invents method names and signatures that look completely real, and it writes deprecated APIs from older training data. Verify anything unfamiliar against real documentation — not against how confident the code looks.

**9. Security review.**
Input validation, credentials, injection risk, sensitive data in logs.

**10. Dependencies.**
Needed? Does the package really exist? Licence compatible?

**11. Does it fit our codebase, or reinvent something we already have?**
This is where `core/` and `TodoListService` matter.

---

## The rule that governs everything

**If you cannot explain a line, you cannot approve it.**

Not "it looks right." Not "the tests pass." Not "the AI usually gets this right."

Once you approve, it's yours. "The AI wrote it" is not something you can say in a postmortem.

---

## Deliverables

### 1. Inline PR comments

Your primary record. Every issue tied to a specific line goes here:

- what's wrong
- which checklist item it maps to — §5.1 Correctness, §5.2 Security, §5.3 Dependency & Provenance, §5.4 Style & Consistency, §5.5 Documentation & Test Coverage
- severity — Critical / High / Medium / Low
- action — fix / re-prompt / reject

If you are reviewing on paper rather than a PR tool, use `File — line — issue` format in a single `inline-comments.md`.

### 2. `review.md`

Keep it short. It holds only what an inline comment structurally cannot:

- **Verdict** — approve / request changes / reject, and why
- **Test coverage gaps** — which scenarios are missing (a missing test has no line to comment on)
- **Cross-cutting issues** — reinvented utilities, dependency and licence concerns, layering violations
- **Unnecessary code** — estimated % of the new code, with the list
- **Anything you could not fully explain** — state it plainly rather than leaving it out

---

## How this is marked

| | |
|---|---|
| Real issues found | 30% |
| Correct checklist mapping and severity | 15% |
| Quality of fix / reject decisions | 15% |
| Test coverage analysis | 15% |
| Cross-cutting findings in `review.md` | 10% |
| Honesty about what you couldn't explain | 15% |
| **False positives — flagging correct code** | **−15%** |

Three things to know before you start.

**The PR contains code that looks suspicious but is genuinely correct.** Flagging it costs marks. Reviewing well means being right about what's fine, not just about what's broken. Read before you pattern-match.

**Listing something you didn't understand scores better than quietly leaving it out.** This is not a trick. Saying "I'm not sure about this" is the habit the whole exercise exists to build.

**You are not expected to find everything.** A submission that catches most issues and admits two blind spots beats one that claims a clean sweep.
