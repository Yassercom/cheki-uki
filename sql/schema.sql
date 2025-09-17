-- ============================================================================
-- UK Food Recipes - Supabase Database Schema
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- TABLES
-- ============================================================================

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  is_moderator BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tags table
CREATE TABLE tags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recipes table
CREATE TABLE recipes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  cuisine TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  prep_time_mins INTEGER NOT NULL CHECK (prep_time_mins > 0),
  cook_time_mins INTEGER NOT NULL CHECK (cook_time_mins >= 0),
  total_time_mins INTEGER GENERATED ALWAYS AS (prep_time_mins + cook_time_mins) STORED,
  base_servings INTEGER NOT NULL CHECK (base_servings > 0),
  image_url TEXT,
  image_alt TEXT,
  author_name TEXT NOT NULL DEFAULT 'Chef',
  date_published DATE DEFAULT CURRENT_DATE,
  is_published BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recipe ingredients table
CREATE TABLE recipe_ingredients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  ingredient_name TEXT NOT NULL,
  quantity DECIMAL(10,2),
  unit TEXT,
  notes TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recipe steps table
CREATE TABLE recipe_steps (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  step_number INTEGER NOT NULL,
  instruction TEXT NOT NULL,
  image_url TEXT,
  image_alt TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(recipe_id, step_number)
);

-- Recipe tags junction table
CREATE TABLE recipe_tags (
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (recipe_id, tag_id)
);

-- Admin audit log
CREATE TABLE admin_audit (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
  meta JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Performance indexes
CREATE INDEX idx_recipes_published ON recipes(is_published, created_at DESC);
CREATE INDEX idx_recipes_featured ON recipes(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_recipes_cuisine ON recipes(cuisine);
CREATE INDEX idx_recipes_difficulty ON recipes(difficulty);
CREATE INDEX idx_recipes_slug ON recipes(slug);
CREATE INDEX idx_recipes_created_at ON recipes(created_at DESC);

-- Full-text search indexes
CREATE INDEX idx_recipes_title_search ON recipes USING gin(to_tsvector('english', title));
CREATE INDEX idx_recipes_description_search ON recipes USING gin(to_tsvector('english', description));

-- Junction table indexes
CREATE INDEX idx_recipe_tags_recipe ON recipe_tags(recipe_id);
CREATE INDEX idx_recipe_tags_tag ON recipe_tags(tag_id);

-- Ingredients and steps indexes
CREATE INDEX idx_recipe_ingredients_recipe ON recipe_ingredients(recipe_id, sort_order);
CREATE INDEX idx_recipe_steps_recipe ON recipe_steps(recipe_id, step_number);

-- Audit log indexes
CREATE INDEX idx_admin_audit_user ON admin_audit(user_id, created_at DESC);
CREATE INDEX idx_admin_audit_recipe ON admin_audit(recipe_id, created_at DESC);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON recipes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Recipes policies
CREATE POLICY "Published recipes are viewable by everyone" ON recipes
  FOR SELECT USING (is_published = true OR auth.uid() IS NOT NULL);

CREATE POLICY "Admin and moderators can insert recipes" ON recipes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (is_admin = true OR is_moderator = true)
    )
  );

CREATE POLICY "Admin and moderators can update recipes" ON recipes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (is_admin = true OR is_moderator = true)
    )
  );

CREATE POLICY "Only admins can delete recipes" ON recipes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND is_admin = true
    )
  );

-- Recipe ingredients policies
CREATE POLICY "Recipe ingredients viewable with recipe" ON recipe_ingredients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM recipes 
      WHERE id = recipe_ingredients.recipe_id 
      AND (is_published = true OR auth.uid() IS NOT NULL)
    )
  );

CREATE POLICY "Admin and moderators can manage ingredients" ON recipe_ingredients
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (is_admin = true OR is_moderator = true)
    )
  );

-- Recipe steps policies
CREATE POLICY "Recipe steps viewable with recipe" ON recipe_steps
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM recipes 
      WHERE id = recipe_steps.recipe_id 
      AND (is_published = true OR auth.uid() IS NOT NULL)
    )
  );

CREATE POLICY "Admin and moderators can manage steps" ON recipe_steps
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (is_admin = true OR is_moderator = true)
    )
  );

-- Tags policies
CREATE POLICY "Tags are viewable by everyone" ON tags
  FOR SELECT USING (true);

CREATE POLICY "Admin and moderators can manage tags" ON tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (is_admin = true OR is_moderator = true)
    )
  );

-- Recipe tags policies
CREATE POLICY "Recipe tags viewable with recipe" ON recipe_tags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM recipes 
      WHERE id = recipe_tags.recipe_id 
      AND (is_published = true OR auth.uid() IS NOT NULL)
    )
  );

