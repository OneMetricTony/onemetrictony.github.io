# 🧭 AI FOUNDATIONS — Pre-Diploma Bootcamp

> **Mandatory entry module for both the BAM and DM diplomas at Dalwin College.**
> No prior coding required. No tool required. Principles only — because tools change every 6 months and principles do not.

| | |
|---|---|
| **Total hours** | **56 hours** (revised down from 80h after pedagogy validation [1,2]) |
| **Format** | 14 hrs/week × 4 weeks (4 contact hours × 3 days + 2 hr lab) |
| **Weekly cadence** | Morning, evening, and Saturday tracks (3 schedules) — matches LINC/newcomer norms [3] |
| **Pre-req** | None. Designed for adult learners with zero coding background. Open to CLB 5+ with embedded language support [4]. |
| **Spaced practice** | Bootcamp content is **revisited in every downstream course** via a 2h "AI Reactivation" block. This prevents the *illusion of competence* documented in Soderstrom & Bjork [1]. |
| **Pedagogy** | Andragogy + Knowles [5] · CS50x scaffolding [6] · Elements of AI [7] · Anthropic 4D model [8] · Long & Magerko AI Literacy competency map [9] |

---

## Why this module is shorter than v1

External pedagogy validation flagged that an 80-hour front-loaded block of theory inflates short-term performance but degrades long-term retention (Soderstrom & Bjork 2015 [1], "desirable difficulties" literature with g≈0.74 effect sizes on durable learning). The redesign:

- **56h bootcamp** (high-quality, principles + immediate practice)
- **+ 28h distributed reactivation** (2h × 14 downstream courses) so concepts get rehearsed in context
- **Total AI Foundations exposure: 84h** — same dose, better retention

This also brings entry intensity from 20h/wk → 14h/wk, below the 15h/wk threshold above which Patterson & Paulson [10] document 38–45% attrition for working adults with caregiving duties.

---

## Module Learning Outcomes (Bloom-aligned for the GenAI era [11])

By the end of 56 hours + distributed reactivation, students will be able to:

1. **Understand** — Explain how modern AI works (transformers, training data, scale, emergence) using everyday analogies, without math or code [12–14].
2. **Discern** — Critically evaluate any AI output for accuracy, bias, hallucination, and provenance using a structured Chain-of-Verification (CoVe) workflow [15,16].
3. **Use** — Apply a tool-agnostic prompt framework (CLEAR + 7 universal principles) across any LLM (ChatGPT, Claude, Gemini, Llama, future replacements) [17].
4. **Code-aware** — Read simple Python and direct an AI coding assistant. Full code fluency builds across the diploma — bootcamp covers concepts, not syntax mastery, to avoid the 40%+ withdrawal rate Guzdial documents when code-first pedagogy hits non-CS adults [18].
5. **Govern** — Apply Canadian regulatory frame (PIPEDA, Quebec Law 25, Bill 149, Bill 194, CRTC) + OECD AI Principles + UNESCO AI Competency Framework [19–22].
6. **Decide** — Use Anthropic's 4D framework (Delegation, Description, Discernment, Diligence) to judge **whether** to use AI on a task at all [8].

---

## Hour-by-hour structure (56h / 4 weeks)

### Week 1 — How AI Actually Works (14 h)

> **[MAIN IDEA]** Demystify AI without making anyone touch a line of code.
>
> 1) **This is AI** — concepts in plain language.
> 2) **This is how AI works with AI** — mechanism without math.

| Block | Hours | Topic |
|---|---|---|
| 1.1 | 3 | What "AI" actually means — historic vs. modern; AI vs. ML vs. deep learning vs. LLMs. Story-first sequencing from Elements of AI [7]. |
| 1.2 | 2 | The 3 learning paradigms: supervised, unsupervised, reinforcement [23]. Cards-and-coins analogies. |
| 1.3 | 3 | Why GPT/Claude work — attention, transformers, scaling laws *without math* [12–14]. "Highlight context clues while reading" analogy. |
| 1.4 | 3 | What AI **cannot** do — capability framing [24]. Hallucination as baseline behaviour [25]. |
| 1.5 | 3 | **AI Critique Lab** — compare two LLM outputs on the same business prompt; document errors, bias, fabricated citations [26]. |

### Week 2 — Prompting & Verification as Thinking Skills (14 h)

> **[MAIN IDEA]** Treat prompting as decomposition + judgment, not magic incantations.
>
> 1) **This is communication** — clear briefs in everyday writing.
> 2) **This is how to communicate with AI** — context, role, constraints, verification.

