
export type LanguageCode = 
  | 'en' | 'hi' | 'bn' | 'ta' | 'te' | 'mr' | 'gu' | 'kn' 
  | 'ml' | 'pa' | 'ur' | 'id' | 'tl' | 'th' | 'vi' 
  | 'ar' | 'es' | 'fr' | 'de' | 'pt' | 'ru';

export interface Language {
  code: LanguageCode;
  label: string;
  native: string;
  flag: string;
}

export const LANGUAGES: Language[] = [
  { code: 'en', label: 'English', native: 'English', flag: '🇺🇸' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা', flag: '🇧🇩' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
  { code: 'mr', label: 'Marathi', native: 'मराठी', flag: '🇮🇳' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം', flag: '🇮🇳' },
  { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'ur', label: 'Urdu', native: 'اردू', flag: '🇵🇰' },
  { code: 'id', label: 'Indonesian', native: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'tl', label: 'Filipino', native: 'Tagalog', flag: '🇵🇭' },
  { code: 'th', label: 'Thai', native: 'ไทย', flag: '🇹🇭' },
  { code: 'vi', label: 'Vietnamese', native: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'ar', label: 'Arabic', native: 'العربية', flag: '🇸🇦' },
  { code: 'es', label: 'Spanish', native: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'French', native: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'German', native: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', label: 'Portuguese', native: 'Português', flag: '🇵🇹' },
  { code: 'ru', label: 'Russian', native: 'Русский', flag: '🇷🇺' },
];
