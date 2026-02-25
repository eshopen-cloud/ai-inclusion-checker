/**
 * Scoring Engine — computes readiness_score, status_label, gaps, and confidence.
 */
import { Confidence, PageData, Query, ScoreBreakdown, SiteSummary } from "./types";

export function computeScore(
  siteSummary: SiteSummary,
  pages: PageData[],
  queries: Query[],
  scope: string
): ScoreBreakdown {
  // --- Structure Score (0-100) ---

  // H1 presence: 0-10
  const h1Score = siteSummary.h1_count > 0 ? 10 : 0;

  // Question H2 count: 0-25
  const totalQuestionH2 = pages.reduce((s, p) => s + p.question_h2_count, 0);
  const questionH2Score = Math.min(25, totalQuestionH2 * 8);

  // Schema: 0-20
  const schemaScore = siteSummary.schema_detected ? 20 : 0;

  // Word count normalized: 0-20
  const totalWords = siteSummary.total_word_count;
  const wordScore = Math.min(20, Math.round((totalWords / 3000) * 20));

  // Localized signals: 0-25
  let localizedScore = 0;
  if (scope === "local") {
    if (siteSummary.has_local_signals) localizedScore += 15;
    if (siteSummary.city_mentions.length > 0) localizedScore += 10;
  } else {
    // For national, reward broad service keywords
    const totalKeywords = pages.reduce((s, p) => s + p.service_keywords.length, 0);
    localizedScore = Math.min(25, totalKeywords * 2);
  }

  const structureScore = Math.min(100, h1Score + questionH2Score + schemaScore + wordScore + localizedScore);

  // --- Intent Support % ---
  const supportedCount = queries.filter((q) => q.supported).length;
  const intentSupportPct = queries.length > 0 ? (supportedCount / queries.length) * 100 : 0;

  // --- Readiness Score (weighted) ---
  const readinessScore = Math.round(structureScore * 0.4 + intentSupportPct * 0.6);

  // --- Status Label ---
  let statusLabel: string;
  if (readinessScore >= 70) {
    statusLabel = "Structurally Prepared but Expandable";
  } else if (readinessScore >= 40) {
    statusLabel = "Limited Inclusion Readiness";
  } else {
    statusLabel = "Not Structurally Prepared";
  }

  return {
    h1_score: h1Score,
    question_h2_score: questionH2Score,
    schema_score: schemaScore,
    word_count_score: wordScore,
    localized_score: localizedScore,
    structure_score: Math.round(structureScore),
    intent_support_pct: Math.round(intentSupportPct),
    readiness_score: readinessScore,
    status_label: statusLabel,
  };
}

export function detectGaps(
  siteSummary: SiteSummary,
  pages: PageData[],
  scope: string,
  readinessScore: number
): string[] {
  const gaps: string[] = [];

  const totalQuestionH2 = pages.reduce((s, p) => s + p.question_h2_count, 0);
  if (totalQuestionH2 === 0) {
    gaps.push("No decision-stage answer pages detected");
  }

  if (!siteSummary.faq_detected) {
    gaps.push("No FAQ section or structured Q&A content found");
  }

  if (!siteSummary.schema_detected) {
    gaps.push("No JSON-LD structured data (schema.org) detected");
  }

  if (scope === "local" && !siteSummary.has_local_signals) {
    gaps.push("No localized intent alignment (city or region not mentioned in service pages)");
  }

  if (siteSummary.total_word_count < 800) {
    gaps.push("Limited content depth — site has under 800 words total");
  }

  const hasServicePage = pages.some(
    (p) =>
      p.url.includes("/service") ||
      p.url.includes("/solution") ||
      p.url.includes("/product") ||
      p.url.includes("/pricing")
  );
  if (!hasServicePage) {
    gaps.push("No dedicated service, solution, or pricing pages detected");
  }

  return gaps.slice(0, 5); // top 5 gaps
}

export function computeConfidence(siteSummary: SiteSummary): Confidence {
  if (siteSummary.total_word_count < 300) return "Low";
  if (siteSummary.total_word_count < 1000) return "Medium";
  return "High";
}
