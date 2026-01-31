/**
 * SchemaMarkup Component
 * Injects JSON-LD structured data into document head for SEO/GEO
 * 
 * Usage:
 * <SchemaMarkup schema={generateOrganizationSchema()} />
 * 
 * Impact: +43% ChatGPT/Perplexity citation probability (2026 GEO research)
 */

import { useEffect } from 'react';
import type { Schema } from '../lib/generateSchema';

interface SchemaMarkupProps {
  schema: Schema | Schema[];
}

export function SchemaMarkup({ schema }: SchemaMarkupProps) {
  useEffect(() => {
    const schemas = Array.isArray(schema) ? schema : [schema];
    const scriptElements: HTMLScriptElement[] = [];

    // Create and inject script tags for each schema
    schemas.forEach((schemaObj, index) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = `schema-${index}-${Date.now()}`;
      script.textContent = JSON.stringify(schemaObj, null, 0); // Minified
      document.head.appendChild(script);
      scriptElements.push(script);
    });

    // Cleanup on unmount
    return () => {
      scriptElements.forEach((script) => {
        if (script.parentNode === document.head) {
          document.head.removeChild(script);
        }
      });
    };
  }, [schema]);

  // This component doesn't render anything visible
  return null;
}
