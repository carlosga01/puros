# Puros - Cigar Hub Setup Guide

## Supabase Configuration

To get your Puros app running with authentication, you'll need to set up Supabase and configure your environment variables.

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new account or sign in
2. Create a new project
3. Wait for the project to be set up (this may take a few minutes)

### 2. Get Your Supabase Credentials

Once your project is ready:

1. Go to your project dashboard
2. Click on "Settings" in the sidebar
3. Click on "API" 
4. Copy the following values:
   - **Project URL** (under "Project URL")
   - **Anon/Public Key** (under "Project API keys")

### 3. Set Up Environment Variables

Create a `.env.local` file in your project root and add:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

Replace `your_project_url_here` and `your_anon_key_here` with the values you copied from Supabase.

### 4. Configure Authentication Settings (Optional)

In your Supabase dashboard:

1. Go to "Authentication" > "Settings"
2. Under "Site URL", add your development URL: `http://localhost:3000`
3. Under "Redirect URLs", add: `http://localhost:3000/auth/confirm`

For production, you'll need to add your production URLs as well.

### 5. Run the Application

```bash
npm run dev
```

Your Puros app should now be running at `http://localhost:3000` with full authentication functionality!

## Features

- **Landing Page**: Beautiful cigar-themed landing page with signup/login buttons
- **Authentication**: Complete signup and login flow with Supabase
- **Protected Routes**: Home page is protected and requires authentication
- **User Dashboard**: Personalized dashboard with placeholder content for future features
- **Responsive Design**: Works great on desktop and mobile devices

## Next Steps

The authentication system is now complete! You can extend the app by:

- Adding cigar review functionality
- Creating a cigar database
- Building community features
- Adding user profiles
- Implementing search and filtering

## Troubleshooting

If you encounter issues:

1. Make sure your `.env.local` file is in the project root
2. Verify your Supabase credentials are correct
3. Check that your Supabase project is active
4. Ensure you've configured the redirect URLs in Supabase settings

For more help, check the [Supabase documentation](https://supabase.com/docs) or [Next.js documentation](https://nextjs.org/docs). 