CREATE POLICY "Admin and moderators can manage recipe tags" ON recipe_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (is_admin = true OR is_moderator = true)
    )
  );

-- Admin audit policies
CREATE POLICY "Admin audit viewable by admins only" ON admin_audit
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND is_admin = true
    )
  );

CREATE POLICY "Admin audit insertable by admin and moderators" ON admin_audit
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (is_admin = true OR is_moderator = true)
    )
  );

-- ============================================================================
-- STORAGE BUCKET SETUP
-- ============================================================================

-- Create storage bucket for recipe images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('recipe-images', 'recipe-images', true);

-- Storage policies for recipe images
CREATE POLICY "Recipe images are publicly viewable" ON storage.objects
  FOR SELECT USING (bucket_id = 'recipe-images');

CREATE POLICY "Admin and moderators can upload recipe images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'recipe-images' AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (is_admin = true OR is_moderator = true)
    )
  );

CREATE POLICY "Admin and moderators can update recipe images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'recipe-images' AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (is_admin = true OR is_moderator = true)
    )
  );

CREATE POLICY "Only admins can delete recipe images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'recipe-images' AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND is_admin = true
    )
  );

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Insert common tags
INSERT INTO tags (name, slug, description) VALUES
  ('vegetarian', 'vegetarian', 'Suitable for vegetarians'),
  ('vegan', 'vegan', 'Suitable for vegans'),
  ('quick', 'quick', 'Quick and easy recipes'),
  ('30min', '30min', 'Ready in 30 minutes or less'),
  ('healthy', 'healthy', 'Healthy and nutritious'),
  ('classic', 'classic', 'Classic British recipes'),
  ('traditional', 'traditional', 'Traditional cooking methods'),
  ('baking', 'baking', 'Baking and desserts'),
  ('dinner', 'dinner', 'Perfect for dinner'),
  ('breakfast', 'breakfast', 'Great for breakfast'),
  ('lunch', 'lunch', 'Ideal for lunch'),
  ('comfort-food', 'comfort-food', 'Comforting British dishes');

-- Create first admin user (replace with actual email)
-- Note: This user must first sign up through Supabase Auth, then run this update
-- UPDATE profiles SET is_admin = true WHERE email = 'admin@cheki-uki.com';

-- Sample recipes
INSERT INTO recipes (
  title, slug, description, cuisine, difficulty, prep_time_mins, cook_time_mins, 
  base_servings, image_url, image_alt, author_name, is_published, is_featured
) VALUES
  (
    'Classic Fish and Chips',
    'classic-fish-and-chips',
    'The quintessential British dish featuring crispy battered fish with golden chips, served with mushy peas and tartar sauce.',
    'British',
    'Medium',
    20,
    25,
    4,
    'https://images.unsplash.com/photo-1544982503-9f984c14501a?w=800',
    'Golden fish and chips with mushy peas',
    'Chef Jamie',
    true,
    true
  ),
  (
    'Shepherd''s Pie',
    'shepherds-pie',
    'A hearty British classic with seasoned minced lamb topped with creamy mashed potatoes and baked until golden.',
    'British',
    'Easy',
    30,
    35,
    6,
    'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=800',
    'Traditional shepherd''s pie with golden potato topping',
    'Chef Mary',
    false,
    false
  ),
  (
    'Beef Wellington',
    'beef-wellington',
    'An elegant dish of beef tenderloin coated with pâté and duxelles, wrapped in puff pastry and baked until golden.',
    'British',
    'Hard',
    45,
    40,
    8,
    'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800',
    'Sliced beef wellington showing pink beef center',
    'Chef Gordon',
    true,
    true
  );

-- Get recipe IDs for ingredients and steps
DO $$
DECLARE
    fish_chips_id UUID;
    shepherds_pie_id UUID;
    beef_wellington_id UUID;
    vegetarian_tag_id UUID;
    classic_tag_id UUID;
    dinner_tag_id UUID;
    traditional_tag_id UUID;
