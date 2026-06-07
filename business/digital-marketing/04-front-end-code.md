# 04 — Front End Code

**Hours / weeks:** 100h / 5 weeks (approx. 20h/week).

## Learning Outcomes

By module end, students will be able to:
1. Read, edit, and assemble semantic HTML5 and modern CSS (Flexbox/Grid) to ship a responsive marketing landing page that meets WCAG 2.2 AA basics and Core Web Vitals targets.
2. Write small JavaScript snippets (event listeners, DOM updates, fetch, simple form validation) sufficient to add interactivity to marketing pages without depending on a developer.
3. Instrument a page with Google Tag Manager — installing the container, configuring a dataLayer, deploying a third-party tracking pixel (e.g., Meta Pixel, LinkedIn Insight, TikTok Pixel) via Custom HTML or built-in template, and firing event-based triggers on form submit, scroll, and click.
4. Direct an AI coding assistant (e.g., GitHub Copilot, Cursor, Claude Code, v0, Bolt — examples only) through a spec-driven workflow: brief, prompt, review, test, refine — and explain every line of generated code in plain English.
5. Deploy a static site to a host (e.g., Netlify, Cloudflare Pages, GitHub Pages — examples only), connect a custom domain, and verify tag fire-order with Tag Assistant / DebugView.
6. Apply marketing-context judgement: privacy/consent (PIPEDA, GDPR consent mode v2), basic source control hygiene, and when to escalate to a developer.

## Weekly Topic Breakdown

- **Wk 1 — HTML structure & the anatomy of a landing page:** semantic tags, accessibility landmarks, meta/OG tags, image optimization; intro to an AI assistant and "explain this code" prompting.
- **Wk 2 — CSS layout for marketers:** the box model, Flexbox, Grid, responsive breakpoints, design tokens, dark mode; using AI to translate Figma/wireframe screenshots into CSS.
- **Wk 3 — JavaScript basics + forms & validation:** variables, functions, DOM, events, fetch, inline validation, honeypots, accessible error messaging; AI-pair-debugging a broken form.
- **Wk 4 — GTM, dataLayer & tracking pixels:** container install, triggers (page view, click, form submit, scroll), variables, dataLayer pushes, deploying Meta/LinkedIn/TikTok/GA4 tags, Consent Mode v2, Tag Assistant QA.
- **Wk 5 — AI-assisted build & deploy:** spec-driven vibe-coding workflow, Git basics, static-site deploy, custom domain + HTTPS, performance budget, capstone polish.

## AI Integration

AI coding assistants are the *primary* teaching method, not a supplement. Categories covered (vendor-neutral):
- (a) **Inline IDE assistants** (e.g., GitHub Copilot).
- (b) **Agentic IDEs** (e.g., Cursor, Windsurf).
- (c) **Terminal/agent coders** (e.g., Claude Code, Codex).
- (d) **Prompt-to-site generators** (e.g., v0, Bolt, Lovable).

Students learn to write specs, scope context, run diffs, request tests, and verify — moving from raw "vibe coding" to a reviewable spec-driven loop.

## Hands-on Projects

1. **Responsive Landing Page (Wk 2):** hand-edited HTML/CSS hero + features + CTA, mobile-first, Lighthouse ≥ 90.
2. **GTM-Instrumented Lead-Gen Form (Wk 4):** validated form + dataLayer + Meta Pixel + GA4 event + Consent Mode banner, QA'd in Tag Assistant.
3. **AI-Built Micro-Site Capstone (Wk 5):** student writes a marketing brief, drives an AI assistant to scaffold a 3-page campaign site, then manually edits copy/CSS/tracking and deploys live.

## Assessment & AI-Use Policy

AI use is **required**, not optional. Students are graded on:
- (a) the brief/prompt they wrote,
- (b) the diffs/edits they made to AI output,
- (c) an oral code-walk where they explain every block line-by-line,
- (d) whether the deployed page actually fires the correct tags.

Submitting unreviewed AI output is treated as incomplete work, not as academic misconduct. Source-control history (commits/prompts) is part of the deliverable.

## Pre/co-requisites

Digital Marketing Foundations (co-req); basic computer literacy and a working laptop.

## Instructor Depth Required

Working front-end developer or senior marketing technologist with 3+ yrs production HTML/CSS/JS, hands-on GTM/GA4 experience, and current daily use of at least two AI coding assistants.

## Sources

- https://developer.mozilla.org/en-US/curriculum/
- https://scrimba.com/articles/best-ai-coding-assistants-2026/
- https://www.tatvic.com/blog/google-tag-manager-gtm-with-example/
