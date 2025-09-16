export interface Ingredient {
  id: string;
  name: string;
  quantity: number; // base qty for baseServings
  unit: string; // g, ml, tsp, tbsp, pcs
  note?: string; // e.g., "chopped"
}

export interface RecipeStep {
  id: string;
  text: string;
  durationMins?: number;
}

export interface Author {
  name: string;
  profileUrl?: string;
}

export interface Nutrition {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface Recipe {
  id: string;
  title: string;
  slug: string;
  description: string;
  imageUrl: string;
  cuisine: string;
  tags: string[]; // e.g., ['vegetarian', 'quick']
  prepTimeMins: number;
  cookTimeMins: number;
  totalTimeMins: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  baseServings: number;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  author?: Author;
  datePublished?: string; // DD/MM/YYYY
  nutrition?: Nutrition;
}

export interface RecipeFilters {
  cuisine?: string[];
  tags?: string[];
  maxPrepTime?: number;
  difficulty?: ('Easy' | 'Medium' | 'Hard')[];
  search?: string;
}

export interface RecipeSort {
  field: 'title' | 'totalTimeMins' | 'datePublished' | 'difficulty';
  direction: 'asc' | 'desc';
}

export type UnitSystem = 'metric' | 'imperial';

export interface UnitConversion {
  metric: { value: number; unit: string };
  imperial: { value: number; unit: string };
}
