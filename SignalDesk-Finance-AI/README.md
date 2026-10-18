# SignalDesk AI

SignalDesk AI is a complete proof-of-concept financial-news intelligence application. A user can select a curated finance sample or paste an article, receive transparent sentiment and topic analysis, identify material figures and risk language, generate a concise summary, and ask a question grounded in the supplied text.

## Assignment requirements covered

- **Finance text input:** three curated samples plus a free-form article field
- **Preprocessing:** HTML/URL removal, whitespace normalization, case normalization, tokenization
- **Traditional NLP:** weighted finance lexicon, three-token negation handling, sentiment score/label/confidence
- **Classification:** rule-based classification across six finance topics
- **LLM integration:** OpenAI Responses API for summary, key points, risk extraction, and Q&A
- **Reliable demonstration:** deterministic local summarization and Q&A fallback when no API key is configured
- **Interface:** responsive web application with article selection, text input, question input, results, method, and business use case
- **Responsible use:** source-grounded responses and a visible non-advisory disclaimer

## Architecture

1. The browser sends article text and an optional question to `POST /api/analyze`.
2. `lib/analysis.ts` cleans and tokenizes the text, scores finance sentiment, classifies the topic, extracts figures, and selects risk sentences.
3. If `OPENAI_API_KEY` is available, the server calls the OpenAI Responses API with a finance-specific, source-grounded prompt.
4. If an API key is absent or the provider is unavailable, a deterministic extractive summary and evidence-ranked answer are returned. The app therefore remains testable for an instructor without paid services.

## Run locally

Requirements: Node.js 22.13 or later.

```bash
npm install
npm run dev
```

Open the local URL shown in the terminal (normally `http://localhost:3000`). Choose a sample or paste at least 80 characters, optionally enter a question, and select **Analyze article**.

## Optional live OpenAI mode

Create `.env.local` (never commit this file):

```text
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-5-mini
```

Restart the development server. The results header will report **OpenAI** when the live provider completes successfully and **Local NLP** when the offline fallback is used.

## Validation

```bash
npm run lint
npm test
```

## Project structure

```text
app/
  api/analyze/route.ts    # NLP orchestration and optional LLM request
  FinanceApp.tsx          # complete interactive interface
  globals.css             # responsive visual system
data/
  sample_finance_news.json
docs/
  BUSINESS_USE_CASE.md
  SUBMISSION_GUIDE.md
lib/
  analysis.ts             # preprocessing, sentiment, topics, summary, Q&A
tests/
  analysis.test.mjs
```

## Limitations

Lexicon sentiment may miss sarcasm, domain-specific context, or forward-looking nuance. Topic rules are intentionally interpretable but are not a replacement for a trained sector model. Generated summaries can omit context. This prototype does not predict prices or make investment recommendations; analysts must verify results against the complete original source.

## Responsible-use statement

SignalDesk AI is an educational research aid, not financial advice. It should support—not replace—source review, professional judgment, compliance controls, and appropriate model governance.
