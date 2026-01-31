/**
 * Unit Tests for Schema Generation
 * 
 * Testing Schema.org JSON-LD generators to ensure:
 * - Valid Schema.org structure
 * - Required fields present
 * - Correct data types
 * - No errors in production
 */

import { describe, it, expect } from 'vitest';
import {
  generateOrganizationSchema,
  generateSoftwareApplicationSchema,
  generateFAQPageSchema,
  generateBreadcrumbSchema,
  DEFAULT_FAQS,
  type FAQItem,
  type BreadcrumbItem,
} from '../generateSchema';

describe('generateOrganizationSchema', () => {
  it('should generate valid Organization schema', () => {
    const schema = generateOrganizationSchema();

    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('Organization');
    expect(schema.name).toBe('StackAudit');
    expect(schema.url).toBeDefined();
  });

  it('should include logo', () => {
    const schema = generateOrganizationSchema();

    expect(schema.logo).toBeDefined();
    expect(schema.logo).toContain('/logo.png');
  });

  it('should include social media links', () => {
    const schema = generateOrganizationSchema() as any;

    expect(schema.sameAs).toBeInstanceOf(Array);
    expect(schema.sameAs.length).toBeGreaterThan(0);
    expect(schema.sameAs).toContain('https://twitter.com/stackaudit_ai');
    expect(schema.sameAs).toContain('https://github.com/stackaudit');
  });

  it('should include contact point', () => {
    const schema = generateOrganizationSchema() as any;

    expect(schema.contactPoint).toBeDefined();
    expect(schema.contactPoint['@type']).toBe('ContactPoint');
    expect(schema.contactPoint.contactType).toBe('Customer Support');
    expect(schema.contactPoint.email).toBe('support@stackaudit.ai');
  });
});

describe('generateSoftwareApplicationSchema', () => {
  it('should generate valid SoftwareApplication schema', () => {
    const schema = generateSoftwareApplicationSchema();

    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('SoftwareApplication');
    expect(schema.name).toBe('StackAudit');
    expect(schema.applicationCategory).toBe('DeveloperApplication');
  });

  it('should include description and features', () => {
    const schema = generateSoftwareApplicationSchema() as any;

    expect(schema.description).toBeDefined();
    expect(schema.description.length).toBeGreaterThan(50);
    expect(schema.featureList).toBeInstanceOf(Array);
    expect(schema.featureList.length).toBe(7);
  });

  it('should include pricing with free tier', () => {
    const schema = generateSoftwareApplicationSchema() as any;

    expect(schema.offers).toBeDefined();
    expect(schema.offers['@type']).toBe('Offer');
    expect(schema.offers.price).toBe('0');
    expect(schema.offers.priceCurrency).toBe('USD');
  });

  it('should specify operating system', () => {
    const schema = generateSoftwareApplicationSchema();

    expect(schema.operatingSystem).toBeDefined();
    expect(schema.operatingSystem).toContain('Web Browser');
  });

  it('should include author organization', () => {
    const schema = generateSoftwareApplicationSchema() as any;

    expect(schema.author).toBeDefined();
    expect(schema.author['@type']).toBe('Organization');
    expect(schema.author.name).toBe('StackAudit');
  });
});

describe('generateFAQPageSchema', () => {
  it('should generate valid FAQPage schema', () => {
    const faqs: FAQItem[] = [
      { question: 'Test question?', answer: 'Test answer' },
    ];
    const schema = generateFAQPageSchema(faqs);

    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('FAQPage');
  });

  it('should include main entity with questions', () => {
    const faqs: FAQItem[] = [
      { question: 'Question 1?', answer: 'Answer 1' },
      { question: 'Question 2?', answer: 'Answer 2' },
    ];
    const schema = generateFAQPageSchema(faqs) as any;

    expect(schema.mainEntity).toBeInstanceOf(Array);
    expect(schema.mainEntity.length).toBe(2);
  });

  it('should have properly structured Question entities', () => {
    const faqs: FAQItem[] = [
      { question: 'Test question?', answer: 'Test answer' },
    ];
    const schema = generateFAQPageSchema(faqs) as any;

    schema.mainEntity.forEach((question: any) => {
      expect(question['@type']).toBe('Question');
      expect(question.name).toBeDefined();
      expect(question.name.length).toBeGreaterThan(0);
      expect(question.acceptedAnswer).toBeDefined();
    });
  });

  it('should have properly structured Answer entities', () => {
    const faqs: FAQItem[] = [
      { question: 'Test question?', answer: 'Test answer' },
    ];
    const schema = generateFAQPageSchema(faqs) as any;

    schema.mainEntity.forEach((question: any) => {
      expect(question.acceptedAnswer['@type']).toBe('Answer');
      expect(question.acceptedAnswer.text).toBeDefined();
      expect(question.acceptedAnswer.text.length).toBeGreaterThan(0);
    });
  });

  it('should handle empty FAQ array', () => {
    const schema = generateFAQPageSchema([]) as any;

    expect(schema.mainEntity).toBeInstanceOf(Array);
    expect(schema.mainEntity.length).toBe(0);
  });
});

