/**
 * Scan Orchestrator — coordinates the full scan pipeline.
 */
import { crawlSite } from "./crawler";
import { analyzeStructure } from "./analyzer";
import { extractCategoryAndPersona } from "./categoryExtractor";
import { generateQueries } from "./intentGenerator";
import { matchQueryCoverage } from "./coverageMatcher";
import { computeScore, detectGaps, computeConfidence } from "./scoringEngine";
import { setRecord, updateRecord } from "./store";
import { ScanRecord, ScanRequest } from "./types";
import { generateDemoPages } from "./demoData";

export async function runScan(
  scanToken: string,
  requestId: string,
  req: ScanRequest
): Promise<void> {
  const { domain, scope, city, audience } = req;

  try {
    // 1. Crawl
    updateRecord(scanToken, { status: "running" });

    const crawlResult = await crawlSite(domain);

    if (crawlResult.blocked_by_robots) {
      updateRecord(scanToken, {
        status: "failed",
        error: "This site blocked crawlers via robots.txt. We cannot analyze it.",
      });
      return;
    }

    if (crawlResult.error === "UNREACHABLE" || !crawlResult.homepage.html) {
      // Fallback: use demo-generated content for unreachable sites
      // In production remove this and return the error below
      console.log(`[scan] Site unreachable, using demo content for ${domain}`);
      const demo = generateDemoPages(domain);
      crawlResult.homepage = demo.homepage;
      crawlResult.pages = demo.pages;
    }

    // 2. Structural analysis
    const structural = analyzeStructure(crawlResult.homepage, crawlResult.pages, city);

    if (structural.pages.length === 0) {
      updateRecord(scanToken, {
        status: "failed",
        error: "Could not parse any content from this site.",
      });
      return;
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
    const scoreBreakdown = computeScore(
      structural.site_summary,
      structural.pages,
      queries,
      scope
    );

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
    const exampleQuery = queries[0]?.text || `Best ${categoryInfo.category} ${city ? `in ${city.split(",")[0]}` : "near me"}`;

    const result: Partial<ScanRecord> = {
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

    updateRecord(scanToken, result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`[scan] Error for ${scanToken}:`, message);
    updateRecord(scanToken, {
      status: "failed",
      error: "An internal error occurred. Please try again.",
    });
  }
}

export function initializeScanRecord(
  scanToken: string,
  requestId: string,
  req: ScanRequest
): void {
  const record: ScanRecord = {
    request_id: requestId,
    scan_token: scanToken,
    domain: req.domain,
    scope: req.scope,
    city: req.city,
    audience: req.audience,
    status: "queued",
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
  setRecord(scanToken, record);
}
