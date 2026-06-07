# Dalwin College — AI-Integrated Curriculum

Tool-agnostic, Ontario *Career Colleges Act, 2005* (formerly PCCA 2005) compliant curriculum for two 960-hour / 48-week diplomas at **Dalwin College** (Markham, ON), with generative AI woven through every course.

Each course module specifies categories of AI tooling with illustrative example products — never required products — so the curriculum stays current as vendors shift.

## Diploma programs

- 📘 **[Business Administration & Management (BAM)](./business-administration-management/)** — 12 courses, 960h
- 📗 **[Digital Marketing (DM)](./digital-marketing/)** — 12 courses, 960h

## Cross-cutting + institutional

- 🧭 **[Responsible AI & Digital Ethics Module](./responsible-ai-cross-cutting-module.md)** — threaded through every course (~20h dedicated + 2h per course)
- 📋 **[Assessment Framework & Generative AI Use Policy](./assessment-framework-and-ai-policy.md)** — institutional framework (Red/Amber/Green AI-use tiers, PARIS reporting alignment)

## Regulatory frame

- Ontario *Career Colleges Act, 2005* + O. Reg. 415/06
- Bill 149 (Working for Workers Four) — AI hiring disclosure
- PIPEDA · Quebec Law 25 · CASL · AODA
- AIDA status: lapsed with Bill C-27 prorogation (Jan 2025); replacement still in flux
- OECD AI Principles · NIST AI RMF 1.0

## Design priorities

1. **Tool-agnostic.** No course depends on any single vendor.
2. **AI-required where appropriate.** AI is mandated and disclosed in most applied assessments — students are graded on what they do *with* AI output (briefs, prompts, verification, edits, defenses), not on the output itself.
3. **Practitioner-led.** Leans into modern marketing / SEO / Google Ads / web scraping / AI tooling perspective.
4. **Ontario context.** Career Management, HR, and Capstone modules align with Bill 149 disclosure norms, PARIS reporting, Futurpreneur/BDC funder templates.

## Repo layout

```
business/
├── README.md                                       (this file)
├── responsible-ai-cross-cutting-module.md
├── assessment-framework-and-ai-policy.md
├── business-administration-management/
│   ├── README.md
│   └── 01–12 course modules
└── digital-marketing/
    ├── README.md
    └── 01–12 course modules
```

Shared courses (e.g., Business Communications, Project Management) appear in both diploma directories so each subdir is self-contained.
