# Custom Hooks

This directory is for custom React hooks.

## Future Hooks to Add

- `useAudit` - Manage audit state and API calls
- `useForm` - Form validation and state management helper
- `useLocalStorage` - Persist audit progress locally
- `useDebounce` - Debounce user input for better UX

## Example Structure

```typescript
// src/hooks/useAudit.ts
import { useState } from 'react';
import { AuditFormData } from '../types';

export const useAudit = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const submitAudit = async (data: AuditFormData) => {
    setIsAnalyzing(true);
    // API call here
    setIsAnalyzing(false);
  };

  return { isAnalyzing, result, submitAudit };
};
```
