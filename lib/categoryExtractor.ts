/**
 * Category & Persona extractor.
 * Uses Anthropic Claude API with deterministic prompts.
 * Falls back to heuristic rules if API unavailable.
 */
import Anthropic from "@anthropic-ai/sdk";
import { CategoryInfo, PageData } from "./types";

const BUSINESS_CATEGORIES = [
  "e-commerce", "SaaS", "AI/ML tools", "marketing agency", "consulting firm",
  "healthcare provider", "legal services", "financial services", "real estate",
  "restaurant / food service", "retail store", "home services", "education",
  "fitness / wellness", "travel / hospitality", "logistics / shipping",
  "construction / contracting", "accounting / tax", "IT services / MSP",
  "recruitment / HR", "photography / creative", "event planning", "nonprofit",
  "manufacturing", "automotive", "dental / medical practice", "insurance", "other"
];

function heuristicCategory(text: string): string {
  const lower = text.toLowerCase();
  // Food & hospitality
  if (lower.match(/\b(bakery|bakeries|bread|pastry|cake|cupcake)\b/)) return "bakery";
  if (lower.match(/restaurant|cafe|food|menu|dining|pizza|sushi|burger|bistro/)) return "restaurant / food service";
  if (lower.match(/hotel|travel|vacation|booking|hospitality|airbnb|resort/)) return "travel / hospitality";
  // Health
  if (lower.match(/dental|dentist|orthodon/)) return "dental / medical practice";
  if (lower.match(/doctor|clinic|medical|hospital|therapy|therapist|chiro/)) return "healthcare provider";
  if (lower.match(/fitness|gym|yoga|wellness|personal train/)) return "fitness / wellness";
  // Professional
  if (lower.match(/lawyer|attorney|legal|law firm/)) return "legal services";
  if (lower.match(/accounting|tax|cpa|bookkeep/)) return "accounting / tax";
  if (lower.match(/recruit|hiring|staffing|talent|\bhr\b/)) return "recruitment / HR";
  // Real estate & home
  if (lower.match(/real estate|realty|homes for sale|property|realtor/)) return "real estate";
  if (lower.match(/plumb|electric|hvac|roofing|contractor|home service|handyman/)) return "home services";
  if (lower.match(/insurance|coverage|policy/)) return "insurance";
  // Tech
  if (lower.match(/\bai\b|machine learning|nlp|llm|gpt|artificial intelligence/)) return "AI/ML tools";
  if (lower.match(/saas|software|platform|\bapp\b|api|cloud/)) return "SaaS";
  if (lower.match(/marketing|seo|ads|campaign|social media/)) return "marketing agency";
  // Commerce
  if (lower.match(/ecommerce|e-commerce|shop|store|buy|checkout|cart/)) return "e-commerce";
  if (lower.match(/school|university|course|learn|tutor|education/)) return "education";
  if (lower.match(/consult|advisory|strategy|management/)) return "consulting firm";
  if (lower.match(/automotive|car|auto|vehicle|mechanic/)) return "automotive";
  if (lower.match(/photo|photography|videograph|creative|design/)) return "photography / creative";
  return "professional services";
}

function heuristicCategoryFromDomain(domain: string): string | null {
  const d = domain.toLowerCase().replace(/\.(com|net|org|io|ai|co|biz).*/, "");
  // Substring-based matching (no word boundaries needed for compound domain names)
  if (/bakery|bakeries|bread|pastry/.test(d)) return "bakery";
  if (/restaurant|cafe|diner|bistro|pizza|sushi|burger|eatery/.test(d)) return "restaurant / food service";
  if (/dental|dentist|orthodon/.test(d)) return "dental / medical practice";
  if (/fitness|gym|yoga|wellness/.test(d)) return "fitness / wellness";
  if (/lawyer|attorney|legal|lawfirm/.test(d)) return "legal services";
  if (/accounting|taxprep|bookkeep|cpa/.test(d)) return "accounting / tax";
  if (/realty|realtor|realestate|homes4sale/.test(d)) return "real estate";
  if (/plumbing|hvac|roofing|handyman/.test(d)) return "home services";
  if (/hotel|resort|travel|vacation/.test(d)) return "travel / hospitality";
  if (/school|academy|tutor|elearning/.test(d)) return "education";
  if (/autorepair|mechanic|autoshop/.test(d)) return "automotive";
  if (/marketing|seoagency/.test(d)) return "marketing agency";
  if (/recruit|staffing|talen/.test(d)) return "recruitment / HR";
  // Fall through to content analysis via the main heuristic
  return null;
}