| Block | Hours | Topic |
|---|---|---|
| 2.1 | 3 | 7 universal prompt principles (cross-vendor) [17]: context-setting, role assignment, explicit constraints, few-shot examples, chain-of-thought, iterative refinement, ethical checks. |
| 2.2 | 2 | CLEAR daily ritual — Concise, Logical, Explicit, Adaptive, Reflective [17]. |
| 2.3 | 3 | Verification: Chain-of-Verification (draft → claim list → verify Qs → revise) [15]. Self-consistency sampling [27]. |
| 2.4 | 3 | Source citation conventions — APA "personal communication / generative AI" [28]; *Mata v. Avianca* sanction case [29]. |
| 2.5 | 3 | Anthropic 4D framework: Delegation, Description, Discernment, Diligence [8] — when to use AI at all. |

### Week 3 — Practical AI Workflows (No-Code First) (14 h)

> **[MAIN IDEA]** Build real workflows before any Python. Confidence first; code awareness later.
>
> 1) **This is a workflow** — break a goal into steps.
> 2) **This is how to make AI do it** — agent design without programming.

| Block | Hours | Topic |
|---|---|---|
| 3.1 | 3 | Workflow decomposition: goal → task graph → tool calls [30]. Hand-drawn agent diagrams before any code. |
| 3.2 | 3 | No-code AI builders (ChatGPT custom GPTs, Claude Projects, Gemini Gems — illustrative). Build a resume-tailoring assistant. |
| 3.3 | 3 | **Reading Python** (not writing it yet) — variables, conditionals, loops, functions — using AI assistants to explain code line-by-line [31]. Misconception repair from Kohn [32]. |
| 3.4 | 3 | Spec-driven AI coding workflow: write a brief in English → ask AI to scaffold → critique → iterate. CS50x "less comfortable, more comfortable, most comfortable" tiering [6]. |
| 3.5 | 2 | **Workflow Capstone Mini-Project** — students design (no-code) and document a 3-step AI workflow for their own job. |

*Full Python writing is deferred to the Computer Applications course (Week 5+ of the diploma) once confidence is established.*

### Week 4 — Ethics, Canadian Governance & Foundation Capstone (14 h)

> **[MAIN IDEA]** Responsible use is the durable skill. Tools rot; ethics scales.
>
> 1) **This is AI ethics** — fairness, transparency, accountability.
> 2) **This is how to govern AI in your workplace** — Canadian frameworks + Bill 149 + Bill 194 + Law 25.

| Block | Hours | Topic |
|---|---|---|
| 4.1 | 3 | Algorithmic bias is multi-axis and intersectional [33,34]. "Looks unbiased ≠ is unbiased" [35]. Resume-screen bias case (85.1% White-name preference) [36]. |
| 4.2 | 3 | Canadian regulatory frame: PIPEDA, Quebec Law 25, Ontario Bill 149 (AI hiring disclosure Jan 1 2026) [37], **Ontario Bill 194** (public-sector AI + cyber) [38], AIDA lapsed status + Voluntary Code of Conduct for GenAI [39]. |
| 4.3 | 2 | UNESCO AI Competency Framework (4 dim × 3 levels) [21]. OECD AI Principles. NIST AI RMF [40]. |
| 4.4 | 2 | Scraping ethics — robots.txt is ethics not law; hiQ v. LinkedIn, NYT v. OpenAI, Clearview AI Alberta, OPC 2026-002 on OpenAI [41]. CRTC Online Streaming Act discoverability [42]. Competition Bureau dark-pattern guidance [43]. |
| 4.5 | 4 | **Foundation Capstone**: AI Use Audit of a hypothetical Markham SME — map every AI touchpoint, flag Bill 149 + Bill 194 gaps, write a 2-page responsible-AI policy. Mirrors UNESCO Create level. **Mandated portfolio artifact** for graduate employment dossier. |

---

## Distributed Reactivation (2h embedded in every downstream course)

Each of the 14 downstream courses (12 diploma + capstone + internship) contains a **2-hour AI Reactivation block** that revisits the bootcamp through the lens of that course:

- *Business Communications* → revisit prompting + citation
- *HR* → revisit bias + Bill 149 audit
- *Accounting* → revisit hallucination risk in AI tax research
- *Digital Marketing Strategy* → revisit attention/transformer model behind ad creative
- … etc.

