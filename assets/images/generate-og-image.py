#!/usr/bin/env python3
from PIL import Image, ImageDraw, ImageFont
import os

# Create image with exact dimensions
width, height = 1200, 630
img = Image.new('RGB', (width, height), color='#0D0D0D')
draw = ImageDraw.Draw(img)

# Draw gradient-like background
for i in range(height):
    brightness = int(26 + (i/height * 10))  # Gradient from #1A to slightly lighter
    color = (brightness, brightness, brightness)
    draw.rectangle([(0, i), (width, i+1)], fill=color)

# Load logo
try:
    logo = Image.open('logo.png')
    # Resize logo to 280x280
    logo = logo.resize((280, 280), Image.Resampling.LANCZOS)
    # Position logo on the left
    img.paste(logo, (80, 175), logo if logo.mode == 'RGBA' else None)
except Exception as e:
    print(f"Warning: Could not load logo: {e}")

# Draw text (using default font since we don't have Inter installed)
try:
    # Try to use a system font
    title_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 96)
    subtitle_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 42)
    desc_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 28)
    footer_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 32)
except:
    # Fallback to default
    title_font = ImageFont.load_default()
    subtitle_font = ImageFont.load_default()
    desc_font = ImageFont.load_default()
    footer_font = ImageFont.load_default()

# Gold color
gold = (255, 215, 0)
white = (255, 255, 255)
gray = (224, 224, 224)

# Text content starting at x=400 (after logo)
x_start = 400
y_start = 150

# Draw title with gold gradient effect (simplified as solid gold)
draw.text((x_start, y_start), "Awar Abdulkarim", fill=gold, font=title_font)

# Draw subtitle
draw.text((x_start, y_start + 120), "Cloud Engineer & Tech Enthusiast", fill=white, font=subtitle_font)

# Draw description
draw.text((x_start, y_start + 185), "Building new solutions", fill=gray, font=desc_font)

# Draw footer
draw.text((x_start, y_start + 260), "awar.no", fill=gold, font=footer_font)

# Save with exact dimensions
img.save('og-image.png', 'PNG', optimize=True)
print(f"Generated og-image.png: {width}x{height}")
