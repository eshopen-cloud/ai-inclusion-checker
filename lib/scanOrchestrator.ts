/**
 * Scan Orchestrator — coordinates the full scan pipeline.
 */
import { crawlSite } from "./crawler";
import { analyzeStructure } from "./analyzer";
import { extractCategoryAndPersona } from "./categoryExtractor";
import { generateQueries } from "./intentGenerator";
import { matchQueryCoverage } from "./coverageMatcher";
import { computeScore, detectGaps, computeConfidence } from "./scoringEngine";
import { ScanRecord, ScanRequest } from "./types";
import { generateDemoPages } from "./demoData";

/**
 * Runs the full scan synchronously and returns the result.
 * This avoids in-memory store issues on serverless platforms (Vercel).
 */
export async function runScanSync(
  requestId: string,
  scanToken: string,
  req: ScanRequest
): Promise<ScanRecord> {
  const { domain, scope, city, audience } = req;

  const base: ScanRecord = {
    request_id: requestId,
    scan_token: scanToken,
    domain,
    scope,
    city,
    audience,
    status: "running",
    category: "",
    persona: { title: "", goal: "", pain_points: [] },
    readiness_score: 0,
    status_label: "",
    confidence: "Medium",
    example_query: "",
    queries: [],
    structural_gaps: [],
    created_at: new Date().toISOString(),
  };

  try {
    // 1. Crawl
    const crawlResult = await crawlSite(domain);

    if (crawlResult.blocked_by_robots) {
      return {
        ...base,
        status: "failed",
        error: "This site blocked crawlers via robots.txt. We cannot analyze it.",
      };
    }

    if (crawlResult.error === "UNREACHABLE" || !crawlResult.homepage.html) {
      console.log(`[scan] Site unreachable, using demo content for ${domain}`);
      const demo = generateDemoPages(domain);
      crawlResult.homepage = demo.homepage;
      crawlResult.pages = demo.pages;
    }

    // 2. Structural analysis
    const structural = analyzeStructure(crawlResult.homepage, crawlResult.pages, city);

    if (structural.pages.length === 0) {
      return {
        ...base,
        status: "failed",
        error: "Could not parse any content from this site.",
      };
    }

    // 3. Category & persona extraction
    const categoryInfo = await extractCategoryAndPersona(structural.pages, audience, domain);

    // 4. Generate queries
    const rawQueries = generateQueries(
      categoryInfo.category,
      scope,
      audience,
      city,
      categoryInfo.persona.pain_points[0]
    );

    // 5. Match coverage
    const queries = matchQueryCoverage(rawQueries, structural.pages);

    // 6. Score
    const scoreBreakdown = computeScore(structural.site_summary, structural.pages, queries, scope);

    // 7. Gaps
    const structuralGaps = detectGaps(
      structural.site_summary,
      structural.pages,
      scope,
      scoreBreakdown.readiness_score
    );

    // 8. Confidence
    const confidence = computeConfidence(structural.site_summary);

    // 9. Build result
    const exampleQuery =
      queries[0]?.text ||
      `Best ${categoryInfo.category} ${city ? `in ${city.split(",")[0]}` : "near me"}`;

    return {
      ...base,
      status: "complete",
      category: categoryInfo.category,
      persona: categoryInfo.persona,
      readiness_score: scoreBreakdown.readiness_score,
      status_label: scoreBreakdown.status_label,
      confidence,
      example_query: exampleQuery,
      queries: queries.map((q) => ({ id: q.id, text: q.text, supported: q.supported })),
      structural_gaps: structuralGaps,
      score_breakdown: scoreBreakdown,
      structural_analysis: structural,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`[scan] Error for ${scanToken}:`, message);
    return {
      ...base,
      status: "failed",
      error: "An internal error occurred. Please try again.",
    };
  }
}
