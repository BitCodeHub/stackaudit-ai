/**
 * Schema.org markup generation utilities
 * Purpose: Generate structured data for SEO and GEO (Generative Engine Optimization)
 * Impact: +43% citation probability in ChatGPT/Perplexity (2026 GEO research)
 */

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://stackaudit.ai';
const LOGO_URL = `${SITE_URL}/logo.png`;

export interface Schema {
  '@context': string;
  '@type': string;
  [key: string]: unknown;
}

/**
 * Organization Schema - Homepage only
 * Establishes StackAudit as a recognized entity
 */
export function generateOrganizationSchema(): Schema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'StackAudit',
    alternateName: 'StackAudit.ai',
    url: SITE_URL,
    logo: LOGO_URL,
    description:
      'Instant tech stack audits that CFOs and CTOs actually understand. Transform technical complexity into clear business insights.',
    foundingDate: '2026-02-07',
    founders: [
      {
        '@type': 'Person',
        name: 'Jimmy Collins',
        jobTitle: 'Founder',
      },
    ],
    sameAs: [
      'https://twitter.com/stackaudit_ai',
      'https://github.com/stackaudit',
      'https://www.linkedin.com/company/stackaudit',
      'https://www.producthunt.com/products/stackaudit',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      email: 'support@stackaudit.ai',
      availableLanguage: 'English',
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'US',
    },
  };
}

/**
 * SoftwareApplication Schema - Product pages
 * Defines StackAudit as a software product
 */
export function generateSoftwareApplicationSchema(): Schema {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'StackAudit',
    applicationCategory: 'DeveloperApplication',
    applicationSubCategory: 'Code Analysis Tool',
    operatingSystem: 'Web Browser, macOS, Windows, Linux',
    description:
      'Instant tech stack audits that CFOs and CTOs actually understand. Analyze any GitHub repository and get business-focused insights in seconds.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      priceValidUntil: '2026-12-31',
      availability: 'https://schema.org/InStock',
      category: 'Free Tier',
    },
    screenshot: `${SITE_URL}/images/dashboard-screenshot.png`,
    featureList: [
      'Instant GitHub repository analysis',
      'CFO-friendly business impact reports',
      'CTO-level technical summaries',
      'Tech debt identification and cost estimation',
      'Security vulnerability scoring',
      'Dependency health tracking',
      'Automated PDF report generation',
    ],
    softwareVersion: '1.0.0',
    releaseNotes: `${SITE_URL}/changelog`,
    author: {
      '@type': 'Organization',
      name: 'StackAudit',
    },
    downloadUrl: `${SITE_URL}/dashboard`,
    installUrl: `${SITE_URL}/get-started`,
  };
}

/**
 * BreadcrumbList Schema - All pages except homepage
 * Helps search engines understand site structure
 */
export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]): Schema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * FAQPage Schema - Help/FAQ pages
 * Enables FAQ rich snippets in Google
 */
export interface FAQItem {
  question: string;
  answer: string;
}

export function generateFAQPageSchema(faqs: FAQItem[]): Schema {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Pricing tier offer schemas
 */
export function generatePricingOfferSchemas() {
  return [
    {
      '@type': 'Offer',
      name: 'Free Tier',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      description: 'Perfect for trying StackAudit',
    },
    {
      '@type': 'Offer',
      name: 'Starter Plan',
      price: '29',
      priceCurrency: 'USD',
      billingIncrement: 'P1M',
      availability: 'https://schema.org/InStock',
      description: 'For growing teams',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '29',
        priceCurrency: 'USD',
        billingIncrement: 'P1M',
      },
    },
    {
      '@type': 'Offer',
      name: 'Pro Plan',
      price: '99',
      priceCurrency: 'USD',
      billingIncrement: 'P1M',
      availability: 'https://schema.org/InStock',
      description: 'For enterprises',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '99',
        priceCurrency: 'USD',
        billingIncrement: 'P1M',
      },
    },
  ];
}

/**
 * Default FAQ items for StackAudit
 */
export const DEFAULT_FAQS: FAQItem[] = [
  {
    question: 'What is StackAudit?',
    answer:
      'StackAudit is a tech stack analysis tool that transforms complex technical data into clear business insights. It analyzes GitHub repositories and generates reports that CFOs and CTOs can actually understand.',
  },
  {
    question: 'How much does StackAudit cost?',
    answer:
      'StackAudit offers a free tier for basic audits, a Starter plan at $29/month for growing teams, and a Pro plan at $99/month for enterprises. All plans include instant GitHub analysis and PDF report generation.',
  },
  {
    question: 'What tech stacks does StackAudit support?',
    answer:
      'StackAudit supports all major programming languages and frameworks including JavaScript, Python, Java, Ruby, Go, Rust, React, Vue, Angular, Django, Rails, and 100+ more. If it\'s on GitHub, we can audit it.',
  },
  {
    question: 'How long does an audit take?',
    answer:
      'Most audits complete in under 60 seconds. Complex repositories may take up to 2-3 minutes. You\'ll receive instant results with a downloadable PDF report.',
  },
  {
    question: 'Is my code secure with StackAudit?',
    answer:
      'Yes. StackAudit only analyzes public repositories or repositories you grant access to via GitHub OAuth. We never store your source code. Analysis happens in secure, isolated environments.',
  },
  {
    question: 'Can I share audit results with my team?',
    answer:
      'Absolutely! Every audit generates a professional PDF report you can share with stakeholders. Pro plan users get advanced collaboration features including team workspaces and multi-user access.',
  },
  {
    question: 'What makes StackAudit different from other code analysis tools?',
    answer:
      'StackAudit translates technical complexity into business language. Instead of just listing dependencies, we tell you what they cost in maintenance hours, security risk, and technical debt dollars. Perfect for board presentations and investor updates.',
  },
  {
    question: 'Do you support private repositories?',
    answer:
      'Yes! Connect your GitHub account via OAuth and audit any private repository you have access to. We use industry-standard security practices and never store your source code.',
  },
];
