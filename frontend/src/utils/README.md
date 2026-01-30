# Utility Functions

This directory is for pure utility functions and helpers.

## Future Utils to Add

- `formatCurrency` - Format dollar amounts consistently
- `validateForm` - Form validation logic
- `api` - API client wrapper
- `analytics` - Track user events
- `calculations` - Tool overlap and savings calculations

## Example Structure

```typescript
// src/utils/formatCurrency.ts
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

// src/utils/api.ts
export const api = {
  async submitAudit(data: AuditFormData) {
    const response = await fetch('/api/audits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};
```