BEGIN
    -- Get recipe IDs
    SELECT id INTO fish_chips_id FROM recipes WHERE slug = 'classic-fish-and-chips';
    SELECT id INTO shepherds_pie_id FROM recipes WHERE slug = 'shepherds-pie';
    SELECT id INTO beef_wellington_id FROM recipes WHERE slug = 'beef-wellington';
    
    -- Get tag IDs
    SELECT id INTO vegetarian_tag_id FROM tags WHERE slug = 'vegetarian';
    SELECT id INTO classic_tag_id FROM tags WHERE slug = 'classic';
    SELECT id INTO dinner_tag_id FROM tags WHERE slug = 'dinner';
    SELECT id INTO traditional_tag_id FROM tags WHERE slug = 'traditional';

    -- Fish and Chips ingredients
    INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, sort_order) VALUES
      (fish_chips_id, 'White fish fillets (cod or haddock)', 4, 'pieces', 1),
      (fish_chips_id, 'Plain flour', 200, 'g', 2),
      (fish_chips_id, 'Cold beer', 250, 'ml', 3),
      (fish_chips_id, 'Baking powder', 1, 'tsp', 4),
      (fish_chips_id, 'Large potatoes', 4, 'pieces', 5),
      (fish_chips_id, 'Vegetable oil for frying', 1, 'litre', 6),
      (fish_chips_id, 'Salt and pepper', NULL, 'to taste', 7),
      (fish_chips_id, 'Mushy peas', 400, 'g tin', 8),
      (fish_chips_id, 'Tartar sauce', NULL, 'for serving', 9);

    -- Fish and Chips steps
    INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
      (fish_chips_id, 1, 'Cut potatoes into thick chips and soak in cold water for 30 minutes.'),
      (fish_chips_id, 2, 'Heat oil to 140°C. Fry chips for 5 minutes, then remove and drain.'),
      (fish_chips_id, 3, 'Make batter by whisking flour, baking powder, and beer until smooth.'),
      (fish_chips_id, 4, 'Increase oil temperature to 180°C. Dip fish in batter and fry for 4-5 minutes.'),
      (fish_chips_id, 5, 'Fry chips again at 180°C for 2-3 minutes until golden.'),
      (fish_chips_id, 6, 'Heat mushy peas and serve everything with tartar sauce.');

    -- Shepherd''s Pie ingredients
    INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, sort_order) VALUES
      (shepherds_pie_id, 'Minced lamb', 500, 'g', 1),
      (shepherds_pie_id, 'Onion, diced', 1, 'large', 2),
      (shepherds_pie_id, 'Carrots, diced', 2, 'medium', 3),
      (shepherds_pie_id, 'Frozen peas', 100, 'g', 4),
      (shepherds_pie_id, 'Tomato purée', 2, 'tbsp', 5),
      (shepherds_pie_id, 'Worcestershire sauce', 2, 'tbsp', 6),
      (shepherds_pie_id, 'Beef stock', 300, 'ml', 7),
      (shepherds_pie_id, 'Potatoes', 1, 'kg', 8),
      (shepherds_pie_id, 'Butter', 50, 'g', 9),
      (shepherds_pie_id, 'Milk', 100, 'ml', 10);

    -- Shepherd''s Pie steps
    INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
      (shepherds_pie_id, 1, 'Preheat oven to 200°C. Boil potatoes until tender, then mash with butter and milk.'),
      (shepherds_pie_id, 2, 'Fry onion and carrots until softened. Add lamb and cook until browned.'),
      (shepherds_pie_id, 3, 'Stir in tomato purée, Worcestershire sauce, and stock. Simmer for 15 minutes.'),
      (shepherds_pie_id, 4, 'Add peas and season. Transfer to baking dish.'),
      (shepherds_pie_id, 5, 'Top with mashed potato and fork to create texture.'),
      (shepherds_pie_id, 6, 'Bake for 25-30 minutes until golden on top.');

    -- Beef Wellington ingredients
    INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, sort_order) VALUES
      (beef_wellington_id, 'Beef fillet', 1, 'kg piece', 1),
      (beef_wellington_id, 'Puff pastry', 500, 'g', 2),
      (beef_wellington_id, 'Mushrooms, finely chopped', 400, 'g', 3),
      (beef_wellington_id, 'Shallots, finely chopped', 2, 'pieces', 4),
      (beef_wellington_id, 'Garlic cloves', 2, 'pieces', 5),
      (beef_wellington_id, 'Fresh thyme', 2, 'tbsp', 6),
      (beef_wellington_id, 'Dijon mustard', 2, 'tbsp', 7),
      (beef_wellington_id, 'Prosciutto slices', 8, 'pieces', 8),
      (beef_wellington_id, 'Egg yolk', 1, 'piece', 9),
      (beef_wellington_id, 'Olive oil', 2, 'tbsp', 10);

    -- Beef Wellington steps
    INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
      (beef_wellington_id, 1, 'Season beef and sear in hot pan until browned all over. Cool and brush with mustard.'),
      (beef_wellington_id, 2, 'Cook mushrooms, shallots, garlic, and thyme until moisture evaporates. Cool completely.'),
      (beef_wellington_id, 3, 'Lay prosciutto on cling film, spread mushroom mixture over, place beef on top and wrap tightly.'),
      (beef_wellington_id, 4, 'Chill for 30 minutes. Roll out pastry and wrap around beef parcel.'),
      (beef_wellington_id, 5, 'Brush with egg yolk and score decoratively. Chill for 15 minutes.'),
      (beef_wellington_id, 6, 'Bake at 200°C for 25-30 minutes for medium-rare. Rest for 10 minutes before slicing.');

    -- Add tags to recipes
    INSERT INTO recipe_tags (recipe_id, tag_id) VALUES
      (fish_chips_id, classic_tag_id),
      (fish_chips_id, traditional_tag_id),
      (fish_chips_id, dinner_tag_id),
      (shepherds_pie_id, classic_tag_id),
      (shepherds_pie_id, dinner_tag_id),
      (beef_wellington_id, dinner_tag_id),
      (beef_wellington_id, traditional_tag_id);
