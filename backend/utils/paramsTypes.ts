import { isBoolean, isDate, isInt } from 'validator';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const check_content_type = (available: any[], type: string) => {
  if (!available) return false;
  switch (type) {
    case 'string':
      return available.every(
        (content) => (typeof content).toLowerCase() === 'string'
      );
    case 'integer':
      return available.every((content) => isInt(content));
    case 'number':
      return available.every((content) => isFinite(content));
    case 'boolean':
      return available.every(
        (content) => content === false || content === true || isBoolean(content)
      );
    case 'date':
      return available.every((content) => isDate(content));
    default:
      return false;
  }
};

export default {
  STRING: 'string',
  INTEGER: 'integer',
  NUMBER: 'number',
  BOOL: 'boolean',
  DATE: 'date',
  ALL: ['string', 'integer', 'number', 'boolean', 'date'],
};
