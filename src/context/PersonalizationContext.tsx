"use client";

import React, { createContext, useContext } from "react";

/**
 * @fileOverview Personalization Context (ROLLBACK VERSION)
 * System restored to original dark gaming design. 
 * Personalization nodes are now hardcoded to platform defaults.
 */

export interface PersonalizationSettings {
  theme: string;
  fontFamily: string;
  fontSize: string;
  uiStyle: string;
  glowEnabled: boolean;
  lowPerformanceMode: boolean;
}

const DEFAULT_SETTINGS: PersonalizationSettings = {
  theme: "dark-purple",
  fontFamily: "Inter",
  fontSize: "medium",
  uiStyle: "modern",
  glowEnabled: true,
  lowPerformanceMode: false,
};

interface PersonalizationContextType {
  settings: PersonalizationSettings;
  updateSettings: (newSettings: Partial<PersonalizationSettings>) => Promise<void>;
  resetToDefault: () => Promise<void>;
}

const PersonalizationContext = createContext<PersonalizationContextType | undefined>(undefined);

export function PersonalizationProvider({ children }: { children: React.ReactNode }) {
  // Logic decommissioned in favor of original design restoration
  const settings = DEFAULT_SETTINGS;
  const updateSettings = async () => {};
  const resetToDefault = async () => {};

  return (
    <PersonalizationContext.Provider value={{ settings, updateSettings, resetToDefault }}>
      {children}
    </PersonalizationContext.Provider>
  );
}

export const usePersonalization = () => {
  const context = useContext(PersonalizationContext);
  if (!context) return { settings: DEFAULT_SETTINGS, updateSettings: async () => {}, resetToDefault: async () => {} };
  return context;
};