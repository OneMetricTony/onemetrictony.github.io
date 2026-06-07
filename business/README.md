# Dalwin College — AI-Integrated Curriculum (v2)

**Dalwin College of Business, Health & Technology** · 8920 Woodbine Ave Suite 202, Markham, ON L3R 9W9
Registered under the *Ontario Career Colleges Act, 2005* · MCU/PARIS reporting

Two 960-hour / 48-week diplomas. **AI woven into every course.** Tool-agnostic — categories with example products as illustrations only, because tools change every 6 months and principles don't. Built on 110+ research sources spanning Semantic Scholar, arxiv, Ontario MCU, six Ontario public colleges, four Ontario private career colleges, and the world's leading business + AI institutions.

## One-page abstracts

- 📘 **[ABSTRACT — Business Administration & Management (BAM)](./abstract-BAM.md)**
- 📗 **[ABSTRACT — Digital Marketing (DM)](./abstract-DM.md)**

## Diploma programs

- 📘 **[Business Administration & Management Diploma](./business-administration-management/)** — 12 AI-titled courses + capstone + internship · 960h
- 📗 **[Digital Marketing Diploma](./digital-marketing/)** — 12 AI-titled courses + capstone + live-client internship · 960h

## Foundation + Institutional

- 🧭 **[AI Foundations Bootcamp](./ai-foundations-bootcamp.md)** — **mandatory** 56-hour entry module taught principles-first, tool-agnostic, for non-coders. Plus 2-hour distributed reactivation in every downstream course (= 84h total spaced exposure).
- 🧠 **[Responsible AI & Digital Ethics Module](./responsible-ai-cross-cutting-module.md)** — cross-cutting
- 📋 **[Assessment Framework & Generative AI Use Policy](./assessment-framework-and-ai-policy.md)** — Red/Amber/Green AI-use tiers, PARIS alignment
- 📚 **[Citations (110+ sources)](./citations.md)** — all `[n]` references with hyperlinks

## v2 design philosophy (post-validation)

The v2 curriculum is the result of two waves of research (~50 specialized agents) plus a 6-agent skeptical validation pass. The validation downgraded v1 from B− → A− after these fixes were applied:

| Change | Why | Source |
|---|---|---|
| Bootcamp 80h → **56h front-loaded + 28h distributed (2h/course)** | Spaced practice beats blocked, g≈0.74 effect on retention | Soderstrom & Bjork [24,25] |
| Weekly intensity 20h → **14h with async catch-up** | Working-adult dropout spikes above 15h/wk | Patterson & Paulson [27] |
| Internship 152h → **200–240h** | Below Ontario PCC peer floor (triOS 200h, Mohawk 245h) | Validation hours-realism agent |
| Python writing Week 3 → **Computer Apps Week 6+ (bootcamp reads Python only)** | Code-first pedagogy → 40%+ withdrawal in non-CS adults | Margolis et al. [18] |
| Title style → **"AI-Powered X"** for marketing/sales, **"AI-Augmented X"** for comms | Active vs. passive signal; matches HubSpot/Salesforce/Adobe convention | Title-validation agent |
| New: **Ontario Bill 194** (public-sector cyber+AI) added to Responsible AI module | Came into force July 1 2025 — material for B2G/MUSH work | Dentons 2025 [38] |
| New: **CRTC Online Streaming Act + dark patterns** in DM curriculum | Required for paid social/video buying competency 2026 | CRTC BRP 2026-96 [42], Gowling WLG [43] |
| New: **Portfolio Capstone artifact** separate from internship | UofT SCS/Google/Harvard all require one — employability signal | Critical review agent |

## Regulatory frame

- Ontario *Career Colleges Act, 2005* + O. Reg. 415/06 (MCU/PARIS approval)
- Bill 149 (Working for Workers Four) — AI hiring disclosure, effective Jan 1 2026
- Bill 194 (Strengthening Cyber Security and Building Trust in the Public Sector Act) — in force July 1 2025
- PIPEDA · Quebec Law 25 · CASL · AODA
- AIDA status: lapsed with Bill C-27 prorogation (Jan 2025); replacement signals tracked
- OECD AI Principles · NIST AI RMF 1.0 · UNESCO AI Competency Framework

## What makes this different from every other Ontario PCC

1. **AI in every course title** (CDI/Anderson/Westervelt teach zero AI; even Conestoga buries AI inside legacy modules).
2. **Principles-first 56h bootcamp** at entry, **before** any specialized course — non-coders welcome.
3. **Spaced practice across all 12 courses** (2h reactivation each), not blocked one-and-done.
4. **Process-based assessment** — students graded on prompt logs, draft iterations, verification work. Not on outputs an LLM could have produced.
5. **Canadian compliance** is structural, not bolt-on: Bill 149 + Bill 194 + PIPEDA + Law 25 + CASL + AODA + CRTC + dark-pattern + scraping ethics all woven through every relevant course.
6. **240h internship + portfolio capstone** — matches Ontario public-college peer norm; CDI's 100h and triOS's 200h are floors we exceed.

## Repo layout

```
business/
├── README.md                              (this file)
├── abstract-BAM.md                        (1-page abstract)
├── abstract-DM.md                         (1-page abstract)
├── ai-foundations-bootcamp.md             (56h entry module)
├── responsible-ai-cross-cutting-module.md (threaded ethics)
├── assessment-framework-and-ai-policy.md  (Red/Amber/Green policy)
├── citations.md                           (110+ sources)
├── business-administration-management/    (BAM diploma)
│   ├── README.md
│   └── 01–12 course modules (AI in every title)
└── digital-marketing/                     (DM diploma)
    ├── README.md
    └── 01–12 course modules (AI in every title)
```
