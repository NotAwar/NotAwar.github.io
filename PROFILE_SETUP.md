# Profile Data Configuration

This document explains how the profile system works and how to configure it.

## Overview

The site uses a **single source of truth** for profile data: `src/data/generated-profile.json`

This file is generated from your LinkedIn profile using the Proxycurl API, but can also be manually edited or created.

## Quick Reference

- **Profile Data File**: `src/data/generated-profile.json`
- **Sync Script**: `npm run sync-linkedin`
- **Environment Setup**: See `.env.example`

## Setting Up LinkedIn Sync

### Option 1: Manual Sync (Recommended for Testing)

1. Get a Proxycurl API key:
   - Visit https://nubela.co/proxycurl/
   - Sign up for a free account
   - Copy your API key

2. Create `.env.local` in the project root:
   ```
   PROXYCURL_API_KEY=your-api-key-here
   LINKEDIN_PROFILE_URL=https://www.linkedin.com/in/your-profile
   ```

3. Run the sync script:
   ```bash
   npm run sync-linkedin
   ```

The script will:
- Fetch your LinkedIn profile data
- Transform it into the site's format
- Write to `src/data/generated-profile.json`
- Preserve any manually added `achievements` and `technologies` fields

### Option 2: Automatic Sync (GitHub Actions)

1. Add your Proxycurl API key to GitHub Secrets:
   - Go to your repository settings
   - Secrets and variables → Actions
   - Add `PROXYCURL_API_KEY`

2. The workflow (`.github/workflows/build-and-deploy.yml`) will:
   - Run daily at 2 AM UTC
   - Run on every push to main
   - Sync profile data and rebuild the site

## Manual Profile Creation

If you don't want to use LinkedIn sync, you can manually create `src/data/generated-profile.json`:

```json
{
  "name": "Your Name",
  "title": "Your Title",
  "headline": "Your Headline",
  "summary": "Your professional summary",
  "bio": "Short bio (max 200 chars)",
  "avatar_url": "https://...",
  "experience": [
    {
      "position": "Role",
      "company": "Company",
      "period": "Month Year - Month Year",
      "description": "What you did",
      "achievements": ["Achievement 1", "Achievement 2"],
      "technologies": ["Tech 1", "Tech 2"]
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "school": "School Name",
      "year": "2020 - 2024",
      "location": "Location",
      "description": "Optional description"
    }
  ],
  "skills": {
    "primary": ["Skill 1", "Skill 2"],
    "technical": ["Tech 1", "Tech 2"]
  },
  "current_focus": ["Focus Area 1", "Focus Area 2"],
  "contact": {
    "github": "https://github.com/username",
    "linkedin": "https://www.linkedin.com/in/username/",
    "sessionize": "https://sessionize.com/username"
  },
  "linkedin_posts": [],
  "metrics": {
    "years_experience": 5,
    "github_repos": 10,
    "linkedin_posts": 0,
    "github_contributions": 500
  }
}
```

## Development Workflow

1. **No API Key**: Uses fallback emergency profile with placeholder data
2. **With API Key**: Fetches real LinkedIn data on every build
3. **Preserves Custom Fields**: `achievements` and `technologies` are preserved during sync

## Profile Validation

The profile is validated when loaded to ensure:
- All required fields exist
- Data types are correct (arrays are arrays, etc.)
- Missing fields get fallback values from emergency profile

If validation fails, the site gracefully uses the emergency profile with a message to run `npm run sync-linkedin`.

## Troubleshooting

**Profile not updating?**
- Check if `PROXYCURL_API_KEY` is set
- Run `npm run sync-linkedin` manually to see detailed logs
- Verify `src/data/generated-profile.json` exists and is valid JSON

**Build failing due to profile?**
- The emergency profile ensures the site always builds
- Check browser console for any data-related warnings

**GitHub Actions sync not working?**
- Verify `PROXYCURL_API_KEY` is in GitHub Secrets
- Check the workflow run logs in Actions tab
