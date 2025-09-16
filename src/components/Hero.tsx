'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Clock, Users } from 'lucide-react';
import { Recipe } from '@/types/recipe';
import { formatCookingTime, cn } from '@/lib/utils';

interface HeroProps {
  featuredRecipes: Recipe[];
}

export default function Hero({ featuredRecipes }: HeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-rotate slides
  useEffect(() => {
    if (featuredRecipes.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredRecipes.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [featuredRecipes.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredRecipes.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredRecipes.length) % featuredRecipes.length);
  };

  if (!featuredRecipes.length) {
    return (
      <section className="relative h-96 bg-gradient-to-r from-primary-500 to-accent-400 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">UK Food Recipes</h1>
          <p className="text-xl mb-8">Discover delicious recipes from Britain and beyond</p>
          <Link
            href="/recipes"
            className="bg-white text-primary-500 px-8 py-3 rounded-lg font-semibold hover:bg-cream transition-colors"
          >
            Browse Recipes
          </Link>
        </div>
      </section>
    );
  }

  const currentRecipe = featuredRecipes[currentSlide];

  return (
    <section className="relative h-[500px] md:h-[600px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={currentRecipe.imageUrl}
          alt={currentRecipe.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            <div className="mb-4">
              <span className="inline-block bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                Featured Recipe
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
              {currentRecipe.title}
            </h1>
            
            <p className="text-xl text-white/90 mb-6 leading-relaxed">
              {currentRecipe.description}
            </p>

            {/* Recipe Meta */}
            <div className="flex items-center space-x-6 mb-8 text-white/80">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>{formatCookingTime(currentRecipe.totalTimeMins)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>{currentRecipe.baseServings} servings</span>
              </div>
              <div className="px-3 py-1 bg-white/20 rounded-full text-sm">
                {currentRecipe.difficulty}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={`/recipes/${currentRecipe.slug}`}
                className="bg-primary-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors text-center"
              >
                Start Cooking
              </Link>
              <Link
                href="/recipes"
                className="bg-white/20 backdrop-blur-sm text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/30 transition-colors text-center border border-white/30"
              >
                Browse All Recipes
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {featuredRecipes.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Previous recipe"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Next recipe"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Slide Indicators */}
      {featuredRecipes.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {featuredRecipes.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={cn(
                'w-3 h-3 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/50',
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
