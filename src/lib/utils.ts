import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { UnitSystem, UnitConversion } from "@/types/recipe"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format date to UK format (DD/MM/YYYY)
 */
export function formatDateUK(dateString: string): string {
  if (!dateString) return '';
  
  // If already in DD/MM/YYYY format, return as is
  if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
    return dateString;
  }
  
  // Convert from other formats
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
}

/**
 * Format cooking time in a human-readable way
 */
export function formatCookingTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min${minutes !== 1 ? 's' : ''}`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Convert units between metric and imperial systems
 */
export function convertUnits(
  quantity: number,
  unit: string,
  targetSystem: UnitSystem
): { value: number; unit: string } {
  const conversions: Record<string, UnitConversion> = {
    // Weight conversions
    'g': {
      metric: { value: 1, unit: 'g' },
      imperial: { value: 0.035274, unit: 'oz' }
    },
    'kg': {
      metric: { value: 1, unit: 'kg' },
      imperial: { value: 2.20462, unit: 'lb' }
    },
    'oz': {
      metric: { value: 28.3495, unit: 'g' },
      imperial: { value: 1, unit: 'oz' }
    },
    'lb': {
      metric: { value: 0.453592, unit: 'kg' },
      imperial: { value: 1, unit: 'lb' }
    },
    
    // Volume conversions
    'ml': {
      metric: { value: 1, unit: 'ml' },
      imperial: { value: 0.033814, unit: 'fl oz' }
    },
    'l': {
      metric: { value: 1, unit: 'l' },
      imperial: { value: 1.75975, unit: 'pint' }
    },
    'fl oz': {
      metric: { value: 29.5735, unit: 'ml' },
      imperial: { value: 1, unit: 'fl oz' }
    },
    'pint': {
      metric: { value: 568.261, unit: 'ml' },
      imperial: { value: 1, unit: 'pint' }
    },
    
    // Temperature conversions
    '°C': {
      metric: { value: 1, unit: '°C' },
      imperial: { value: 1, unit: '°F' } // Special case handled below
    },
    '°F': {
      metric: { value: 1, unit: '°C' }, // Special case handled below
      imperial: { value: 1, unit: '°F' }
    }
  };

  const conversion = conversions[unit.toLowerCase()];
  if (!conversion) {
    // Return original if no conversion available
    return { value: quantity, unit };
  }

  // Special handling for temperature
  if (unit === '°C' && targetSystem === 'imperial') {
    return { value: Math.round((quantity * 9/5) + 32), unit: '°F' };
  }
  if (unit === '°F' && targetSystem === 'metric') {
    return { value: Math.round((quantity - 32) * 5/9), unit: '°C' };
  }

  const target = conversion[targetSystem];
  const convertedValue = quantity * target.value;
  
  // Round to appropriate decimal places
  const rounded = convertedValue < 1 
    ? Math.round(convertedValue * 100) / 100
    : Math.round(convertedValue * 10) / 10;

  return { value: rounded, unit: target.unit };
}

/**
 * Scale ingredient quantities based on servings
 */
export function scaleIngredientQuantity(
  originalQuantity: number,
  originalServings: number,
  newServings: number
): number {
  const scaleFactor = newServings / originalServings;
  const scaledQuantity = originalQuantity * scaleFactor;
  
  // Round to appropriate decimal places
  if (scaledQuantity < 1) {
    return Math.round(scaledQuantity * 100) / 100;
  } else if (scaledQuantity < 10) {
    return Math.round(scaledQuantity * 10) / 10;
  } else {
    return Math.round(scaledQuantity);
  }
}

/**
 * Generate a slug from a title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
}

/**
 * Debounce function for search inputs
 */
export function debounce<TArgs extends unknown[], TReturn>(
  func: (...args: TArgs) => TReturn,
  wait: number
): (...args: TArgs) => void {
  let timeout: ReturnType<typeof setTimeout>;
  
  return (...args: TArgs) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => { func(...args); }, wait);
  };
}

/**
 * Get difficulty color classes
 */
export function getDifficultyColor(difficulty: string): string {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return 'bg-fresh-100 text-fresh-800';
    case 'medium':
      return 'bg-accent-100 text-accent-800';
    case 'hard':
      return 'bg-primary-100 text-primary-800';
    default:
      return 'bg-soft-grey text-dark-slate';
  }
}

/**
 * Get tag color classes
 */
export function getTagColor(tag: string): string {
  const tagColors: Record<string, string> = {
    'vegetarian': 'bg-fresh-100 text-fresh-800',
    'vegan': 'bg-fresh-100 text-fresh-800',
    'quick': 'bg-accent-100 text-accent-800',
    '30min': 'bg-accent-100 text-accent-800',
    'healthy': 'bg-fresh-100 text-fresh-800',
    'classic': 'bg-primary-100 text-primary-800',
    'traditional': 'bg-primary-100 text-primary-800',
    'baking': 'bg-accent-100 text-accent-800',
    'dinner': 'bg-soft-grey text-dark-slate',
    'breakfast': 'bg-soft-grey text-dark-slate',
    'lunch': 'bg-soft-grey text-dark-slate',
  };
  
  return tagColors[tag.toLowerCase()] || 'bg-soft-grey text-dark-slate';
}
