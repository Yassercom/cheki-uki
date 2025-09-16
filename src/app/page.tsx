import React from 'react';
import Link from 'next/link';
import { getFeaturedRecipes, getRecipes } from '@/lib/api';
import Hero from '@/components/Hero';
import RecipeCard from '@/components/RecipeCard';

export default async function Home() {
  const featuredRecipes = await getFeaturedRecipes(3);
  const { recipes: quickRecipes } = await getRecipes({ tags: ['quick', '30min'] }, undefined, 6);
  const { recipes: popularRecipes } = await getRecipes({}, { field: 'datePublished', direction: 'desc' }, 6);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero featuredRecipes={featuredRecipes} />

      {/* Quick Category Chips */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/recipes?tags=breakfast"
              className="px-6 py-3 bg-accent-100 text-accent-800 rounded-full font-medium hover:bg-accent-200 transition-colors"
            >
              Breakfast
            </Link>
            <Link
              href="/recipes?tags=dinner"
              className="px-6 py-3 bg-primary-100 text-primary-800 rounded-full font-medium hover:bg-primary-200 transition-colors"
            >
              Dinner
            </Link>
            <Link
              href="/recipes?tags=quick"
              className="px-6 py-3 bg-fresh-100 text-fresh-800 rounded-full font-medium hover:bg-fresh-200 transition-colors"
            >
              Quick Meals
            </Link>
            <Link
              href="/recipes?tags=vegetarian"
              className="px-6 py-3 bg-fresh-100 text-fresh-800 rounded-full font-medium hover:bg-fresh-200 transition-colors"
            >
              Vegetarian
            </Link>
            <Link
              href="/recipes?cuisine=British"
              className="px-6 py-3 bg-primary-100 text-primary-800 rounded-full font-medium hover:bg-primary-200 transition-colors"
            >
              British Classics
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Recipes Section */}
      <section className="py-16 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-dark-slate mb-4">
              Quick & Easy
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Perfect for busy weeknights when you need something delicious on the table fast.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {quickRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/recipes?tags=quick"
              className="inline-flex items-center px-6 py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors"
            >
              View All Quick Recipes
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Recipes Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-dark-slate mb-4">
              Popular Recipes
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our most loved recipes, tried and tested by home cooks across the UK.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {popularRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/recipes"
              className="inline-flex items-center px-6 py-3 bg-accent-400 text-white rounded-lg font-semibold hover:bg-accent-500 transition-colors"
            >
              Browse All Recipes
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-dark-slate text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Never Miss a Recipe
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Get weekly recipe inspiration delivered straight to your inbox, featuring seasonal British produce and international favourites.
          </p>
          
          <form className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-4 py-3 rounded-lg text-dark-slate focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
              aria-label="Email address for newsletter"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors"
            >
              Subscribe
            </button>
          </form>
          
          <p className="text-sm text-gray-400 mt-4">
            No spam, unsubscribe at any time. We respect your privacy.
          </p>
        </div>
      </section>
    </div>
  );
}
