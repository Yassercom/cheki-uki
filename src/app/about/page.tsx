import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import { Heart, Users, Globe, Award } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us - UK Food Recipes',
  description: 'Learn about UK Food Recipes, our mission to bring authentic British cuisine and international favourites to your kitchen with proper UK measurements.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-dark-slate mb-6">
            About UK Food Recipes
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We&apos;re passionate about bringing authentic British cuisine and international favourites 
            to your kitchen, with proper UK measurements and locally-sourced ingredient suggestions.
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-white rounded-xl shadow-sm border border-soft-grey p-8 mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-dark-slate mb-4">Our Mission</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              To make cooking accessible, enjoyable, and authentically British while celebrating 
              the diverse culinary traditions that make up modern UK cuisine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-primary-500" />
              </div>
              <h3 className="font-semibold text-dark-slate mb-2">Made with Love</h3>
              <p className="text-sm text-gray-600">
                Every recipe is tested and perfected by our team of passionate home cooks.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-fresh-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-fresh-500" />
              </div>
              <h3 className="font-semibold text-dark-slate mb-2">Community Driven</h3>
              <p className="text-sm text-gray-600">
                Built by and for the UK cooking community, with feedback from real home cooks.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-accent-500" />
              </div>
              <h3 className="font-semibold text-dark-slate mb-2">Locally Focused</h3>
              <p className="text-sm text-gray-600">
                UK measurements, seasonal produce suggestions, and supermarket-friendly ingredients.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-primary-500" />
              </div>
              <h3 className="font-semibold text-dark-slate mb-2">Quality First</h3>
              <p className="text-sm text-gray-600">
                Thoroughly tested recipes with clear instructions and helpful cooking tips.
              </p>
            </div>
          </div>
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">
          <div>
            <h2 className="text-3xl font-bold text-dark-slate mb-6">Our Story</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                UK Food Recipes was born from a simple frustration: trying to follow American recipes 
                with cups and Fahrenheit temperatures, or European recipes that didn&apos;t account for 
                British ingredients and preferences.
              </p>
              <p>
                We started as a small team of food enthusiasts who wanted to create a recipe platform 
                that truly understood the UK kitchen. From proper metric measurements to suggesting 
                where to find ingredients in British supermarkets, every detail matters.
              </p>
              <p>
                Today, we&apos;re proud to serve thousands of home cooks across the UK, helping them 
                discover new flavours while celebrating the rich culinary heritage of Britain.
              </p>
            </div>
          </div>
          <div className="relative h-64 lg:h-80 rounded-xl overflow-hidden">
            <Image
              src="https://source.unsplash.com/600x400/?british-kitchen,cooking"
              alt="British kitchen with traditional cooking"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Values Section */}
        <div className="bg-white rounded-xl shadow-sm border border-soft-grey p-8 mb-12">
          <h2 className="text-3xl font-bold text-dark-slate mb-8 text-center">What We Believe</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-dark-slate mb-3">Accessibility Matters</h3>
              <p className="text-gray-600">
                Good food shouldn&apos;t be complicated or expensive. We focus on recipes that use 
                readily available ingredients and don&apos;t require specialist equipment.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-dark-slate mb-3">Tradition & Innovation</h3>
              <p className="text-gray-600">
                We celebrate classic British dishes while embracing the multicultural influences 
                that make modern UK cuisine so exciting.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-dark-slate mb-3">Seasonal Cooking</h3>
              <p className="text-gray-600">
                We promote cooking with seasonal British produce, supporting local farmers and 
                ensuring the best flavours in your dishes.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-dark-slate mb-3">Inclusive Community</h3>
              <p className="text-gray-600">
                Whether you&apos;re a complete beginner or an experienced cook, our recipes and 
                community welcome everyone to the joy of cooking.
              </p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-dark-slate mb-6">Meet the Team</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Our diverse team of food writers, recipe developers, and home cooking enthusiasts 
            work together to bring you the best of British and international cuisine.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-primary-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-500">CA</span>
              </div>
              <h3 className="font-semibold text-dark-slate">Chef Anna</h3>
              <p className="text-sm text-gray-600">Head Recipe Developer</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-fresh-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-fresh-500">HS</span>
              </div>
              <h3 className="font-semibold text-dark-slate">Home Cook Sam</h3>
              <p className="text-sm text-gray-600">Community Manager</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-accent-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-accent-500">BL</span>
              </div>
              <h3 className="font-semibold text-dark-slate">Baker Lou</h3>
              <p className="text-sm text-gray-600">Baking Specialist</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-dark-slate text-white rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Join Our Community</h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Be part of a growing community of UK home cooks. Share your cooking experiences, 
            get tips from fellow food enthusiasts, and discover new favourite recipes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/recipes"
              className="px-6 py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors"
            >
              Browse Recipes
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 bg-white/20 text-white rounded-lg font-semibold hover:bg-white/30 transition-colors border border-white/30"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