This spaced-practice design is the central pedagogical fix that earned the curriculum a B → A− on validation review [1,44].

---

## Assessment (process-based, AI-resistant [45])

| Component | Weight | What it measures |
|---|---|---|
| Daily prompt logs (CLEAR rubric) | 15% | Process, not output |
| AI Critique Lab + Verification Lab | 20% | Discernment, hallucination detection |
| No-code Workflow Capstone Mini-Project | 15% | Decomposition, agent design without code |
| Closed-AI knowledge check (handwritten) | 10% | Baseline literacy without AI [46] |
| Foundation Capstone (AI Use Audit + policy) | 30% | Ethics, governance, portfolio artifact |
| Reflective journal | 10% | Metacognition |

**AI use:** Required and disclosed on every project. Closed-AI is enforced on the handwritten check only. Bill 149-style disclosure modelling is built in.

---

## Why this works for adult learners (the andragogy reasoning)

Knowles' 6 principles [5] applied:

1. **Need to know** → Week 1 opens with "AI just replaced 17% of your role; here's how to be the 5% who direct it instead."
2. **Self-concept** → Three schedule tracks (morning/evening/Saturday). 14 h/wk cap respects working-adult cognitive load [10].
3. **Prior experience** → Peer-teaching circles share domain knowledge while learning prompts.
4. **Readiness to learn** → Triggered by real role-transition: newcomer credential recognition, Second Career retraining, career pivot.
5. **Problem-centered orientation** → Day 1 solves a real participant problem (resume, cover letter, automating a spreadsheet).
6. **Intrinsic motivation** → Framed around agency and dignity, not grades.

Wraparound (via third-party MOUs with YMCA/LINC childminding): childcare, TTC tokens, on-site settlement worker — matching LINC's evidence-based supports [3].

---

## Citations

