# Personal Website

Source code for [https://awar.no](https://awar.no), now built with Astro + React and deployed as a static site to GitHub Pages.

## Tech Stack

- Astro (static site generation)
- React (interactive islands)
- GitHub Actions (build, deploy, and LinkedIn profile sync)

## Local Development

1. Install dependencies:
   - `npm install`
2. Run development server:
   - `npm run dev`
3. Build production output:
   - `npm run build`
4. Preview production build:
   - `npm run preview`

## LinkedIn Sync

Profile data is stored in `src/data/generated-profile.json` and can be automatically synced from LinkedIn.

### Quick Start

- For manual sync: `npm run sync-linkedin`
- For development with auto-sync: `npm run dev:sync`
- For build with auto-sync: `npm run build:sync`

### Configuration

- Copy `.env.example` to `.env.local`
- Add your `PROXYCURL_API_KEY` from https://nubela.co/proxycurl/
- See [PROFILE_SETUP.md](./PROFILE_SETUP.md) for detailed configuration

### GitHub Actions Auto-Sync

- Add `PROXYCURL_API_KEY` to GitHub Secrets
- Workflow automatically syncs profile on push to main and daily at 2 AM UTC
- Update is committed to `src/data/generated-profile.json`

## Deployment

- GitHub Actions workflow: `.github/workflows/build-and-deploy.yml`
- Deploy target: GitHub Pages (artifact from `dist/`)
- CNAME: `awar.no`