function heuristicPersona(category: string, audience: string): CategoryInfo["persona"] {
  const personaMap: Record<string, CategoryInfo["persona"]> = {
    "SaaS": { title: "Product Manager / Operations Lead", goal: "Streamline workflows and reduce operational friction", pain_points: ["tool fragmentation", "lack of visibility", "manual processes"] },
    "AI/ML tools": { title: "Innovation Lead / Product Manager", goal: "Reduce decision ambiguity and document decision rationale", pain_points: ["lack of reproducible rationale", "fragmented team decisions"] },
    "marketing agency": { title: "Marketing Director / CMO", goal: "Maximize ROI on marketing spend and prove attribution", pain_points: ["rising ad costs", "attribution complexity", "agency trust"] },
    "real estate": { title: "Home Buyer / Seller", goal: "Find the right property or sell quickly at best price", pain_points: ["market uncertainty", "agent trust", "process complexity"] },
    "restaurant / food service": { title: "Local Customer", goal: "Find a great meal nearby quickly and easily", pain_points: ["too many options", "reliability concerns", "parking/convenience"] },
    "bakery": { title: "Local Customer", goal: "Find fresh, quality baked goods nearby", pain_points: ["freshness concerns", "limited hours", "finding the right specialty items"] },
    "dental / medical practice": { title: "Patient / Caregiver", goal: "Find trusted care nearby, book quickly", pain_points: ["insurance complexity", "wait times", "trust"] },
    "healthcare provider": { title: "Patient / Caregiver", goal: "Get reliable medical care without long waits", pain_points: ["finding available providers", "insurance coverage", "appointment availability"] },
    "legal services": { title: "Individual or Business Owner", goal: "Get expert legal help without overpaying", pain_points: ["high costs", "complexity", "finding trustworthy counsel"] },
    "home services": { title: "Homeowner", goal: "Fix the problem fast with a reliable pro", pain_points: ["finding reliable contractors", "pricing uncertainty", "scheduling"] },
    "fitness / wellness": { title: "Health-Conscious Consumer", goal: "Find quality fitness or wellness services nearby", pain_points: ["membership costs", "schedule flexibility", "finding the right fit"] },
    "accounting / tax": { title: "Small Business Owner / Individual", goal: "Minimize tax burden and stay compliant", pain_points: ["regulatory complexity", "finding trustworthy accountants", "cost"] },
    "automotive": { title: "Vehicle Owner", goal: "Keep their car running reliably at fair prices", pain_points: ["finding honest mechanics", "unexpected costs", "wait times"] },
  };
  return personaMap[category] || {
    title: audience === "businesses" ? "Business Owner / Decision Maker" : "Consumer / Buyer",
    goal: "Find the best solution for their specific need quickly",
    pain_points: ["too many options", "lack of trust signals", "unclear pricing"],
  };
}

export async function extractCategoryAndPersona(
  pages: PageData[],
  audience: string,
  domain: string
): Promise<CategoryInfo> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  // Use top 2 pages for context
  const textSample = pages
    .slice(0, 2)
    .map((p) => `URL: ${p.url}\nTitle: ${p.title}\nH1: ${p.h1}\nContent: ${p.raw_text.slice(0, 1500)}`)
    .join("\n\n---\n\n");

  // Fallback first if no API key
  if (!apiKey) {
    const domainCategory = heuristicCategoryFromDomain(domain);
    const contentCategory = heuristicCategory(textSample);
    // Prefer domain-derived if different from default
    const hCategory = (domainCategory && domainCategory !== "professional services")
      ? domainCategory
      : contentCategory;
    return {
      category: hCategory,
      short_description: `${domain} provides ${hCategory} services.`,
      persona: heuristicPersona(hCategory, audience),
    };
  }

  try {
    const client = new Anthropic({ apiKey });

    const prompt = `Given the following website content from "${domain}", produce a structured analysis.

Website content:
${textSample}

Return ONLY valid JSON (no markdown, no explanation) in exactly this format:
{
  "category": "<business category in 3-5 words>",
  "short_description": "<one sentence describing what this business does>",
  "persona": {
    "title": "<primary buyer/user role title>",
    "goal": "<their primary goal in 1 sentence>",
    "pain_points": ["<pain point 1>", "<pain point 2>", "<pain point 3>"]
  }
}`;

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      temperature: 0.1,
      messages: [{ role: "user", content: prompt }],
    });

    const responseText = message.content[0].type === "text" ? message.content[0].text : "";
    const jsonMatch = responseText.match(/\{[\s\S]+\}/);
    if (!jsonMatch) throw new Error("No JSON in response");

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      category: parsed.category || heuristicCategory(textSample),
      short_description: parsed.short_description || `${domain} provides professional services.`,
      persona: {
        title: parsed.persona?.title || "Business Owner",
        goal: parsed.persona?.goal || "Achieve their business objectives",
        pain_points: parsed.persona?.pain_points || ["time constraints", "budget limits", "finding solutions"],
      },
    };
  } catch {
    // Fall back to heuristic
    const hCategory = heuristicCategory(textSample);
    return {
      category: hCategory,
      short_description: `${domain} provides ${hCategory} services.`,
      persona: heuristicPersona(hCategory, audience),
    };
  }
}
