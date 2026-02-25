/**
 * Intent Generator — creates 5 high-intent queries based on category, audience, location.
 * Deterministic, template-based.
 */
import { Audience, Query, ScanScope } from "./types";

const LOCAL_TEMPLATES = [
  { id: "local_best", template: "Best {category} in {city}", tokens: ["category", "city"] },
  { id: "local_near", template: "{category} near me", tokens: ["category"] },
  { id: "local_affordable", template: "Affordable {category} in {city}", tokens: ["category", "city"] },
  { id: "local_top", template: "Top {category} for {audience}", tokens: ["category", "audience"] },
  { id: "local_compare", template: "Compare {category} options in {city}", tokens: ["category", "city"] },
];

const NATIONAL_TEMPLATES = [
  { id: "nat_best", template: "Best {category} for small businesses", tokens: ["category"] },
  { id: "nat_startup", template: "{category} for growing teams", tokens: ["category"] },
  { id: "nat_compare", template: "Compare {category} tools", tokens: ["category"] },
  { id: "nat_pricing", template: "{category} pricing and plans", tokens: ["category"] },
  { id: "nat_how", template: "How does {category} help with {pain_point}", tokens: ["category", "pain_point"] },
];

const B2B_TEMPLATES = [
  { id: "b2b_best", template: "Best {category} for enterprise teams", tokens: ["category"] },
  { id: "b2b_top", template: "Top {category} platforms for businesses", tokens: ["category"] },
  { id: "b2b_compare", template: "Compare {category} solutions for B2B", tokens: ["category"] },
  { id: "b2b_roi", template: "ROI of {category} for companies", tokens: ["category"] },
  { id: "b2b_how", template: "How {category} improves team productivity", tokens: ["category"] },
];

const CONSUMER_TEMPLATES = [
  { id: "con_best", template: "Best {category} near me", tokens: ["category"] },
  { id: "con_top", template: "Top-rated {category}", tokens: ["category"] },
  { id: "con_affordable", template: "Affordable {category} options", tokens: ["category"] },
  { id: "con_review", template: "{category} reviews and recommendations", tokens: ["category"] },
  { id: "con_how", template: "How to choose the best {category}", tokens: ["category"] },
];

function fillTemplate(template: string, tokens: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(tokens)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, "g"), value);
  }
  return result;
}

function audienceLabel(audience: Audience): string {
  const map = { consumers: "consumers", businesses: "businesses", niche: "specialized users" };
  return map[audience];
}

export function generateQueries(
  category: string,
  scope: ScanScope,
  audience: Audience,
  city?: string,
  painPoint?: string
): Omit<Query, "supported" | "best_page" | "scores">[] {
  const audienceStr = audienceLabel(audience);
  const cityStr = city ? city.split(",")[0].trim() : "your area";
  const painStr = painPoint || "efficiency challenges";

  let templates;
  if (scope === "local") {
    templates = LOCAL_TEMPLATES;
  } else if (audience === "businesses") {
    templates = B2B_TEMPLATES;
  } else if (audience === "consumers") {
    templates = CONSUMER_TEMPLATES;
  } else {
    templates = NATIONAL_TEMPLATES;
  }

  return templates.map((t) => {
    const tokenValues: Record<string, string> = {
      category,
      city: cityStr,
      audience: audienceStr,
      pain_point: painStr,
    };
    const queryText = fillTemplate(t.template, tokenValues);
    return {
      id: t.id,
      text: queryText,
      template_used: t.template,
      tokens: tokenValues,
    };
  });
}