describe('generateBreadcrumbSchema', () => {
  it('should generate valid BreadcrumbList schema', () => {
    const breadcrumbs: BreadcrumbItem[] = [
      { name: 'Home', url: 'https://stackaudit.ai' },
      { name: 'Products', url: 'https://stackaudit.ai/products' },
    ];

    const schema = generateBreadcrumbSchema(breadcrumbs);

    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('BreadcrumbList');
  });

  it('should create ListItem entries with correct positions', () => {
    const breadcrumbs: BreadcrumbItem[] = [
      { name: 'Home', url: 'https://stackaudit.ai' },
      { name: 'Docs', url: 'https://stackaudit.ai/docs' },
      { name: 'API', url: 'https://stackaudit.ai/docs/api' },
    ];

    const schema = generateBreadcrumbSchema(breadcrumbs) as any;

    expect(schema.itemListElement).toBeInstanceOf(Array);
    expect(schema.itemListElement.length).toBe(3);

    schema.itemListElement.forEach((item: any, index: number) => {
      expect(item['@type']).toBe('ListItem');
      expect(item.position).toBe(index + 1);
      expect(item.name).toBe(breadcrumbs[index].name);
      expect(item.item).toBe(breadcrumbs[index].url);
    });
  });

  it('should handle single breadcrumb', () => {
    const breadcrumbs: BreadcrumbItem[] = [
      { name: 'Home', url: 'https://stackaudit.ai' },
    ];
    const schema = generateBreadcrumbSchema(breadcrumbs) as any;

    expect(schema.itemListElement.length).toBe(1);
    expect(schema.itemListElement[0].position).toBe(1);
  });

  it('should handle empty breadcrumbs gracefully', () => {
    const schema = generateBreadcrumbSchema([]) as any;

    expect(schema.itemListElement).toBeInstanceOf(Array);
    expect(schema.itemListElement.length).toBe(0);
  });
});

describe('DEFAULT_FAQS', () => {
  it('should include key product questions', () => {
    const questions = DEFAULT_FAQS.map((faq) => faq.question);

    expect(questions).toContain('What is StackAudit?');
    expect(questions).toContain('How much does StackAudit cost?');
    expect(questions).toContain('What tech stacks does StackAudit support?');
  });

  it('should have 8 FAQ items', () => {
    expect(DEFAULT_FAQS.length).toBe(8);
  });

  it('all FAQs should have question and answer', () => {
    DEFAULT_FAQS.forEach((faq) => {
      expect(faq.question).toBeDefined();
      expect(faq.question.length).toBeGreaterThan(0);
      expect(faq.answer).toBeDefined();
      expect(faq.answer.length).toBeGreaterThan(0);
    });
  });
});

describe('Schema JSON validity', () => {
  it('all schemas should be valid JSON when stringified', () => {
    const schemas = [
      generateOrganizationSchema(),
      generateSoftwareApplicationSchema(),
      generateFAQPageSchema(DEFAULT_FAQS),
      generateBreadcrumbSchema([
        { name: 'Test', url: 'https://stackaudit.ai' },
      ]),
    ];

    schemas.forEach((schema) => {
      expect(() => JSON.stringify(schema)).not.toThrow();
      const json = JSON.stringify(schema);
      expect(() => JSON.parse(json)).not.toThrow();
    });
  });

  it('schemas should serialize without undefined values', () => {
    const schemas = [
      generateOrganizationSchema(),
      generateSoftwareApplicationSchema(),
      generateFAQPageSchema(DEFAULT_FAQS),
    ];

    schemas.forEach((schema) => {
      const json = JSON.stringify(schema);
      // After JSON.stringify, undefined values are removed
      expect(json).not.toContain('undefined');
    });
  });
});
