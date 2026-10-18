"use client";

import { useState } from "react";
import type { AnalysisResult } from "../lib/analysis";

const samples = [
  { title: "Northstar Cloud raises outlook", source: "Sample Financial Wire", date: "October 14, 2026", text: "Northstar Cloud reported third-quarter revenue of $2.4 billion, up 18% from a year earlier, as demand for its artificial intelligence infrastructure remained strong. Adjusted earnings beat analyst expectations and operating margin improved by 2.1 percentage points. Management raised full-year revenue guidance to a range of $9.1 billion to $9.3 billion. Executives said the company continues to invest in data centers, which may pressure free cash flow during the next two quarters. Shares gained 6% in after-hours trading, although management warned that component shortages remain a risk." },
  { title: "Harbor Bank faces credit pressure", source: "Sample Markets Desk", date: "October 12, 2026", text: "Harbor Bank posted quarterly net income of $410 million, down 12% from the prior year. Revenue was stable, but provisions for credit losses increased to $185 million as delinquencies rose in the commercial real estate portfolio. Deposits grew 3% and the common equity tier 1 ratio remained at 12.4%. Management maintained its annual outlook but warned that higher-for-longer interest rates and office-property exposure could pressure results. The bank said it has tightened underwriting standards and increased reserves." },
  { title: "Solstice Energy expands capacity", source: "Sample Energy Brief", date: "October 10, 2026", text: "Solstice Energy approved a $750 million expansion of its solar manufacturing plant, which is expected to increase annual capacity by 40%. The company expects production to begin in late 2027 and said long-term customer contracts cover about 70% of the added output. Management described demand as resilient but acknowledged risks from permitting delays, commodity-price volatility, and potential changes to renewable-energy incentives. The project will be funded through cash and existing credit facilities." },
];