END $$;

-- ============================================================================
-- HELPFUL VIEWS (Optional)
-- ============================================================================

-- View for complete recipe data with tags
CREATE VIEW recipe_details AS
SELECT 
  r.*,
  COALESCE(
    json_agg(
      json_build_object(
        'id', t.id,
        'name', t.name,
        'slug', t.slug
      )
    ) FILTER (WHERE t.id IS NOT NULL), 
    '[]'::json
  ) as tags,
  (
    SELECT json_agg(
      json_build_object(
        'id', ri.id,
        'ingredient_name', ri.ingredient_name,
        'quantity', ri.quantity,
        'unit', ri.unit,
        'notes', ri.notes,
        'sort_order', ri.sort_order
      ) ORDER BY ri.sort_order
    )
    FROM recipe_ingredients ri 
    WHERE ri.recipe_id = r.id
  ) as ingredients,
  (
    SELECT json_agg(
      json_build_object(
        'id', rs.id,
        'step_number', rs.step_number,
        'instruction', rs.instruction,
        'image_url', rs.image_url,
        'image_alt', rs.image_alt
      ) ORDER BY rs.step_number
    )
    FROM recipe_steps rs 
    WHERE rs.recipe_id = r.id
  ) as steps
FROM recipes r
LEFT JOIN recipe_tags rt ON r.id = rt.recipe_id
LEFT JOIN tags t ON rt.tag_id = t.id
GROUP BY r.id;

-- ============================================================================
-- FUNCTIONS FOR API USAGE
-- ============================================================================

-- Function to get published recipes with filters
CREATE OR REPLACE FUNCTION get_published_recipes(
  search_query TEXT DEFAULT NULL,
  tag_filter TEXT DEFAULT NULL,
  cuisine_filter TEXT DEFAULT NULL,
  difficulty_filter TEXT DEFAULT NULL,
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  slug TEXT,
  description TEXT,
  cuisine TEXT,
  difficulty TEXT,
  prep_time_mins INTEGER,
  cook_time_mins INTEGER,
  total_time_mins INTEGER,
  base_servings INTEGER,
  image_url TEXT,
  image_alt TEXT,
  author_name TEXT,
  date_published DATE,
  is_featured BOOLEAN,
  tags JSON
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.title,
    r.slug,
    r.description,
    r.cuisine,
    r.difficulty,
    r.prep_time_mins,
    r.cook_time_mins,
    r.total_time_mins,
    r.base_servings,
    r.image_url,
    r.image_alt,
    r.author_name,
    r.date_published,
    r.is_featured,
    COALESCE(
      (
        SELECT json_agg(
          json_build_object(
            'name', t.name,
            'slug', t.slug
          )
        )
        FROM recipe_tags rt
        JOIN tags t ON rt.tag_id = t.id
        WHERE rt.recipe_id = r.id
      ),
      '[]'::json
    ) as tags
  FROM recipes r
  WHERE r.is_published = true
    AND (search_query IS NULL OR (
      r.title ILIKE '%' || search_query || '%' OR
      r.description ILIKE '%' || search_query || '%'
    ))
    AND (cuisine_filter IS NULL OR r.cuisine = cuisine_filter)
    AND (difficulty_filter IS NULL OR r.difficulty = difficulty_filter)
    AND (tag_filter IS NULL OR EXISTS (
      SELECT 1 FROM recipe_tags rt
      JOIN tags t ON rt.tag_id = t.id
      WHERE rt.recipe_id = r.id AND t.slug = tag_filter
    ))
  ORDER BY r.is_featured DESC, r.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to anon and authenticated users
GRANT EXECUTE ON FUNCTION get_published_recipes TO anon, authenticated;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

-- Schema setup complete!
-- Next steps:
-- 1. Deploy this schema to your Supabase project
-- 2. Create your first admin user by signing up through Supabase Auth
-- 3. Run: UPDATE profiles SET is_admin = true WHERE email = 'your-admin-email@domain.com';
-- 4. Set up the API endpoints and admin panel
