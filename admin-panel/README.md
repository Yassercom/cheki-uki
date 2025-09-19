# UK Food Recipes - Admin Panel

A React-based admin panel for managing the UK Food Recipes website content.

## Features

- **Authentication**: Secure login with Supabase Auth
- **Role-based Access**: Admin and Moderator roles with different permissions
- **Recipe Management**: Create, edit, delete, and publish recipes
- **Multi-step Recipe Editor**: Organized workflow for recipe creation
- **Image Upload**: Direct upload to Supabase Storage with signed URLs
- **Bulk Operations**: Publish/unpublish multiple recipes at once
- **Audit Logging**: Track all admin actions
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS + Tailwind Forms
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Routing**: React Router DOM
- **Deployment**: Vercel (recommended)

## Prerequisites

1. **Supabase Project**: Set up with the provided schema
2. **Admin User**: At least one user with `is_admin = true` in the profiles table
3. **Environment Variables**: Configured as described below

## Environment Variables

Create a `.env.local` file in the admin panel root:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Installation & Development

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Access Admin Panel**
   - Open http://localhost:3001
   - Login with your admin credentials

## Building for Production

```bash
# Build the application
npm run build

# Preview the build locally
npm run preview
```

## Deployment

### Deploy to Vercel

1. **Connect Repository**
   - Import your repository to Vercel
   - Set the root directory to `admin-panel/`

2. **Configure Environment Variables**
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

3. **Deploy**
   - Vercel will automatically build and deploy
   - Access your admin panel at the provided URL

### Deploy to Other Platforms

The built files in `dist/` can be deployed to any static hosting service:
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Any web server

## User Roles & Permissions

### Administrator
- Full access to all features
- Can create, edit, delete, and publish recipes
- Can delete recipes and manage all content
- Access to audit logs

### Moderator
- Can create, edit, and publish recipes
- Cannot delete recipes
- Limited access to sensitive operations

## Creating Your First Admin User

After deploying the database schema:

1. **Sign up** through the admin panel login page
2. **Update the database** to grant admin privileges:
   ```sql
   UPDATE profiles 
   SET is_admin = true 
   WHERE email = 'your-email@domain.com';
   ```
3. **Refresh** the admin panel and you'll have full access

## Admin Panel Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.jsx      # Top navigation bar
│   ├── Sidebar.jsx     # Side navigation
│   ├── Layout.jsx      # Main layout wrapper
│   ├── ProtectedRoute.jsx  # Auth guard component
│   └── ImageUploader.jsx   # Image upload component
├── contexts/           # React contexts
│   └── AuthContext.jsx # Authentication state
├── lib/               # Utilities and configurations
│   └── supabaseClient.js  # Supabase client setup
├── pages/             # Main page components
│   ├── Login.jsx      # Login page
│   ├── Dashboard.jsx  # Admin dashboard
│   ├── RecipesList.jsx    # Recipe management
│   └── RecipeEditor.jsx   # Recipe creation/editing
└── styles/            # CSS and styling
    └── index.css      # Global styles + Tailwind
```

## Key Features

### Dashboard
- Recipe statistics (total, published, drafts, featured)
- Recent activity log
- Quick action buttons

### Recipe Management
- Paginated recipe list with search and filters
- Bulk publish/unpublish operations
- Status indicators (published, draft, featured)
- Quick edit and delete actions

### Recipe Editor
- **Step 1**: Basic recipe information (title, description, timing, etc.)
- **Step 2**: Ingredients with quantities and units
- **Step 3**: Cooking instructions with step-by-step guidance
- **Step 4**: Image upload and tag assignment

### Image Upload
- Drag-and-drop interface
- Direct upload to Supabase Storage
- Automatic signed URL generation
- Image preview and replacement

## API Integration

The admin panel communicates with serverless API functions:

- `POST /api/admin/sign-upload` - Generate signed upload URLs
- `POST /api/admin/create-recipe` - Create new recipes
- `PUT /api/admin/update-recipe` - Update existing recipes
- `DELETE /api/admin/delete-recipe` - Delete recipes (admin only)
- `POST /api/admin/publish-toggle` - Toggle publish status

## Security Features

- **JWT Authentication**: All API calls include authentication tokens
- **Role-based Access Control**: Different permissions for admin vs moderator
- **Protected Routes**: Unauthorized users cannot access admin features
- **Audit Logging**: All actions are logged for accountability
- **Input Validation**: Client and server-side validation

## Troubleshooting

### Login Issues
- Verify Supabase URL and anon key are correct
- Check that the user exists in the auth.users table
- Ensure the user has admin/moderator role in profiles table

### Image Upload Issues
- Verify storage bucket exists and policies are configured
- Check that signed upload API endpoint is working
- Ensure proper CORS settings in Supabase

### Permission Errors
- Confirm user has appropriate role (is_admin or is_moderator)
- Check RLS policies are correctly configured
- Verify API endpoints are receiving authentication headers

### Build/Deploy Issues
- Ensure all environment variables are set
- Check that the build process completes without errors
- Verify the deployment platform supports SPA routing

## Development Guidelines

### Adding New Features
1. Create components in appropriate directories
2. Use TypeScript for better type safety (optional)
3. Follow existing patterns for API integration
4. Add proper error handling and loading states
5. Test with different user roles

### Styling Guidelines
- Use Tailwind CSS utility classes
- Follow existing component patterns
- Ensure responsive design
- Test on different screen sizes

### State Management
- Use React Context for global state (auth, etc.)
- Use local state for component-specific data
- Consider adding React Query for better API state management

## Support & Maintenance

### Regular Tasks
- Monitor audit logs for unusual activity
- Update dependencies regularly
- Review and rotate API keys
- Backup database regularly

### Monitoring
- Check Vercel function logs for API errors
- Monitor Supabase dashboard for database performance
- Review user feedback and feature requests

For technical support or feature requests, refer to the main project documentation or contact the development team.
