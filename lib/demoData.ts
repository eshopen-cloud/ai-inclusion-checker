/**
 * Demo mode — generates realistic-looking site content for any domain.
 * Used when real crawling isn't available (dev/demo environments).
 */
import { FetchedPage } from "./crawler";

export function generateDemoPages(domain: string): { homepage: FetchedPage; pages: FetchedPage[] } {
  const name = domain.split(".")[0].replace(/-/g, " ");
  const capitalized = name.charAt(0).toUpperCase() + name.slice(1);

  const homepageHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>${capitalized} - Professional Services</title>
  <meta name="description" content="${capitalized} provides professional services to businesses and consumers.">
</head>
<body>
  <h1>${capitalized}: Professional Solutions for Modern Businesses</h1>
  <p>Welcome to ${capitalized}. We help businesses grow and succeed with our comprehensive range of services.</p>
  <p>Our team of experts is dedicated to delivering results that matter to your bottom line.</p>
  <nav>
    <a href="/about">About</a>
    <a href="/services">Services</a>
    <a href="/pricing">Pricing</a>
  </nav>
</body>
</html>`;

  const servicesHtml = `
<!DOCTYPE html>
<html>
<head><title>Our Services - ${capitalized}</title></head>
<body>
  <h1>Our Services</h1>
  <p>We offer a range of professional services tailored to your needs.</p>
  <h2>Core Solutions</h2>
  <p>Our core solutions help businesses automate and streamline their operations.</p>
  <h2>Consulting</h2>
  <p>Expert consulting services for strategy, implementation, and growth.</p>
  <h2>Support</h2>
  <p>Dedicated support to ensure your success at every stage.</p>
</body>
</html>`;

  return {
    homepage: { url: `https://${domain}`, html: homepageHtml, status: 200 },
    pages: [
      { url: `https://${domain}/services`, html: servicesHtml, status: 200 },
    ],
  };
}
