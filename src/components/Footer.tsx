'use client';

import React from 'react';
import Link from 'next/link';
import { Github, Twitter, Instagram, Mail } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark-slate text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <span className="text-primary-500 text-2xl">🍽️</span>
              <span className="font-bold text-xl">UK Food Recipes</span>
            </Link>
            <p className="text-gray-300 mb-4 max-w-md">
              Discover authentic British cuisine and international favourites. 
              From traditional Sunday roasts to quick weeknight dinners, 
              find your perfect recipe with proper UK measurements and ingredients.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Follow us on GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Follow us on Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="mailto:hello@ukfoodrecipes.com"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Email us"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/recipes" className="text-gray-300 hover:text-white transition-colors">
                  All Recipes
                </Link>
              </li>
              <li>
                <Link href="/recipes?tags=quick" className="text-gray-300 hover:text-white transition-colors">
                  Quick Meals
                </Link>
              </li>
              <li>
                <Link href="/recipes?tags=vegetarian" className="text-gray-300 hover:text-white transition-colors">
                  Vegetarian
                </Link>
              </li>
              <li>
                <Link href="/recipes?cuisine=British" className="text-gray-300 hover:text-white transition-colors">
                  British Classics
                </Link>
              </li>
              <li>
                <Link href="/favorites" className="text-gray-300 hover:text-white transition-colors">
                  My Favourites
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-300 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-300 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/sitemap.xml" className="text-gray-300 hover:text-white transition-colors">
                  Sitemap
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} UK Food Recipes. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <span className="text-gray-400 text-sm">Made with ❤️ in the UK</span>
          </div>
        </div>
      </div>

      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "UK Food Recipes",
            "description": "Discover authentic British cuisine and international favourites with proper UK measurements.",
            "url": "https://ukfoodrecipes.com",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://ukfoodrecipes.com/recipes?search={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })
        }}
      />
    </footer>
  );
}
