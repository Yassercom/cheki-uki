'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Users, Heart, Star } from 'lucide-react';
import { Recipe } from '@/types/recipe';
import { useApp } from '@/contexts/AppContext';
import { formatCookingTime, getDifficultyColor, getTagColor, cn } from '@/lib/utils';

interface RecipeCardProps {
  recipe: Recipe;
  className?: string;
}

export default function RecipeCard({ recipe, className }: RecipeCardProps) {
  const { isFavorite, addToFavorites, removeFromFavorites } = useApp();
  const isRecipeFavorite = isFavorite(recipe.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isRecipeFavorite) {
      removeFromFavorites(recipe.id);
    } else {
      addToFavorites(recipe.id);
    }
  };

  const getDifficultyStars = (difficulty: string) => {
    const stars = difficulty === 'Easy' ? 1 : difficulty === 'Medium' ? 2 : 3;
    return Array.from({ length: 3 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          'w-3 h-3',
          i < stars ? 'text-accent-400 fill-current' : 'text-gray-300'
        )}
      />
    ));
  };

  return (
    <article className={cn(
      'group bg-white rounded-xl shadow-sm border border-soft-grey overflow-hidden hover:shadow-md transition-all duration-300 hover:scale-[1.02]',
      className
    )} itemScope itemType="https://schema.org/Recipe">
      <Link href={`/recipes/${recipe.slug}`} className="block">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={recipe.imageUrl}
            alt={recipe.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            itemProp="image"
          />
          
          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label={isRecipeFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart
              className={cn(
                'w-4 h-4 transition-colors',
                isRecipeFavorite 
                  ? 'text-primary-500 fill-current' 
                  : 'text-gray-600 hover:text-primary-500'
              )}
            />
          </button>

          {/* Difficulty Badge */}
          <div className="absolute top-3 left-3">
            <div className={cn(
              'px-2 py-1 rounded-full text-xs font-medium',
              getDifficultyColor(recipe.difficulty)
            )}>
              {recipe.difficulty}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <h3 className="font-semibold text-lg text-dark-slate mb-2 line-clamp-2 group-hover:text-primary-500 transition-colors" itemProp="name">
            {recipe.title}
          </h3>

          {/* Description */}
          <p className="text-gray-600 text-sm mb-3 line-clamp-2" itemProp="description">
            {recipe.description}
          </p>

          {/* Meta Info */}
          <div className="flex items-center justify-between mb-3 text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span itemProp="totalTime" content={`PT${recipe.totalTimeMins}M`}>{formatCookingTime(recipe.totalTimeMins)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span itemProp="recipeYield">{recipe.baseServings}</span>
              </div>
            </div>
            
            {/* Difficulty Stars */}
            <div className="flex items-center space-x-1">
              {getDifficultyStars(recipe.difficulty)}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {recipe.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className={cn(
                  'px-2 py-1 rounded-full text-xs font-medium',
                  getTagColor(tag)
                )}
              >
                {tag}
              </span>
            ))}
            {recipe.tags.length > 3 && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-soft-grey text-dark-slate">
                +{recipe.tags.length - 3}
              </span>
            )}
          </div>

          {/* Author & Date */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span itemProp="author" itemScope itemType="https://schema.org/Person">
              {recipe.author?.name && (
                <>
                  By <span itemProp="name">{recipe.author.name}</span>
                </>
              )}
            </span>
            <span itemProp="datePublished" content={recipe.datePublished ? new Date(recipe.datePublished.split('/').reverse().join('-')).toISOString() : undefined}>
              {recipe.datePublished}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
