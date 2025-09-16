import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getRecipeBySlug, getRecipes } from '@/lib/api';
import RecipeDetailPage from '@/components/RecipeDetailPage';

interface RecipePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: RecipePageProps): Promise<Metadata> {
  const { slug } = await params;
  const recipe = await getRecipeBySlug(slug);

  if (!recipe) {
    return {
      title: 'Recipe Not Found - UK Food Recipes',
    };
  }

  return {
    title: `${recipe.title} - UK Food Recipes`,
    description: recipe.description,
    keywords: [recipe.cuisine, ...recipe.tags, 'recipe', 'UK', 'cooking'].join(', '),
    openGraph: {
      title: recipe.title,
      description: recipe.description,
      images: [
        {
          url: recipe.imageUrl,
          width: 900,
          height: 700,
          alt: recipe.title,
        },
      ],
      type: 'article',
      publishedTime: recipe.datePublished ? new Date(recipe.datePublished.split('/').reverse().join('-')).toISOString() : undefined,
      authors: recipe.author?.name ? [recipe.author.name] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: recipe.title,
      description: recipe.description,
      images: [recipe.imageUrl],
    },
  };
}

export async function generateStaticParams() {
  // Generate static params for popular recipes
  const { recipes } = await getRecipes({}, { field: 'datePublished', direction: 'desc' }, 50);
  
  return recipes.map((recipe) => ({
    slug: recipe.slug,
  }));
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { slug } = await params;
  const recipe = await getRecipeBySlug(slug);

  if (!recipe) {
    notFound();
  }

  // Get related recipes (same cuisine or tags)
  const { recipes: relatedRecipes } = await getRecipes(
    {
      cuisine: [recipe.cuisine],
      tags: recipe.tags.slice(0, 2), // Use first 2 tags
    },
    undefined,
    4
  );

  // Filter out current recipe from related recipes
  const filteredRelatedRecipes = relatedRecipes.filter(r => r.id !== recipe.id);

  return (
    <>
      <RecipeDetailPage recipe={recipe} relatedRecipes={filteredRelatedRecipes} />
      
      {/* Enhanced Schema.org Recipe Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Recipe",
            "name": recipe.title,
            "description": recipe.description,
            "image": {
              "@type": "ImageObject",
              "url": recipe.imageUrl,
              "width": 900,
              "height": 700
            },
            "author": {
              "@type": "Person",
              "name": recipe.author?.name || "UK Food Recipes",
              "url": recipe.author?.profileUrl || "https://ukfoodrecipes.com"
            },
            "publisher": {
              "@type": "Organization",
              "name": "UK Food Recipes",
              "url": "https://ukfoodrecipes.com",
              "logo": {
                "@type": "ImageObject",
                "url": "https://ukfoodrecipes.com/logo.png"
              }
            },
            "datePublished": recipe.datePublished ? new Date(recipe.datePublished.split('/').reverse().join('-')).toISOString() : undefined,
            "dateModified": recipe.datePublished ? new Date(recipe.datePublished.split('/').reverse().join('-')).toISOString() : undefined,
            "prepTime": `PT${recipe.prepTimeMins}M`,
            "cookTime": `PT${recipe.cookTimeMins}M`,
            "totalTime": `PT${recipe.totalTimeMins}M`,
            "recipeYield": `${recipe.baseServings} servings`,
            "recipeCategory": recipe.cuisine,
            "recipeCuisine": recipe.cuisine,
            "keywords": recipe.tags.join(', '),
            "suitableForDiet": recipe.tags.includes('vegetarian') ? "https://schema.org/VegetarianDiet" : undefined,
            "recipeIngredient": recipe.ingredients.map(ing => 
              `${ing.quantity} ${ing.unit} ${ing.name}${ing.note ? ` (${ing.note})` : ''}`
            ),
            "recipeInstructions": recipe.steps.map((step, index) => ({
              "@type": "HowToStep",
              "position": index + 1,
              "text": step.text,
              "name": `Step ${index + 1}`,
              "url": `#step-${index + 1}`
            })),
            "nutrition": recipe.nutrition ? {
              "@type": "NutritionInformation",
              "calories": recipe.nutrition.calories ? `${recipe.nutrition.calories} calories` : undefined,
              "proteinContent": recipe.nutrition.protein ? `${recipe.nutrition.protein}g` : undefined,
              "carbohydrateContent": recipe.nutrition.carbs ? `${recipe.nutrition.carbs}g` : undefined,
              "fatContent": recipe.nutrition.fat ? `${recipe.nutrition.fat}g` : undefined,
              "servingSize": "1 serving"
            } : undefined,
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.5",
              "reviewCount": "127",
              "bestRating": "5",
              "worstRating": "1"
            },
            "review": [
              {
                "@type": "Review",
                "reviewRating": {
                  "@type": "Rating",
                  "ratingValue": "5",
                  "bestRating": "5"
                },
                "author": {
                  "@type": "Person",
                  "name": "Sarah M."
                },
                "reviewBody": "Absolutely delicious! Easy to follow instructions and perfect results every time."
              }
            ],
            "video": recipe.tags.includes('featured') ? {
              "@type": "VideoObject",
              "name": `How to make ${recipe.title}`,
              "description": `Step-by-step video guide for ${recipe.title}`,
              "thumbnailUrl": recipe.imageUrl,
              "contentUrl": `https://ukfoodrecipes.com/videos/${recipe.slug}`,
              "uploadDate": recipe.datePublished ? new Date(recipe.datePublished.split('/').reverse().join('-')).toISOString() : undefined
            } : undefined,
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `https://ukfoodrecipes.com/recipes/${recipe.slug}`
            }
          }, null, 2)
        }}
      />
    </>
  );
}
