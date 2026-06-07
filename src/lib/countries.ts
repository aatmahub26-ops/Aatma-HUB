
export type CountryCode = 'IN' | 'ID' | 'PH' | 'MY' | 'RU' | 'SG' | 'US' | 'GB';

export interface Country {
  code: CountryCode;
  name: string;
  flag: string;
  currency: string;
  suggestedLang: string;
}

export const COUNTRIES: Country[] = [
  { code: 'IN', name: 'India', flag: '🇮🇳', currency: 'INR', suggestedLang: 'hi' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', currency: 'IDR', suggestedLang: 'id' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', currency: 'PHP', suggestedLang: 'fil' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', currency: 'MYR', suggestedLang: 'en' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', currency: 'SGD', suggestedLang: 'en' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺', currency: 'RUB', suggestedLang: 'en' },
  { code: 'US', name: 'United States', flag: '🇺🇸', currency: 'USD', suggestedLang: 'en' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', suggestedLang: 'en' },
];
