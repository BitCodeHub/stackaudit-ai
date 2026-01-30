/**
 * Validation utilities
 */

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

export const isPositiveNumber = (value: any): boolean => {
  return typeof value === 'number' && value > 0;
};

export const isValidTier = (tier: string): boolean => {
  return ['free', 'paid'].includes(tier);
};

export const isValidStatus = (status: string): boolean => {
  return ['draft', 'analyzing', 'complete', 'failed'].includes(status);
};
