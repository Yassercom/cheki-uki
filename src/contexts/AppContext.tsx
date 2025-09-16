'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UnitSystem } from '@/types/recipe';

interface AppContextType {
  unitSystem: UnitSystem;
  toggleUnitSystem: () => void;
  favorites: string[];
  addToFavorites: (recipeId: string) => void;
  removeFromFavorites: (recipeId: string) => void;
  isFavorite: (recipeId: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedUnitSystem = localStorage.getItem('unitSystem') as UnitSystem;
    const savedFavorites = localStorage.getItem('favorites');

    if (savedUnitSystem && (savedUnitSystem === 'metric' || savedUnitSystem === 'imperial')) {
      setUnitSystem(savedUnitSystem);
    }

    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (error) {
        console.error('Error parsing saved favorites:', error);
      }
    }
  }, []);

  // Save preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem('unitSystem', unitSystem);
  }, [unitSystem]);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleUnitSystem = () => {
    setUnitSystem(prev => prev === 'metric' ? 'imperial' : 'metric');
  };

  const addToFavorites = (recipeId: string) => {
    setFavorites(prev => {
      if (!prev.includes(recipeId)) {
        return [...prev, recipeId];
      }
      return prev;
    });
  };

  const removeFromFavorites = (recipeId: string) => {
    setFavorites(prev => prev.filter(id => id !== recipeId));
  };

  const isFavorite = (recipeId: string) => {
    return favorites.includes(recipeId);
  };

  return (
    <AppContext.Provider
      value={{
        unitSystem,
        toggleUnitSystem,
        favorites,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
