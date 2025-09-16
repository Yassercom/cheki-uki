'use client';

import React, { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { RecipeFilters as IRecipeFilters } from '@/types/recipe';
import { cn } from '@/lib/utils';

interface RecipeFiltersProps {
  filters: IRecipeFilters;
  onFiltersChange: (filters: IRecipeFilters) => void;
  className?: string;
}

const CUISINES = ['British', 'Indian', 'Italian', 'Chinese', 'Mediterranean', 'French', 'American'];
const TAGS = ['vegetarian', 'vegan', 'quick', '30min', 'healthy', 'classic', 'traditional', 'baking', 'dinner', 'breakfast', 'lunch'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'] as const;

export default function RecipeFilters({ filters, onFiltersChange, className }: RecipeFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilters = <K extends keyof IRecipeFilters>(key: K, value: IRecipeFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key: 'cuisine' | 'tags' | 'difficulty', value: string) => {
    const currentArray = filters[key] || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    updateFilters(key, newArray.length > 0 ? newArray : undefined);
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    Array.isArray(value) ? value.length > 0 : value !== undefined
  );

  return (
    <div className={cn('bg-white border border-soft-grey rounded-lg p-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-dark-slate" />
          <h3 className="font-semibold text-dark-slate">Filters</h3>
          {hasActiveFilters && (
            <span className="bg-primary-500 text-white text-xs px-2 py-1 rounded-full">
              Active
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-primary-500 hover:text-primary-600 transition-colors"
            >
              Clear all
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="md:hidden p-1 text-dark-slate hover:text-primary-500 transition-colors"
            aria-label={isExpanded ? 'Collapse filters' : 'Expand filters'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Filters Content */}
      <div className={cn(
        'space-y-6',
        'md:block', // Always show on desktop
        isExpanded ? 'block' : 'hidden' // Toggle on mobile
      )}>
        {/* Max Prep Time */}
        <div>
          <label className="block text-sm font-medium text-dark-slate mb-2">
            Max Prep Time
          </label>
          <div className="space-y-2">
            <input
              type="range"
              min="5"
              max="120"
              step="5"
              value={filters.maxPrepTime || 120}
              onChange={(e) => updateFilters('maxPrepTime', parseInt(e.target.value))}
              className="w-full h-2 bg-soft-grey rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>5 min</span>
              <span className="font-medium text-dark-slate">
                {filters.maxPrepTime || 120} min
              </span>
              <span>2 hours</span>
            </div>
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-sm font-medium text-dark-slate mb-2">
            Difficulty
          </label>
          <div className="flex flex-wrap gap-2">
            {DIFFICULTIES.map((difficulty) => (
              <button
                key={difficulty}
                onClick={() => toggleArrayFilter('difficulty', difficulty)}
                className={cn(
                  'px-3 py-1 rounded-full text-sm font-medium transition-colors',
                  filters.difficulty?.includes(difficulty)
                    ? 'bg-primary-500 text-white'
                    : 'bg-soft-grey text-dark-slate hover:bg-primary-100'
                )}
              >
                {difficulty}
              </button>
            ))}
          </div>
        </div>

        {/* Cuisine */}
        <div>
          <label className="block text-sm font-medium text-dark-slate mb-2">
            Cuisine
          </label>
          <div className="flex flex-wrap gap-2">
            {CUISINES.map((cuisine) => (
              <button
                key={cuisine}
                onClick={() => toggleArrayFilter('cuisine', cuisine)}
                className={cn(
                  'px-3 py-1 rounded-full text-sm font-medium transition-colors',
                  filters.cuisine?.includes(cuisine)
                    ? 'bg-accent-400 text-white'
                    : 'bg-soft-grey text-dark-slate hover:bg-accent-100'
                )}
              >
                {cuisine}
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-dark-slate mb-2">
            Dietary & Style
          </label>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleArrayFilter('tags', tag)}
                className={cn(
                  'px-3 py-1 rounded-full text-sm font-medium transition-colors capitalize',
                  filters.tags?.includes(tag)
                    ? 'bg-fresh-500 text-white'
                    : 'bg-soft-grey text-dark-slate hover:bg-fresh-100'
                )}
              >
                {tag.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-soft-grey">
          <div className="flex flex-wrap gap-2">
            {filters.cuisine?.map((cuisine) => (
              <span
                key={`cuisine-${cuisine}`}
                className="inline-flex items-center bg-accent-100 text-accent-800 px-2 py-1 rounded-full text-xs"
              >
                {cuisine}
                <button
                  onClick={() => toggleArrayFilter('cuisine', cuisine)}
                  className="ml-1 hover:text-accent-900"
                  aria-label={`Remove ${cuisine} filter`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {filters.tags?.map((tag) => (
              <span
                key={`tag-${tag}`}
                className="inline-flex items-center bg-fresh-100 text-fresh-800 px-2 py-1 rounded-full text-xs capitalize"
              >
                {tag.replace('-', ' ')}
                <button
                  onClick={() => toggleArrayFilter('tags', tag)}
                  className="ml-1 hover:text-fresh-900"
                  aria-label={`Remove ${tag} filter`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {filters.difficulty?.map((difficulty) => (
              <span
                key={`difficulty-${difficulty}`}
                className="inline-flex items-center bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs"
              >
                {difficulty}
                <button
                  onClick={() => toggleArrayFilter('difficulty', difficulty)}
                  className="ml-1 hover:text-primary-900"
                  aria-label={`Remove ${difficulty} filter`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #E63946;
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #E63946;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}
