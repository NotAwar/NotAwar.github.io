# LinkedIn Extended Content Site

This is a minimal GitHub Pages site designed to host extended versions of LinkedIn posts. It addresses LinkedIn's character limitations by providing a platform for in-depth technical content that links back to original LinkedIn posts.

## Features

- **Focused Purpose**: Exclusively for extending LinkedIn posts - no blogging, projects, or other content
- **Minimal Structure**: Only essential pages and components
- **Easy Content Creation**: Simple script to create new extended posts
- **Mobile Responsive**: Works well on all device sizes

## Overview

This site is built using:

- [Jekyll](https://jekyllrb.com/) - Static site generator
- [GitHub Pages](https://pages.github.com/) - Hosting platform
- [Minima](https://github.com/jekyll/minima) - Base theme (customized)

## Purpose

LinkedIn's character limits make it difficult to share in-depth technical content. This site serves as an extension to my LinkedIn posts, allowing me to provide:

- Detailed explanations of complex topics
- Complete code examples and implementations
- Additional resources and references

## Directory Structure

- `_linkedin_extended/` - Extended versions of LinkedIn posts
- `assets/` - Images, CSS, and other static files
- `_layouts/` - Custom layouts for the site
- `_includes/` - Reusable components
- `scripts/` - Utility scripts for content creation

## Local Development

1. Install Ruby and Jekyll:

```bash
gem install jekyll bundler
```

2. Clone the repository:

```bash
git clone https://github.com/NotAwar/NotAwar.github.io.git
cd NotAwar.github.io
```

3. Install dependencies:

```bash
bundle install
```

4. Run the site locally:

```bash
bundle exec jekyll serve
```

5. Open your browser at `http://localhost:4000`

## Creating a New Extended Post

Use the provided Python script to create a new LinkedIn extended post:

```bash
python scripts/create-linkedin-post.py
```

Follow the prompts to enter post details, then edit the generated file.

## License

This project is open source and available under the [MIT License](LICENSE).

