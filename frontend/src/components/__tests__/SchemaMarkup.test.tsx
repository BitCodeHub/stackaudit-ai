/**
 * SchemaMarkup Component Tests
 * 
 * Tests schema injection, cleanup, and edge cases
 * Coverage: Single/multiple schemas, DOM manipulation, re-rendering
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { SchemaMarkup } from '../SchemaMarkup';
import type { Schema } from '../../lib/generateSchema';

describe('SchemaMarkup Component', () => {
  beforeEach(() => {
    // Clear any existing schema scripts before each test
    const existingScripts = document.head.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach((script) => script.remove());
  });

  afterEach(() => {
    cleanup();
  });

  describe('Single Schema Injection', () => {
    it('should inject a single schema into document head', () => {
      const schema: Schema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Test Company',
      };

      render(<SchemaMarkup schema={schema} />);

      const scriptTag = document.head.querySelector('script[type="application/ld+json"]');
      expect(scriptTag).toBeDefined();
      expect(scriptTag).not.toBeNull();
    });

    it('should contain valid JSON content', () => {
      const schema: Schema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Test Company',
        url: 'https://test.com',
      };

      render(<SchemaMarkup schema={schema} />);

      const scriptTag = document.head.querySelector('script[type="application/ld+json"]');
      const jsonContent = scriptTag?.textContent;
      
      expect(jsonContent).toBeDefined();
      
      // Should be valid JSON
      const parsed = JSON.parse(jsonContent!);
      expect(parsed['@context']).toBe('https://schema.org');
      expect(parsed['@type']).toBe('Organization');
      expect(parsed.name).toBe('Test Company');
      expect(parsed.url).toBe('https://test.com');
    });

    it('should have correct script type attribute', () => {
      const schema: Schema = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
      };

      render(<SchemaMarkup schema={schema} />);

      const scriptTag = document.head.querySelector('script[type="application/ld+json"]');
      expect(scriptTag?.getAttribute('type')).toBe('application/ld+json');
    });

    it('should have unique ID for script tag', () => {
      const schema: Schema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
      };

      render(<SchemaMarkup schema={schema} />);

      const scriptTag = document.head.querySelector('script[type="application/ld+json"]');
      const id = scriptTag?.getAttribute('id');
      
      expect(id).toBeDefined();
      expect(id).toMatch(/^schema-0-\d+$/);
    });
  });

  describe('Multiple Schemas Injection', () => {
    it('should inject multiple schemas when given an array', () => {
      const schemas: Schema[] = [
        {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Company A',
        },
        {
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'App B',
        },
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
        },
      ];

      render(<SchemaMarkup schema={schemas} />);

      const scriptTags = document.head.querySelectorAll('script[type="application/ld+json"]');
      expect(scriptTags.length).toBe(3);
    });

    it('should inject schemas with correct content', () => {
      const schemas: Schema[] = [
        {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Test Org',
        },
        {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: 'Test Product',
        },
      ];

      render(<SchemaMarkup schema={schemas} />);

      const scriptTags = document.head.querySelectorAll('script[type="application/ld+json"]');
      
      const firstSchema = JSON.parse(scriptTags[0].textContent!);
      expect(firstSchema['@type']).toBe('Organization');
      expect(firstSchema.name).toBe('Test Org');

      const secondSchema = JSON.parse(scriptTags[1].textContent!);
      expect(secondSchema['@type']).toBe('Product');
      expect(secondSchema.name).toBe('Test Product');
    });

    it('should give each schema a unique ID', () => {
      const schemas: Schema[] = [
        { '@context': 'https://schema.org', '@type': 'Organization' },
        { '@context': 'https://schema.org', '@type': 'Product' },
        { '@context': 'https://schema.org', '@type': 'FAQPage' },
      ];

      render(<SchemaMarkup schema={schemas} />);

      const scriptTags = document.head.querySelectorAll('script[type="application/ld+json"]');
      const ids = Array.from(scriptTags).map((tag) => tag.getAttribute('id'));
      
      // All IDs should be defined
      expect(ids.every((id) => id !== null)).toBe(true);
      
      // All IDs should be unique
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(3);
    });
  });

  describe('Cleanup on Unmount', () => {
    it('should remove schema from DOM when component unmounts', () => {
      const schema: Schema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Test',
      };

      const { unmount } = render(<SchemaMarkup schema={schema} />);

      // Verify script is present
      let scriptTag = document.head.querySelector('script[type="application/ld+json"]');
      expect(scriptTag).toBeDefined();

      // Unmount component
      unmount();

      // Verify script is removed
      scriptTag = document.head.querySelector('script[type="application/ld+json"]');
      expect(scriptTag).toBeNull();
    });

    it('should remove all schemas from DOM when component unmounts', () => {
      const schemas: Schema[] = [
        { '@context': 'https://schema.org', '@type': 'Organization' },
        { '@context': 'https://schema.org', '@type': 'Product' },
        { '@context': 'https://schema.org', '@type': 'FAQPage' },
      ];

      const { unmount } = render(<SchemaMarkup schema={schemas} />);

      // Verify all 3 scripts are present
      let scriptTags = document.head.querySelectorAll('script[type="application/ld+json"]');
      expect(scriptTags.length).toBe(3);

      // Unmount component
      unmount();

      // Verify all scripts are removed
      scriptTags = document.head.querySelectorAll('script[type="application/ld+json"]');
      expect(scriptTags.length).toBe(0);
    });

    it('should only remove its own schemas, not others', () => {
      // Create a manual script that shouldn't be removed
      const manualScript = document.createElement('script');
      manualScript.type = 'application/ld+json';
      manualScript.id = 'manual-schema';
      manualScript.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
      });
      document.head.appendChild(manualScript);

      const schema: Schema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
      };

      const { unmount } = render(<SchemaMarkup schema={schema} />);

      // Should have 2 scripts (manual + component)
      let scriptTags = document.head.querySelectorAll('script[type="application/ld+json"]');
      expect(scriptTags.length).toBe(2);

      // Unmount component
      unmount();

      // Should have 1 script (manual only)
      scriptTags = document.head.querySelectorAll('script[type="application/ld+json"]');
      expect(scriptTags.length).toBe(1);
      expect(scriptTags[0].id).toBe('manual-schema');

      // Clean up manual script
      manualScript.remove();
    });
  });

  describe('Re-rendering Behavior', () => {
    it('should update schema when prop changes', () => {
      const schema1: Schema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Company A',
      };

      const schema2: Schema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Company B',
      };

      const { rerender } = render(<SchemaMarkup schema={schema1} />);

      // Check initial schema
      let scriptTag = document.head.querySelector('script[type="application/ld+json"]');
      let content = JSON.parse(scriptTag!.textContent!);
      expect(content.name).toBe('Company A');

      // Update schema
      rerender(<SchemaMarkup schema={schema2} />);

      // Should have removed old schema and added new one
      const scriptTags = document.head.querySelectorAll('script[type="application/ld+json"]');
      expect(scriptTags.length).toBe(1);

      content = JSON.parse(scriptTags[0].textContent!);
      expect(content.name).toBe('Company B');
    });

    it('should handle changing from single to multiple schemas', () => {
      const singleSchema: Schema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
      };

      const multipleSchemas: Schema[] = [
        { '@context': 'https://schema.org', '@type': 'Organization' },
        { '@context': 'https://schema.org', '@type': 'Product' },
      ];

      const { rerender } = render(<SchemaMarkup schema={singleSchema} />);

      // Should have 1 script
      let scriptTags = document.head.querySelectorAll('script[type="application/ld+json"]');
      expect(scriptTags.length).toBe(1);

      // Update to multiple
      rerender(<SchemaMarkup schema={multipleSchemas} />);

      // Should have 2 scripts
      scriptTags = document.head.querySelectorAll('script[type="application/ld+json"]');
      expect(scriptTags.length).toBe(2);
    });

    it('should handle changing from multiple to single schema', () => {
      const multipleSchemas: Schema[] = [
        { '@context': 'https://schema.org', '@type': 'Organization' },
        { '@context': 'https://schema.org', '@type': 'Product' },
        { '@context': 'https://schema.org', '@type': 'FAQPage' },
      ];

      const singleSchema: Schema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
      };

      const { rerender } = render(<SchemaMarkup schema={multipleSchemas} />);

      // Should have 3 scripts
      let scriptTags = document.head.querySelectorAll('script[type="application/ld+json"]');
      expect(scriptTags.length).toBe(3);

      // Update to single
      rerender(<SchemaMarkup schema={singleSchema} />);

      // Should have 1 script
      scriptTags = document.head.querySelectorAll('script[type="application/ld+json"]');
      expect(scriptTags.length).toBe(1);
    });
  });

  describe('Component Rendering', () => {
    it('should not render any visible elements', () => {
      const schema: Schema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
      };

      const { container } = render(<SchemaMarkup schema={schema} />);

      // Container should be empty (component returns null)
      expect(container.firstChild).toBeNull();
    });

    it('should not add anything to the component tree', () => {
      const schema: Schema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
      };

      const { container } = render(<SchemaMarkup schema={schema} />);

      // Should have no children
      expect(container.children.length).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty schema object', () => {
      const schema: Schema = {};

      render(<SchemaMarkup schema={schema} />);

      const scriptTag = document.head.querySelector('script[type="application/ld+json"]');
      expect(scriptTag).toBeDefined();

      const content = JSON.parse(scriptTag!.textContent!);
      expect(Object.keys(content).length).toBe(0);
    });

    it('should handle empty array of schemas', () => {
      const schemas: Schema[] = [];

      render(<SchemaMarkup schema={schemas} />);

      const scriptTags = document.head.querySelectorAll('script[type="application/ld+json"]');
      expect(scriptTags.length).toBe(0);
    });

    it('should handle complex nested schema', () => {
      const schema: Schema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Test',
        address: {
          '@type': 'PostalAddress',
          streetAddress: '123 Test St',
          addressLocality: 'Test City',
          addressRegion: 'TC',
          postalCode: '12345',
        },
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+1-555-1234',
          contactType: 'Customer Support',
          email: 'support@test.com',
        },
      };

      render(<SchemaMarkup schema={schema} />);

      const scriptTag = document.head.querySelector('script[type="application/ld+json"]');
      const content = JSON.parse(scriptTag!.textContent!);

      expect(content.address).toBeDefined();
      expect(content.address['@type']).toBe('PostalAddress');
      expect(content.contactPoint).toBeDefined();
      expect(content.contactPoint.email).toBe('support@test.com');
    });

    it('should handle schema with arrays', () => {
      const schema: Schema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Question 1?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Answer 1',
            },
          },
          {
            '@type': 'Question',
            name: 'Question 2?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Answer 2',
            },
          },
        ],
      };

      render(<SchemaMarkup schema={schema} />);

      const scriptTag = document.head.querySelector('script[type="application/ld+json"]');
      const content = JSON.parse(scriptTag!.textContent!);

      expect(Array.isArray(content.mainEntity)).toBe(true);
      expect(content.mainEntity.length).toBe(2);
      expect(content.mainEntity[0].name).toBe('Question 1?');
    });
  });

  describe('JSON Formatting', () => {
    it('should output minified JSON (no whitespace)', () => {
      const schema: Schema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Test',
        url: 'https://test.com',
      };

      render(<SchemaMarkup schema={schema} />);

      const scriptTag = document.head.querySelector('script[type="application/ld+json"]');
      const content = scriptTag!.textContent!;

      // Minified JSON should not contain newlines or excessive spaces
      expect(content).not.toContain('\n');
      expect(content).not.toMatch(/  +/); // No multiple spaces
    });

    it('should produce valid Schema.org JSON-LD', () => {
      const schema: Schema = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'StackAudit',
        applicationCategory: 'DeveloperApplication',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
      };

      render(<SchemaMarkup schema={schema} />);

      const scriptTag = document.head.querySelector('script[type="application/ld+json"]');
      const content = JSON.parse(scriptTag!.textContent!);

      // Validate Schema.org requirements
      expect(content['@context']).toBe('https://schema.org');
      expect(content['@type']).toBe('SoftwareApplication');
      expect(content.offers).toBeDefined();
      expect(content.offers['@type']).toBe('Offer');
    });
  });
});
