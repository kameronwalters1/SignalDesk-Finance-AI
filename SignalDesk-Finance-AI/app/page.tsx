import type { Metadata } from "next";
import FinanceApp from "./FinanceApp";

export const metadata: Metadata = {
  title: "SignalDesk AI | Financial News Intelligence",
  description: "NLP sentiment, topic classification, summaries, and grounded Q&A for financial news.",
};

export default function Home() {
  return <FinanceApp />;
}
