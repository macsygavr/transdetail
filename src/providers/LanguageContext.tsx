"use client";

import { createContext, PropsWithChildren, useContext } from "react";

const LanguagesContext = createContext<string[]>([]);

export const useLanguages = () => {
  return useContext(LanguagesContext);
};

export function LanguagesContextProvider({
  children,
  value,
}: PropsWithChildren<{ value: string[] }>) {
  return (
    <LanguagesContext.Provider value={value}>
      {children}
    </LanguagesContext.Provider>
  );
}
