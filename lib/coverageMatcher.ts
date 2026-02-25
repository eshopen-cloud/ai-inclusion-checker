/**
 * Coverage Matcher — determines if each query is structurally supported by site content.
 * Uses token overlap ratio + simple TF-IDF cosine similarity.
 */
import { PageData, Query } from "./types";

const MATCH_THRESHOLD = 0.35; // configurable

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP_WORDS.has(t));
}

const STOP_WORDS = new Set([
  "the", "and", "for", "with", "that", "this", "are", "was", "were",
  "have", "has", "had", "not", "but", "from", "they", "your", "their",
  "will", "can", "been", "our", "all", "also", "when", "which", "how",
  "what", "why", "who", "where", "more", "most", "some", "any", "its",
  "you", "about", "into", "than", "other", "then", "there", "these",
]);

function tokenOverlapRatio(a: string, b: string): number {
  const tokensA = new Set(tokenize(a));
  const tokensB = new Set(tokenize(b));
  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  let overlap = 0;
  for (const t of tokensA) {
    if (tokensB.has(t)) overlap++;
  }
  return overlap / Math.max(tokensA.size, tokensB.size);
}

function buildTfVector(tokens: string[]): Map<string, number> {
  const freq = new Map<string, number>();
  for (const t of tokens) {
    freq.set(t, (freq.get(t) || 0) + 1);
  }
  // Normalize by length
  for (const [k, v] of freq) {
    freq.set(k, v / tokens.length);
  }
  return freq;
}

function cosineSimilarity(vecA: Map<string, number>, vecB: Map<string, number>): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (const [term, tfA] of vecA) {
    normA += tfA * tfA;
    if (vecB.has(term)) {
      dotProduct += tfA * (vecB.get(term) || 0);
    }
  }
  for (const [, tfB] of vecB) {
    normB += tfB * tfB;
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dotProduct / denom;
}

function scoreQueryAgainstPage(
  query: string,
  page: PageData
): { title: number; h2: number; faq: number; combined: number } {
  const qTokens = tokenize(query);
  const qVec = buildTfVector(qTokens);

  // Title score
  const titleOverlap = tokenOverlapRatio(query, page.title);
  const titleTokens = tokenize(page.title);
  const titleCosine = cosineSimilarity(qVec, buildTfVector(titleTokens));
  const titleScore = titleOverlap * 0.5 + titleCosine * 0.5;

  // H2 score (best matching H2)
  let bestH2 = 0;
  for (const h2 of page.h2) {
    const h2Overlap = tokenOverlapRatio(query, h2);
    const h2Cosine = cosineSimilarity(qVec, buildTfVector(tokenize(h2)));
    const h2Score = h2Overlap * 0.5 + h2Cosine * 0.5;
    if (h2Score > bestH2) bestH2 = h2Score;
  }

  // FAQ / content score
  let faqScore = 0;
  if (page.question_h2_count > 0) {
    const contentOverlap = tokenOverlapRatio(query, page.raw_text.slice(0, 3000));
    faqScore = contentOverlap * 0.4;
  }

  const combined = Math.max(titleScore * 0.4 + bestH2 * 0.4 + faqScore * 0.2, titleScore, bestH2);

  return {
    title: Math.round(titleScore * 100) / 100,
    h2: Math.round(bestH2 * 100) / 100,
    faq: Math.round(faqScore * 100) / 100,
    combined: Math.round(combined * 100) / 100,
  };
}

export function matchQueryCoverage(
  queries: Omit<Query, "supported" | "best_page" | "scores">[],
  pages: PageData[],
  threshold: number = MATCH_THRESHOLD
): Query[] {
  return queries.map((q) => {
    let bestScore = { title: 0, h2: 0, faq: 0, combined: 0 };
    let bestPage: string | null = null;

    for (const page of pages) {
      const score = scoreQueryAgainstPage(q.text, page);
      if (score.combined > bestScore.combined) {
        bestScore = score;
        bestPage = page.url;
      }
    }

    const supported = bestScore.combined >= threshold;

    return {
      ...q,
      supported,
      best_page: supported ? bestPage : null,
      scores: { title: bestScore.title, h2: bestScore.h2, faq: bestScore.faq },
    };
  });
}
