# Business Use Case

## Scenario

A financial analyst, communications team, or news-aggregation platform must review a high volume of earnings updates, bank commentary, and market news. Manual first-pass review is repetitive and can make prioritization inconsistent.

## Value proposition

SignalDesk AI produces a consistent first read: document sentiment, likely finance topic, material figures, key statements, explicit risk language, a short summary, and a grounded answer to the analyst's question. The prototype reduces triage time and directs attention toward documents requiring deeper human research. Its transparent local NLP stage also makes the initial score easy to explain and audit.

## Example workflow

An analyst pastes a quarterly earnings article and asks, “What changed in the outlook, and what risks did management identify?” SignalDesk highlights the positive or negative language, classifies the text as earnings-related, extracts reported percentages and dollar values, summarizes the article, and returns evidence drawn only from that article. The analyst then verifies the claims in the original source before using the information in a report.

## Controls and limitations

- Output is explicitly labeled as a research aid, not financial advice.
- Q&A is restricted to the supplied source rather than general market speculation.
- The deterministic fallback keeps the application available and testable without an external provider.
- Lexicon scoring can miss context, irony, and novel terminology.
- Rule-based topic classification is interpretable but less flexible than a trained model.
- LLM output may omit details or phrase an inference too confidently, so human review remains mandatory.
- The prototype does not forecast prices, execute trades, or recommend securities.

## Future enhancements

Potential production improvements include authenticated users, licensed real-time feeds, citation-level highlighting, a trained financial-language model, historical trend dashboards, batch processing, audit logs, and formal bias/performance monitoring.
