'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Menu, X, Heart, ToggleLeft, ToggleRight } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { unitSystem, toggleUnitSystem, favorites } = useApp();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/recipes?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === '/') {
      e.preventDefault();
      const searchInput = document.getElementById('search-input');
      searchInput?.focus();
    }
  };

  React.useEffect(() => {
    document.addEventListener('keydown', handleSearchKeyDown as any);
    return () => document.removeEventListener('keydown', handleSearchKeyDown as any);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-soft-grey">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-2 font-bold text-xl text-dark-slate hover:text-primary-500 transition-colors"
            aria-label="UK Food Recipes - Home"
          >
            <span className="text-primary-500">🍽️</span>
            <span className="hidden sm:inline">UK Food Recipes</span>
            <span className="sm:hidden">UKFood</span>
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  id="search-input"
                  type="text"
                  placeholder="Search recipes... (Press / to focus)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-soft-grey rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  aria-label="Search recipes"
                />
              </div>
            </form>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/recipes" 
              className="text-dark-slate hover:text-primary-500 transition-colors font-medium"
            >
              Recipes
            </Link>
            <Link 
              href="/about" 
              className="text-dark-slate hover:text-primary-500 transition-colors font-medium"
            >
              About
            </Link>
            <Link 
              href="/contact" 
              className="text-dark-slate hover:text-primary-500 transition-colors font-medium"
            >
              Contact
            </Link>

            {/* Unit Toggle */}
            <button
              onClick={toggleUnitSystem}
              className="flex items-center space-x-2 px-3 py-1 rounded-lg border border-soft-grey hover:bg-soft-grey transition-colors"
              aria-label={`Switch to ${unitSystem === 'metric' ? 'imperial' : 'metric'} units`}
            >
              {unitSystem === 'metric' ? (
                <ToggleLeft className="w-4 h-4 text-primary-500" />
              ) : (
                <ToggleRight className="w-4 h-4 text-primary-500" />
              )}
              <span className="text-sm font-medium">
                {unitSystem === 'metric' ? 'Metric' : 'Imperial'}
              </span>
            </button>

            {/* Favorites */}
            <Link
              href="/favorites"
              className="relative p-2 text-dark-slate hover:text-primary-500 transition-colors"
              aria-label={`View favorites (${favorites.length} recipes)`}
            >
              <Heart className="w-5 h-5" />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-dark-slate hover:text-primary-500 transition-colors"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-soft-grey rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              aria-label="Search recipes"
            />
          </form>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-soft-grey">
          <nav className="px-4 py-4 space-y-4">
            <Link 
              href="/recipes" 
              className="block text-dark-slate hover:text-primary-500 transition-colors font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Recipes
            </Link>
            <Link 
              href="/about" 
              className="block text-dark-slate hover:text-primary-500 transition-colors font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link 
              href="/contact" 
              className="block text-dark-slate hover:text-primary-500 transition-colors font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>

            <div className="flex items-center justify-between pt-4 border-t border-soft-grey">
              {/* Unit Toggle */}
              <button
                onClick={toggleUnitSystem}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-soft-grey hover:bg-soft-grey transition-colors"
                aria-label={`Switch to ${unitSystem === 'metric' ? 'imperial' : 'metric'} units`}
              >
                {unitSystem === 'metric' ? (
                  <ToggleLeft className="w-4 h-4 text-primary-500" />
                ) : (
                  <ToggleRight className="w-4 h-4 text-primary-500" />
                )}
                <span className="text-sm font-medium">
                  {unitSystem === 'metric' ? 'Metric' : 'Imperial'}
                </span>
              </button>

              {/* Favorites */}
              <Link
                href="/favorites"
                className="relative p-2 text-dark-slate hover:text-primary-500 transition-colors"
                aria-label={`View favorites (${favorites.length} recipes)`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Heart className="w-5 h-5" />
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </Link>
            </div>
          </nav>
        </div>
      )}

      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary-500 text-white px-4 py-2 rounded-lg z-50"
      >
        Skip to content
      </a>
    </header>
  );
}