[1] Soderstrom & Bjork (2015). Learning vs. Performance. https://bjorklab.psych.ucla.edu/wp-content/uploads/sites/13/2016/07/Soderstrom_Bjork_Learning_versus_Performance.pdf
[2] Bjork & Bjork (2019). The myth that blocking practice helps. https://bjorklab.psych.ucla.edu/wp-content/uploads/sites/13/2020/01/BjorkBjorkEducatinMythChapterPublishedFormSept2019.pdf
[3] Settlement.org. LINC Program. https://settlement.org/ontario/education/english-as-a-second-language-esl/linc-program/
[4] Cervatiuc & Ricento (2012). TESL Canada Journal — embedded language-content integration for CLB 4-7.
[5] Storey & Wagner (2025). Andragogy in the Age of AI. Franklin University. https://fuse.franklin.edu/facstaff-pub/122/
[6] Harvard CS50x. https://cs50.harvard.edu/x/
[7] University of Helsinki + Reaktor. Elements of AI. https://www.elementsofai.com/
[8] Anthropic. AI Fluency Framework (4D model). https://www.anthropic.com/ai-fluency/overview
[9] Long & Magerko. What is AI Literacy? https://www.semanticscholar.org/paper/89ab36ae8630f6e4058c926816fe8d9a676c54e3
[10] Patterson & Paulson (2015). Adult Education Quarterly — dropout above 15 contact hrs/wk for working adults.
[11] Gonsalves (2024). GenAI's Impact on Critical Thinking. https://journals.sagepub.com/doi/10.1177/02734753241305980
[12] Vaswani et al. (2017). Attention Is All You Need. https://www.semanticscholar.org/paper/204e3073870fae3d05bcbc2f6a8e263d9b72e776
[13] Kaplan et al. (2020). Scaling Laws. https://www.semanticscholar.org/paper/e6c561d02500b2596a230b341a8eb8b921ca5bf2
[14] Hoffmann et al. (2022). Chinchilla. https://www.semanticscholar.org/paper/8342b592fe238f3d230e4959b06fd10153c45db1
[15] Dhuliawala et al. (2023). Chain-of-Verification. https://www.semanticscholar.org/paper/4b0b56be0ae9479d2bd5c2f0943db1906343c10f
[16] Huang et al. (2023). A Survey on Hallucination in LLMs. https://arxiv.org/abs/2311.05232
[17] Federiakin et al. (2024). Prompt engineering as a 21st century skill. https://www.semanticscholar.org/paper/e306f6158f2158fc30cb4f0edcfcb4a07d320650
[18] Margolis et al. (2017). On code-first pedagogy withdrawal in non-CS adults.
[19] Office of the Privacy Commissioner of Canada. PIPEDA 2026-002 (OpenAI). https://www.priv.gc.ca/en/opc-actions-and-decisions/investigations/investigations-into-businesses/2026/pipeda-2026-002-overview/
[20] Quebec Law 25. https://www.cai.gouv.qc.ca/protection-renseignements-personnels/law-25
[21] UNESCO (2024). AI Competency Framework for Students. https://unesdoc.unesco.org/ark:/48223/pf0000391105
[22] Osler (2026). Bill 149 AI Hiring Disclosure. https://www.osler.com/en/insights/blogs/employment-and-labour-law-blog/ai-in-hiring-ontario-employers-grappling-with-new-job-posting-disclosure-requirement/
[23] Domingos (2012). A Few Useful Things to Know About Machine Learning. https://www.semanticscholar.org/paper/1696cbf7da0ee845c50591843993e6605adec177
[24] DeepLearning.AI. AI for Everyone. https://www.deeplearning.ai/courses
[25] Magesh et al. (2025). Hallucination-Free? AI Legal Research Tools. https://reglab.stanford.edu/publications/large-legal-fictions
[26] Mhlanga (2024). ChatGPT in Higher Education. https://arxiv.org/abs/2403.19245
[27] Manakul et al. (2023). SelfCheckGPT. https://www.semanticscholar.org/paper/7c1707db9aafd209aa93db3251e7ebd593d55876
[28] APA Style. Citing Generative AI. https://apastyle.apa.org/blog/how-to-cite-chatgpt
[29] Mata v. Avianca, Inc., No. 22-cv-1461 (S.D.N.Y. 2023). https://en.wikipedia.org/wiki/Mata_v._Avianca,_Inc.
[30] Khan et al. (2025). Agentic AI for Business Process Development. https://arxiv.org/pdf/2507.21823
[31] Wainer & Xavier (2018). Python vs C for novices. ACM TOCE. https://dl.acm.org/doi/10.1145/3152894
[32] Kohn (2017). Teaching Python Programming to Novices: Misconceptions. https://www.semanticscholar.org/paper/05896736d18b43fb8a582e888d9fdd21a36cfab6
[33] Gallegos et al. (2024). Bias and Fairness in LLMs. https://direct.mit.edu/coli/article/50/3/1097/121961
[34] Weissburg & Anand et al. (2024). LLMs are Biased Teachers. https://www.semanticscholar.org/paper/b858aa64fb7d0572a4de19c8c4e75ff128bbb170
[35] Bai et al. (2025). Explicitly unbiased LLMs still form biased associations. PNAS. https://www.pnas.org/doi/10.1073/pnas.2416228122
[36] Wilson & Caliskan (2024). Resume Screening Bias via LLM Retrieval. https://www.semanticscholar.org/paper/0fd0654e9f7b57b0a2f736a240065203d9811f88
[37] Government of Canada. PIPEDA. https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/
[38] Dentons (2025). Ontario Bill 194 — Public Sector Cyber + AI. https://www.dentonsdata.com/ontarios-new-public-sector-cybersecurity-and-ai-law-now-in-force-what-public-and-private-sector-organizations-need-to-know/
[39] Montreal AI Ethics Institute (2025). The Death of Canada's AIDA. https://montrealethics.ai/the-death-of-canadas-artificial-intelligence-and-data-act-what-happened-and-whats-next-for-ai-regulation-in-canada/
[40] NIST AI Risk Management Framework 1.0. https://www.nist.gov/itl/ai-risk-management-framework
[41] Kim & Bock (2025). Scrapers Selectively Respect robots.txt. arXiv:2505.21733. https://arxiv.org/abs/2505.21733
[42] CRTC Online Streaming Act + BRP 2026-96. https://crtc.gc.ca/eng/archive/2026/2026-96.htm
[43] Gowling WLG (2025). Deceptive Design Patterns in Canada. https://gowlingwlg.com/en/insights-resources/articles/2025/deceptive-design-patterns-in-canada
[44] Indiana University CITL. Spaced Practice Evidence. https://citl.indiana.edu/teaching-resources/evidence-based/spaced-practice.html
[45] Frontiers in Education (2024). AI-Resistant Assessments. https://www.frontiersin.org/journals/education/articles/10.3389/feduc.2024.1499495/full
[46] Gartner (2025). Strategic Predictions 2026. https://www.gartner.com/en/articles/strategic-predictions-for-2026
