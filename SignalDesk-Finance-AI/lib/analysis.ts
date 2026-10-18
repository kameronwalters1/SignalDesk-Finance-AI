export type SentimentLabel = "Positive" | "Neutral" | "Negative";

export type AnalysisResult = {
  sentiment: { label: SentimentLabel; score: number; confidence: number; positiveTerms: string[]; negativeTerms: string[] };
  topic: string;
  summary: string;
  keyPoints: string[];
  risks: string[];
  metrics: string[];
  cleanedWordCount: number;
  model: "Local NLP" | "OpenAI";
  answer?: string;
};

const positive: Record<string, number> = {
  beat: 2, beats: 2, growth: 1.5, grew: 1.4, gain: 1.4, gains: 1.4, profit: 1.6,
  profitable: 1.7, strong: 1.3, record: 1.2, raised: 1.3, upgrade: 1.6, improved: 1.4,
  improvement: 1.4, expansion: 1.2, resilient: 1.3, opportunity: 1, opportunities: 1,
  outperform: 1.8, bullish: 2, recovery: 1.3, innovation: 1, dividend: 0.8,
};
const negative: Record<string, number> = {
  miss: 2, missed: 2, decline: 1.5, declined: 1.5, loss: 1.8, losses: 1.8, weak: 1.4,
  cut: 1.4, downgrade: 1.8, risk: 1, risks: 1, lawsuit: 1.8, investigation: 1.7,
  volatility: 1.2, uncertain: 1.2, uncertainty: 1.2, inflation: 0.8, debt: 0.9,
  layoffs: 1.5, warning: 1.5, breach: 2, default: 2, bearish: 2, pressure: 1,
};
const topicRules: Record<string, string[]> = {
  "Earnings & Performance": ["earnings", "revenue", "profit", "quarter", "guidance", "margin", "eps"],
  "Markets & Investing": ["stock", "shares", "market", "investor", "portfolio", "bond", "index"],
  "Banking & Rates": ["bank", "lending", "loan", "interest rate", "federal reserve", "deposit", "credit"],
  "Technology & AI": ["technology", "software", "semiconductor", "chip", "cloud", "artificial intelligence", "ai"],
  "Energy & Commodities": ["oil", "gas", "energy", "solar", "commodity", "production", "barrel"],
  "Risk & Regulation": ["risk", "regulation", "regulator", "lawsuit", "compliance", "investigation", "breach"],
};

export function cleanText(input: string) {
  return input.replace(/<[^>]*>/g, " ").replace(/https?:\/\/\S+/g, " ").replace(/[^\w\s$%.,'\-]/g, " ").replace(/\s+/g, " ").trim();
}

function sentences(text: string) {
  const protectedDecimals = text.replace(/(\d)\.(\d)/g, "$1__DECIMAL__$2");
  return protectedDecimals.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((s) => s.replaceAll("__DECIMAL__", ".").trim()).filter(Boolean) ?? [];
}

function selectSummary(text: string) {
  const list = sentences(text);
  if (list.length <= 2) return list.join(" ");
  const scored = list.map((sentence, index) => {
    const words = sentence.toLowerCase().match(/[a-z]+/g) ?? [];
    const signal = words.reduce((sum, word) => sum + (positive[word] ?? 0) + (negative[word] ?? 0), 0);
    const numbers = (sentence.match(/[$%]|\d/g) ?? []).length;
    return { sentence, index, score: signal + Math.min(numbers, 4) * 0.35 + (index === 0 ? 1 : 0) };
  });
  return scored.sort((a, b) => b.score - a.score).slice(0, 2).sort((a, b) => a.index - b.index).map((x) => x.sentence).join(" ");
}

export function analyzeLocally(input: string): AnalysisResult {
  const text = cleanText(input);
  const tokens = text.toLowerCase().match(/[a-z']+/g) ?? [];
  let raw = 0;
  const pos = new Set<string>();
  const neg = new Set<string>();
  tokens.forEach((word, i) => {
    const previous = tokens.slice(Math.max(0, i - 3), i);
    const modifier = previous.some((x) => ["not", "no", "never", "without"].includes(x)) ? -0.8 : 1;
    if (positive[word]) { raw += positive[word] * modifier; pos.add(word); }
    if (negative[word]) { raw -= negative[word] * modifier; neg.add(word); }
  });
  const score = Math.max(-1, Math.min(1, raw / Math.max(4, Math.sqrt(tokens.length))));
  const label: SentimentLabel = score > 0.12 ? "Positive" : score < -0.12 ? "Negative" : "Neutral";
  const topicScores = Object.entries(topicRules).map(([topic, terms]) => ({
    topic,
    score: terms.reduce((n, term) => n + (text.toLowerCase().includes(term) ? 1 : 0), 0),
  })).sort((a, b) => b.score - a.score);
  const foundMetrics = Array.from(new Set(text.match(/(?:\$\s?\d[\d,.]*(?:\s?(?:million|billion|trillion))?|\d+(?:\.\d+)?%|\b\d+(?:\.\d+)?\s?(?:million|billion|trillion)\b)/gi) ?? [])).slice(0, 6);
  const list = sentences(text);
  const riskSentences = list.filter((s) => /risk|uncertain|declin|loss|debt|lawsuit|investigat|volatil|pressure|warning|breach/i.test(s)).slice(0, 3);
  const summary = selectSummary(text);
  const keyPoints = list.map((s) => ({ s, score: (s.match(/[$%]|\d/g) ?? []).length + (/revenue|earnings|profit|guidance|market|growth/i.test(s) ? 2 : 0) })).sort((a, b) => b.score - a.score).slice(0, 3).map((x) => x.s);
  return {
    sentiment: { label, score: Number(score.toFixed(2)), confidence: Number(Math.min(0.96, 0.55 + Math.abs(score) * 0.4).toFixed(2)), positiveTerms: [...pos].slice(0, 6), negativeTerms: [...neg].slice(0, 6) },
    topic: topicScores[0]?.score ? topicScores[0].topic : "General Finance",
    summary,
    keyPoints,
    risks: riskSentences.length ? riskSentences : ["No explicit risk statement was detected; review the complete source before making decisions."],
    metrics: foundMetrics,
    cleanedWordCount: tokens.length,
    model: "Local NLP",
  };
}

export function answerLocally(text: string, question: string) {
  const words = new Set((question.toLowerCase().match(/[a-z]{3,}/g) ?? []).filter((w) => !["what", "does", "this", "about", "from", "with", "that", "have"].includes(w)));
  const ranked = sentences(cleanText(text)).map((sentence) => ({ sentence, score: (sentence.toLowerCase().match(/[a-z]+/g) ?? []).filter((w) => words.has(w)).length + (/risk|outlook|guidance|revenue|profit/i.test(sentence) ? 0.2 : 0) })).sort((a, b) => b.score - a.score);
  return ranked[0]?.score ? ranked.slice(0, 2).map((x) => x.sentence).join(" ") : `The article's main takeaway is: ${selectSummary(cleanText(text))}`;
}
