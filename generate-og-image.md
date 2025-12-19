# Generate OG Image

To create the social sharing image (og-image.png), follow these steps:

## Option 1: Using Browser Screenshot (Recommended)

1. Open `assets/images/og-image-template.html` in Chrome/Edge
2. Press F12 to open DevTools
3. Press Cmd+Shift+P (Mac) or Ctrl+Shift+P (Windows)
4. Type "screenshot" and select "Capture full size screenshot"
5. Save the image as `og-image.png` in the `assets/images/` folder

## Option 2: Using Online Tool

1. Visit https://www.screely.com/ or https://screenshot.rocks/
2. Upload the `og-image-template.html` file
3. Set dimensions to 1200x630
4. Download as `og-image.png`
5. Save to `assets/images/` folder

## Option 3: Using Command Line (macOS/Linux)

If you have Chrome installed:

```bash
cd /Users/awar/NotAwar.github.io/assets/images
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --headless \
  --screenshot=og-image.png \
  --window-size=1200,630 \
  og-image-template.html
```

After generating the image, commit and push:

```bash
git add assets/images/og-image.png
git commit -m "Add social sharing OG image with logo"
git push
```

The image will be used when sharing links on:
- Facebook
- Twitter/X
- LinkedIn
- Slack
- Discord
- And other social platforms
