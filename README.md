# Awar Abdulkarim - Professional Portfolio

A modern, professional portfolio website with automated LinkedIn profile sync and speaking engagement showcase.

## Features

### 🎨 Modern UI/UX

- **Enhanced Typography** - Large, bold headlines with improved hierarchy
- **Glassmorphism Design** - Backdrop blur effects and layered depth
- **Micro-interactions** - Smooth hover states and animations
- **Profile Image** - GitHub avatar with floating animation and glow effect
- **Stats Counter** - Dynamic experience/project metrics
- **Better Spacing** - Generous padding and consistent vertical rhythm
- **Responsive Design** - Optimized for all devices

### 🔄 Automated LinkedIn Sync

- **Automatic CV updates** from LinkedIn during each build
- No manual profile.yml editing required
- Scheduled daily sync + manual trigger option
- Preserves custom achievements and technology tags
- See [LinkedIn Sync Guide](.github/LINKEDIN_SYNC.md) for setup

### 🎤 Speaking Engagements

- **Dynamic Sessionize integration** showing upcoming events and sessions
- "Next Speaking Engagement" section with live data
- Professional presentation of "Places I'm Speaking At" and "What I'm Speaking About"
- Direct link to Sessionize profile

### 🎨 Professional Design

- **Clean black & gold theme**
- **No emojis** - professional SVG icons throughout
- Smooth animations and transitions
- Fully mobile-responsive
- Optimized for performance

### 📄 Pages

1. **Home** - Hero section, experience timeline, GitHub projects
2. **Speaking** - Sessionize integration with upcoming events and sessions
3. **CV** - Auto-synced from LinkedIn with timestamp
4. **Socials** - Professional networking links

## Quick Start

### Prerequisites

- Ruby 3.1+
- Bundler
- Node.js 20+ (for LinkedIn sync)
- Proxycurl API key (for automated sync)

### Local Development

```bash
# Install dependencies
bundle install
npm install

# Run locally
bundle exec jekyll serve

# View at http://localhost:4000
```

### LinkedIn Sync Setup

1. Get API key from [Proxycurl](https://nubela.co/proxycurl/)
2. Add to GitHub Secrets as `PROXYCURL_API_KEY`
3. Workflow runs automatically on push and daily at 2 AM UTC

**Local testing:**

```bash
export PROXYCURL_API_KEY="your_key"
export LINKEDIN_PROFILE_URL="https://www.linkedin.com/in/notawar"
npm run sync-linkedin
```

See detailed instructions: [LinkedIn Sync Guide](.github/LINKEDIN_SYNC.md)

## File Structure

```
/
├── index.html                    # Home page
├── speaking/index.html           # Speaking engagements with Sessionize
├── resume.html                   # CV with LinkedIn auto-sync
├── socials/index.html           # Professional networking
├── _data/
│   ├── profile.yml              # Auto-synced from LinkedIn
│   └── navigation.yml           # Site navigation
├── scripts/
│   └── sync-linkedin.js         # LinkedIn sync automation
├── .github/
│   ├── workflows/
│   │   └── build-and-deploy.yml # Automated build with sync
│   └── LINKEDIN_SYNC.md         # Detailed sync documentation
├── assets/
│   ├── css/style.scss           # Professional styling
│   └── js/main.js               # Interactive features
└── package.json                  # Node.js dependencies
```

## Automated Workflows

### Build and Deploy (`.github/workflows/build-and-deploy.yml`)

Runs on:

- Every push to main
- Daily at 2 AM UTC (scheduled)
- Manual trigger

Process:

1. Fetch LinkedIn profile data
2. Update `_data/profile.yml`
3. Commit changes (if any)
4. Build Jekyll site
5. Deploy to GitHub Pages

## Customization

### Update Speaking Profile

Edit the Sessionize script URLs in `speaking/index.html`:

```javascript
// Change the speaker ID
src="https://sessionize.com/api/speaker/events/YOUR_ID/1x1x3fb393x"
src="https://sessionize.com/api/speaker/sessions/YOUR_ID/1x1x3fb393x"
```

### Manual Profile Updates

If you want to add custom data not in LinkedIn:

Edit `_data/profile.yml` and add:

```yaml
experience:
  - position: "Your Role"
    company: "Company"
    achievements:
      - "Custom achievement not in LinkedIn"
    technologies: ["Tech1", "Tech2"]  # Manually curated
```

These will be preserved during sync!

## Deployment

### GitHub Pages with Custom Domain

1. DNS records already configured:
   - `awar.no` → ANAME → `notawar.github.io`
   - `www.awar.no` → CNAME → `notawar.github.io`
2. CNAME file in repository root: `awar.no`
3. Site available at: **<https://awar.no>**
4. GitHub Pages enforces HTTPS automatically

### GitHub Pages Setup

1. Push to main branch
2. Go to Settings → Pages
3. Source: GitHub Actions
4. Custom domain: awar.no (already configured)
5. Enforce HTTPS: ✓ (automatic)
6. Site deploys automatically

### Manual Deployment

```bash
bundle exec jekyll build
# Upload _site/ folder to your hosting
```

## Maintenance

### LinkedIn Profile Sync

- Updates automatically daily at 2 AM UTC
- Manual trigger available in Actions tab
- Check Actions tab for sync status and logs
- Costs: ~$99/month for Proxycurl (or use free tier with manual triggers)

### Sessionize Integration

- Automatically updates from your Sessionize profile
- No maintenance required
- Update your Sessionize profile to see changes on site

## Monitoring

- **Build status**: Check GitHub Actions tab
- **LinkedIn sync**: Look for "Auto-sync" commits
- **Last sync timestamp**: Visible on CV page
- **Deployment**: Automatic via GitHub Pages

## Cost Summary

- **GitHub Pages**: Free
- **Custom Domain**: awar.no (already owned)
- **Proxycurl API**:
  - Free: 10 credits/month (manual syncs only)
  - Basic: $99/month (daily syncs)

## Support

- **LinkedIn Sync**: See [LINKEDIN_SYNC.md](.github/LINKEDIN_SYNC.md)
- **Scripts**: See [scripts/README.md](scripts/README.md)
- **Sessionize**: [Sessionize Documentation](https://sessionize.com/playbook)
- **Jekyll**: [Jekyll Documentation](https://jekyllrb.com/docs/)

## Tech Stack

- **Jekyll** - Static site generator
- **GitHub Pages** - Hosting
- **GitHub Actions** - CI/CD automation
- **Proxycurl API** - LinkedIn data fetching
- **Sessionize API** - Speaking engagements
- **Node.js** - Build scripts
- **Ruby** - Jekyll runtime

## License

© 2025 Awar Abdulkarim. All rights reserved.

## Next Steps

1. **✅ Review Content**: All information in `_data/profile.yml` is real and current
2. **✅ Test Site**: Site builds successfully at <http://localhost:4002>
3. **📤 Deploy**: Push to GitHub to update your live site
4. **🚀 Share**: Your portfolio is now ready to share with employers/colleagues

## Site URLs

- **Local Development**: <http://localhost:4002>
- **Live Site**: <https://notawar.github.io> (once pushed to GitHub)
- **LinkedIn**: <https://www.linkedin.com/in/notawar/>
- **GitHub**: <https://github.com/NotAwar>

---

**Result**: A clean, professional portfolio that showcases your real experience and skills without any fake content or unnecessary complexity. Perfect for job applications, networking, and professional branding.
