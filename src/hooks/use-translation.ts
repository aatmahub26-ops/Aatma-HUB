
"use client";

import { useAuth } from "@/context/AuthContext";
import translations from "@/lib/i18n/translations.json";
import { type LanguageCode } from "@/lib/i18n/languages";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function useTranslation() {
  const { user, profile } = useAuth();
  const [lang, setLang] = useState<LanguageCode>('en');

  useEffect(() => {
    // 1. Initial source of truth: LocalStorage (Instant response)
    const saved = localStorage.getItem('aatma_lang');
    if (saved) setLang(saved as LanguageCode);

    // 2. Real-time sync with User Preferences if logged in
    if (user) {
      const unsub = onSnapshot(doc(db, "user_preferences", user.uid), (prefDoc) => {
        if (prefDoc.exists() && prefDoc.data().language) {
          const cloudLang = prefDoc.data().language as LanguageCode;
          setLang(cloudLang);
          localStorage.setItem('aatma_lang', cloudLang);
        } else if (profile?.preferredLanguage) {
          // Fallback to legacy profile field if exists
          setLang(profile.preferredLanguage as LanguageCode);
        }
      }, (error) => {
        // Silent fail for translations hook to avoid blocking UI
        console.warn("Preference sync restricted:", error.message);
      });
      return () => unsub();
    }
  }, [user, profile]);

  const t = (key: keyof typeof translations.en) => {
    const dict = (translations as any)[lang] || translations.en;
    return dict[key] || translations.en[key] || key;
  };

  return { t, lang };
}
