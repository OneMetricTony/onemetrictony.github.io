# 10 — Digital Analytics

**Hours / weeks:** 100h / 5 weeks (20h/wk: 12 instructor-led + 8 lab/project).

## Learning Outcomes

1. Design a measurement strategy that maps business KPIs to a tagging/event schema, data layer, and reporting plan for a typical SMB or e-commerce client.
2. Implement and QA a full GA4 + tag-manager deployment, including key events, custom dimensions, enhanced measurement, and cross-domain/server-side considerations.
3. Build executive and operational dashboards that translate raw event data into decisions, using a BI tool such as Looker Studio against GA4 and BigQuery sources.
4. Write and audit SQL against GA4's BigQuery export schema (events, user_pseudo_id, event_params, user_properties) for funnels, attribution, and cohort analysis.
5. Use AI assistants responsibly for SQL generation, anomaly detection, and insight summarization, with documented prompts, verification, and disclosure.
6. Apply Canadian privacy law (PIPEDA, Quebec Law 25) and Consent Mode v2 to configure consent-aware analytics, including consent state handling and data retention.

## Weekly Topic Breakdown

- **Wk 1 — Measurement Strategy & Tag Management:** business questions to KPIs, measurement plan, data layer design; tag-manager fundamentals (containers, triggers, variables), debugging, versioning. Example tool: GTM.
- **Wk 2 — GA4 Events, Conversions & Audiences:** automatic, enhanced, recommended and custom events; key events (with default value parameter, Nov-2025 change), custom dimensions/metrics, calculated metrics, predictive audiences, explorations.
- **Wk 3 — Reporting & Dashboards:** report library vs. explorations, attribution models, assisted conversions; dashboard design principles; Looker Studio connectors, blends, parameters, controls, row-level filters.
- **Wk 4 — BigQuery Basics & AI-Assisted SQL:** GA4 BigQuery export schema, UNNEST event_params, sessionization, funnels, retention; intro to BigQuery ML (ARIMA_PLUS, anomaly detection); NL-to-SQL via Gemini/Conversational Analytics and verifying generated SQL.
- **Wk 5 — Consent, Privacy & Capstone:** Consent Mode v2 (ad_storage, analytics_storage, ad_user_data, ad_personalization), consent state at event level, PIPEDA implied vs Law 25 express consent, CASL, data retention, IP anonymization; capstone presentations.

## AI Integration

- **NL-to-SQL:** ask Gemini/Conversational Analytics for "top 10 landing pages by purchase rate last 28 days from GA4 export" and verify the generated SQL.
- **Anomaly detection:** BigQuery ML `ML.DETECT_ANOMALIES` over daily sessions/revenue; flag drops vs. forecast.
- **AI-generated insights:** Analytics Advisor / Looker AI narratives summarizing weekly performance; students critique accuracy.
- **Predictive metrics:** GA4 purchase probability, churn probability, predicted revenue feeding audiences.
- **AI report drafting:** LLM drafts the executive summary from a dashboard screenshot + KPI table; student edits for accuracy and tone.

## Hands-on Projects

1. **GA4 + Tag Manager implementation** for a sample site: measurement plan, data layer, events, key events, consent banner integration, QA report.
2. **Looker Studio executive dashboard** blending GA4 + a CRM/ads CSV: KPI scorecards, channel deep-dive, narrative commentary.
3. **NL-to-SQL exploration** on the GA4 sample BigQuery dataset: 5 business questions answered via AI-assisted SQL plus one BQML anomaly-detection query, with a written verification log.

## Assessment & AI-Use Policy

30% projects · 25% capstone · 20% lab quizzes · 15% SQL practical (closed-book on schema/joins) · 10% professionalism.

AI tools (Gemini, ChatGPT, Claude, Copilot) are permitted and encouraged for SQL drafting, formula help, and summarization; students must log prompts, cite the tool, and certify that they validated outputs. AI use is prohibited on the closed-book SQL practical. Fabricated metrics or unverified AI SQL = academic-integrity violation.

## Pre/co-requisites

Pre: Intro to Digital Marketing, Spreadsheets & Data Literacy. Co: Performance Media Buying.

## Instructor Depth Required

Practitioner with 3+ years implementing GA4/GTM client-side and server-side, comfort writing GA4-export SQL in BigQuery, experience with Looker Studio at exec level, and hands-on with at least one AI/NL-to-SQL workflow (Conversational Analytics, Gemini in BigQuery, or equivalent).

## Sources

- https://developers.google.com/analytics/devguides/collection/protocol/ga4/changelog
- https://cloud.google.com/blog/products/data-analytics/nl2sql-with-bigquery-and-gemini
- https://www.cookie-banner.ca/blog/cookie-consent-canada-guide-2025
