
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COUNTRIES, type Country, type CountryCode } from '@/lib/countries';

export function useCountry() {
  const { user, profile } = useAuth();
  const [country, setCountry] = useState<Country | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function detectCountry() {
      // 1. Check profile first
      if (profile?.country) {
        const found = COUNTRIES.find(c => c.code === profile.country);
        if (found) {
          setCountry(found);
          setLoading(false);
          return;
        }
      }

      // 2. Check localStorage
      const saved = localStorage.getItem('aatma_country');
      if (saved) {
        const found = COUNTRIES.find(c => c.code === saved);
        if (found) {
          setCountry(found);
          setLoading(false);
          return;
        }
      }

      // 3. Detect via IP API
      try {
        const res = await fetch('https://ipapi.co/json/');
        if (!res.ok) throw new Error('IP detection failed');
        const data = await res.json();
        const detectedCode = data.country_code as CountryCode;
        const found = COUNTRIES.find(c => c.code === detectedCode) || COUNTRIES[0];
        
        setCountry(found);
        localStorage.setItem('aatma_country', found.code);
        
        // Auto-suggest language if user hasn't set one
        if (!localStorage.getItem('aatma_lang') && !profile?.preferredLanguage) {
            localStorage.setItem('aatma_lang', found.suggestedLang);
        }

      } catch (err) {
        console.warn("Geo-detection restricted, defaulting to India:", err);
        setCountry(COUNTRIES[0]);
      } finally {
        setLoading(false);
      }
    }

    detectCountry();
  }, [profile]);

  const changeCountry = async (code: CountryCode) => {
    const found = COUNTRIES.find(c => c.code === code);
    if (!found) return;

    setCountry(found);
    localStorage.setItem('aatma_country', code);

    if (user) {
      try {
        await updateDoc(doc(db, "users", user.uid), { 
          country: code,
          currency: found.currency
        });
      } catch (err) {
        console.error("Failed to sync country to profile:", err);
      }
    }
    
    // Soft reload to trigger regional updates
    window.location.reload();
  };

  return { country, changeCountry, loading };
}
