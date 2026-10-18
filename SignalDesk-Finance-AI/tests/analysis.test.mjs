import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("source includes preprocessing, sentiment, topics, and negation", () => {
  const source = fs.readFileSync(new URL("../lib/analysis.ts", import.meta.url), "utf8");
  assert.match(source, /cleanText/);
  assert.match(source, /positive/);
  assert.match(source, /negative/);
  assert.match(source, /topicRules/);
  assert.match(source, /not.*no.*never.*without/);
});

test("API route includes grounded local fallback and OpenAI Responses API", () => {
  const source = fs.readFileSync(new URL("../app/api/analyze/route.ts", import.meta.url), "utf8");
  assert.match(source, /api\.openai\.com\/v1\/responses/);
  assert.match(source, /analyzeLocally/);
  assert.match(source, /grounded only in the article/);
});