export default function FinanceApp() {
  const [selected, setSelected] = useState(0);
  const [text, setText] = useState(samples[0].text);
  const [question, setQuestion] = useState("What is the outlook and what are the main risks?");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function analyze() {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text, question }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Analysis failed");
      setResult(data);
    } catch (e) { setError(e instanceof Error ? e.message : "Analysis failed"); }
    finally { setLoading(false); }
  }

  function chooseSample(index: number) { setSelected(index); setText(samples[index].text); setResult(null); }

  return <main>
    <header className="topbar">
      <a className="brand" href="#top"><span className="brandMark">S</span><span>SignalDesk <b>AI</b></span></a>
      <nav><a href="#workspace">Workspace</a><a href="#method">Method</a><a href="#use-case">Business case</a></nav>
      <span className="status"><i /> Analysis engine online</span>
    </header>

    <section className="hero" id="top">
      <div className="eyebrow">FINANCIAL NEWS INTELLIGENCE</div>
      <h1>Turn market noise into<br/><em>decision-ready signals.</em></h1>
      <p>Analyze financial text with transparent NLP, sentiment scoring, topic classification, AI summaries, and evidence-grounded Q&amp;A.</p>
      <div className="heroStats"><div><strong>6</strong><span>finance topics</span></div><div><strong>2-stage</strong><span>NLP + AI pipeline</span></div><div><strong>0</strong><span>advice or forecasts</span></div></div>
    </section>

    <section className="workspace section" id="workspace">
      <div className="sectionHead"><div><span>01 / ANALYZE</span><h2>Research workspace</h2></div><p>Select a sample or paste your own article. Processing begins with deterministic NLP, then uses the configured AI provider for grounded synthesis.</p></div>
      <div className="sampleRow">{samples.map((s, i) => <button className={selected === i ? "sample active" : "sample"} key={s.title} onClick={() => chooseSample(i)}><span>0{i+1}</span><b>{s.title}</b><small>{s.source} · {s.date}</small></button>)}</div>
      <div className="panel inputPanel">
        <div className="panelTop"><label htmlFor="article">Financial article or report</label><span>{text.length.toLocaleString()} characters</span></div>
        <textarea id="article" value={text} onChange={(e) => { setText(e.target.value); setSelected(-1); }} />
        <div className="queryRow"><input aria-label="Question about the article" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask a grounded question about this text…"/><button onClick={analyze} disabled={loading}>{loading ? "Analyzing…" : "Analyze article"}<span>→</span></button></div>
        {error && <div className="error">{error}</div>}
      </div>
    </section>

    <section className="results section" aria-live="polite">
      <div className="sectionHead"><div><span>02 / FINDINGS</span><h2>Analysis brief</h2></div><p>{result ? `Completed with ${result.model} · ${result.cleanedWordCount} cleaned words` : "Run the analysis to generate a complete intelligence brief."}</p></div>
      {!result ? <div className="empty"><div className="radar"><i/><i/><i/></div><h3>Your analysis will appear here</h3><p>Sentiment, topic, material figures, risks, summary, and Q&amp;A are generated together.</p></div> : <>
        <div className="metricGrid">
          <article className={`metric ${result.sentiment.label.toLowerCase()}`}><span>SENTIMENT</span><strong>{result.sentiment.label}</strong><div className="scoreBar"><i style={{width: `${Math.abs(result.sentiment.score)*100}%`}}/></div><small>Score {result.sentiment.score > 0 ? "+" : ""}{result.sentiment.score.toFixed(2)} · {(result.sentiment.confidence*100).toFixed(0)}% confidence</small></article>
          <article className="metric"><span>PRIMARY TOPIC</span><strong>{result.topic}</strong><small>Rule-based sector classification</small></article>
          <article className="metric"><span>MATERIAL FIGURES</span><strong>{result.metrics.length}</strong><small>{result.metrics.join(" · ") || "No explicit figures detected"}</small></article>
        </div>
        <div className="briefGrid">
          <article className="brief wide"><span className="tag">AI SUMMARY</span><h3>Executive readout</h3><p className="summaryText">{result.summary}</p></article>
          <article className="brief"><span className="tag">KEY POINTS</span><h3>What matters</h3><ul>{result.keyPoints.map((x) => <li key={x}>{x}</li>)}</ul></article>
          <article className="brief risk"><span className="tag">RISK SCAN</span><h3>Watch items</h3><ul>{result.risks.map((x) => <li key={x}>{x}</li>)}</ul></article>
          {result.answer && <article className="brief wide answer"><span className="tag">GROUNDED Q&amp;A</span><h3>{question}</h3><p>{result.answer}</p></article>}
        </div>
      </>}
    </section>

    <section className="method section" id="method">
      <div className="sectionHead"><div><span>03 / METHOD</span><h2>Transparent by design</h2></div><p>A two-stage workflow separates measurable NLP signals from generative synthesis.</p></div>
      <div className="flow"><article><b>1</b><span>INGEST</span><h3>Article input</h3><p>Paste text or choose a curated finance sample with source metadata.</p></article><i>→</i><article><b>2</b><span>PREPROCESS</span><h3>Clean & tokenize</h3><p>Remove markup, normalize whitespace, and prepare finance terms.</p></article><i>→</i><article><b>3</b><span>CLASSIFY</span><h3>Score signals</h3><p>Weighted lexicon sentiment, negation handling, and topic rules.</p></article><i>→</i><article><b>4</b><span>SYNTHESIZE</span><h3>Summary & Q&amp;A</h3><p>Grounded AI output with a deterministic fallback for reliability.</p></article></div>
    </section>

    <section className="business section" id="use-case">
      <div><span className="kicker">BUSINESS USE CASE</span><h2>A faster first read for<br/>financial research teams.</h2><p>SignalDesk helps analysts and news-aggregation teams triage high volumes of financial text. It highlights tone, subject, material figures, and risk language before a human performs deeper research.</p></div>
      <div className="caseList"><article><b>01</b><h3>Scenario</h3><p>An analyst needs to screen earnings updates and market news before the morning meeting.</p></article><article><b>02</b><h3>Value</h3><p>Consistent first-pass tagging and concise summaries reduce repetitive reading and focus attention.</p></article><article><b>03</b><h3>Controls</h3><p>Every answer stays grounded in supplied text. Outputs are research aids—not recommendations or forecasts.</p></article></div>
    </section>
    <footer><span>SignalDesk AI · Educational proof of concept</span><span>Not financial advice. Verify all source information.</span></footer>
  </main>;
}
