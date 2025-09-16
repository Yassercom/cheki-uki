# UK Food Recipes Website 🇬🇧

A modern, mobile-first recipe website focused on British cuisine, built with Next.js 15, TypeScript, and TailwindCSS. Features comprehensive accessibility support, SEO optimization, and a beautiful responsive design.

## ✨ Features

### Core Functionality
- **Recipe Discovery**: Browse, search, and filter through a curated collection of UK recipes
- **Detailed Recipe Pages**: Step-by-step instructions with cooking mode and timer
- **Favorites System**: Save recipes to favorites with localStorage persistence
- **Unit Toggle**: Switch between metric and imperial measurements
- **Advanced Filtering**: Filter by cuisine, difficulty, prep time, and dietary tags
- **Responsive Design**: Mobile-first approach with beautiful desktop layouts

### User Experience
- **Cooking Mode**: Step-by-step cooking interface with built-in timer
- **Servings Scaler**: Automatically adjust ingredient quantities
- **Print Functionality**: Print-optimized recipe layouts
- **Share Recipes**: Easy social sharing capabilities
- **Search**: Real-time recipe search with debounced input

### Technical Excellence
- **SEO Optimized**: Meta tags, Open Graph, Twitter Cards, and JSON-LD structured data
- **Accessibility**: WCAG AA compliant with keyboard navigation and screen reader support
- **Performance**: Optimized images, lazy loading, and efficient rendering
- **Type Safety**: Full TypeScript implementation with comprehensive type definitions

## 🚀 Getting Started

### Prerequisites
- Node.js 18.17 or later
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd uk-food-recipes
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── about/             # About page
│   ├── contact/           # Contact page
│   ├── favorites/         # Favorites page
│   ├── recipes/           # Recipe listing and detail pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Home page
├── components/            # Reusable UI components
│   ├── Footer.tsx        # Site footer
│   ├── Header.tsx        # Navigation header
│   ├── Hero.tsx          # Hero carousel
│   ├── RecipeCard.tsx    # Recipe preview cards
│   ├── RecipeDetailPage.tsx # Full recipe display
│   └── RecipeFilters.tsx # Recipe filtering interface
├── contexts/             # React Context providers
│   └── AppContext.tsx    # Global app state
├── lib/                  # Utility functions and API
│   ├── api.ts           # API abstraction layer
│   └── utils.ts         # Helper functions
└── types/               # TypeScript type definitions
    └── recipe.ts        # Recipe-related types
```

## 🎨 Design System

### Color Palette
- **Primary**: British Racing Green (`#1a472a`)
- **Secondary**: Warm Cream (`#fef7ed`)
- **Accent**: Golden Yellow (`#f59e0b`)
- **Text**: Charcoal (`#374151`)

### Typography
- **Font**: Inter (Google Fonts)
- **Headings**: Bold weights with proper hierarchy
- **Body**: Regular weight with optimal line spacing

### Components
- Consistent spacing using Tailwind's spacing scale
- Rounded corners and subtle shadows
- Focus states for accessibility
- Hover animations and transitions

## 🌐 UK Localization

### Date Format
- Uses DD/MM/YYYY format throughout the application
- Proper British date formatting in recipe metadata

### Language
- British English spelling and vocabulary
- UK-specific culinary terms and measurements
- Cultural references and recipe descriptions

### Measurements
- Default metric units (grams, millilitres, Celsius)
- Imperial conversion available via toggle
- UK-specific measurements (stones, pints)

## ♿ Accessibility Features

### WCAG AA Compliance
- Semantic HTML structure
- Proper heading hierarchy
- Alt text for all images
- Keyboard navigation support
- Focus indicators
- Screen reader compatibility

### Interactive Elements
- Skip-to-content links
- Aria labels and descriptions
- High contrast mode support
- Reduced motion preferences
- Touch-friendly tap targets

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file for configuration:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://your-api.com
USE_MOCK_DATA=true

# Analytics (optional)
NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

### Mock Data
The application includes comprehensive mock data in `/data/recipes.json` with:
- 3 example British recipes
- Proper UK formatting and terminology
- Nutritional information
- Author details and publication dates

## 🧪 Testing

### Running Tests
```bash
npm run test        # Run all tests
npm run test:watch  # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

### Test Structure
- Unit tests for utility functions
- Component testing with React Testing Library
- Integration tests for key user flows
- Accessibility testing with jest-axe

## 📱 Responsive Design

### Breakpoints
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

### Mobile-First Approach
- Touch-friendly interface
- Optimized navigation
- Readable typography
- Fast loading times

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your repository to Vercel
2. Configure environment variables
3. Deploy with automatic builds

### Other Platforms
The application can be deployed to any platform supporting Node.js:
- Netlify
- Railway
- AWS Amplify
- Digital Ocean App Platform

## 🔄 API Integration

### Current Implementation
- Mock data stored in JSON files
- API abstraction layer in `src/lib/api.ts`
- Easy switching between mock and real data

### Switching to Real API
1. Update `USE_MOCK_DATA` environment variable
2. Implement API endpoints in `src/lib/api.ts`
3. Ensure response format matches TypeScript interfaces

### Expected API Endpoints
```
GET /api/recipes              # List recipes with filtering
GET /api/recipes/:slug        # Get single recipe
GET /api/recipes/featured     # Get featured recipes
GET /api/search?q=query      # Search recipes
```

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Code Standards
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Semantic commit messages

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Recipe data inspired by traditional British cuisine
- Icons provided by Lucide React
- Images from Unsplash
- Built with Next.js and TailwindCSS

---

**Made with ❤️ for British food lovers**
