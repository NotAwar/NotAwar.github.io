#!/usr/bin/env python3
"""
LinkedIn Extended Post Creator
Creates extended content linked to your LinkedIn posts
"""

import os
import datetime
import re
import sys
import shutil

def slugify(text):
    """Convert text to slug format for filenames."""
    text = text.lower()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    return text.strip('-')

def main():
    print("\n=== LinkedIn Extended Post Creator ===\n")
    
    # Get post information
    title = input("Post title: ")
    if not title:
        print("Error: Title is required")
        return 1
    
    categories = input("Categories (comma separated): ")
    categories = [cat.strip() for cat in categories.split(',') if cat.strip()]
    categories_str = "[" + ", ".join(f'"{cat}"' for cat in categories) + "]"
    
    linkedin_url = input("LinkedIn post URL: ")
    if not linkedin_url:
        print("Error: LinkedIn URL is required")
        return 1
    
    today = datetime.datetime.now()
    date_str = input(f"Post date (YYYY-MM-DD) [{today.strftime('%Y-%m-%d')}]: ")
    date_str = date_str if date_str else today.strftime("%Y-%m-%d")
    
    linkedin_date = input(f"LinkedIn published date (DD/MM/YYYY) [{today.strftime('%d/%m/%Y')}]: ")
    linkedin_date = linkedin_date if linkedin_date else today.strftime("%d/%m/%Y")
    
    reading_time = input("Estimated reading time in minutes [5]: ")
    reading_time = reading_time if reading_time else "5"
    
    # Create slug and filename
    slug = slugify(title)
    filename = f"{date_str}-{slug}.md"
    directory = "_linkedin_extended"
    filepath = os.path.join(directory, filename)
    
    # Check if directory exists, create if not
    if not os.path.exists(directory):
        os.makedirs(directory)
        print(f"Created directory: {directory}")
    
    # Check if file exists
    if os.path.exists(filepath):
        overwrite = input(f"File {filepath} already exists. Overwrite? (y/n) [n]: ")
        if overwrite.lower() != 'y':
            print("Operation cancelled.")
            return 0
    
    # Read template
    template_path = os.path.join("_templates", "linkedin-extended-post.md")
    if not os.path.exists(template_path):
        print(f"Error: Template file not found at {template_path}")
        print("Creating template directory and template file...")
        
        # Create templates directory if it doesn't exist
        os.makedirs("_templates", exist_ok=True)
        
        # Create template file with default content
        default_template = """---
layout: linkedin_extended
title: "Your Extended Post Title"
date: YYYY-MM-DD
categories: [category1, category2]
image: "/assets/images/posts/your-image.jpg"
linkedin_url: "https://www.linkedin.com/posts/notawar_hashtag-activity-id"
linkedin_published_date: "DD/MM/YYYY"
reading_time: 5
author: Awar
---

# Your Extended Post Title

This article expands on my [LinkedIn post]({{ page.linkedin_url }}) about [topic]. While the LinkedIn post introduced the core concepts, here I'll explore the topic in greater depth.

## Introduction

[Provide context about why this topic matters and why you're expanding on it]

## Key Points Expanded

[Elaborate on the key points from your LinkedIn post with more details, examples, and insights]

## Technical Details

[Include code examples, diagrams, or technical explanations that wouldn't fit in a LinkedIn post]

```python
# Example code snippet
def example_function():
    return "This is where you can include code examples"
```

## Real-World Applications

[Share case studies, practical applications, or real-world scenarios]

## Additional Resources

- [Resource 1](https://example.com)
- [Resource 2](https://example.com)
- [Resource 3](https://example.com)

## Conclusion

[Summarize key takeaways and include a call to action]
"""
        with open(template_path, 'w', encoding='utf-8') as f:
            f.write(default_template)
        print(f"Created template file: {template_path}")
    
    # Read template
    with open(template_path, 'r', encoding='utf-8') as f:
        template = f.read()
    
    # Create directory if it doesn't exist
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    
    # Replace placeholders
    content = template.replace('Your Extended Post Title', title)
    content = content.replace('YYYY-MM-DD', date_str)
    content = content.replace('[category1, category2]', categories_str)
    content = content.replace('your-image.jpg', f"{slug}.jpg")
    content = content.replace('https://www.linkedin.com/posts/notawar_hashtag-activity-id', linkedin_url)
    content = content.replace('DD/MM/YYYY', linkedin_date)
    content = content.replace('reading_time: 5', f'reading_time: {reading_time}')
    
    # Write file
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"\n✅ Created new LinkedIn extended post: {filepath}")
    
    # Create image directory if needed
    image_dir = os.path.join("assets", "images", "posts")
    os.makedirs(image_dir, exist_ok=True)
    
    site_url = "https://NotAwar.github.io"
    extension_url = f"{site_url}/linkedin-extended/{slug}/"
    
    print("\nNext steps:")
    print(f"1. Add a featured image to: /assets/images/posts/{slug}.jpg")
    print("2. Edit the post content in your favorite editor")
    print("3. Test locally with: bundle exec jekyll serve")
    print(f"4. Add this link to your LinkedIn post: {extension_url}")
    print(f"   Suggested text: 'For complete code examples and detailed explanation, read the extended version: {extension_url}'")
    
    return 0

if __name__ == "__main__":
    site_url = "https://NotAwar.github.io"
    sys.exit(main())
