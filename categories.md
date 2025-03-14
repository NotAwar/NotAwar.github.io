---
layout: page
title: Blog Categories
permalink: /categories/
---

# Blog Categories

Browse posts by category:

## Skills & Topics

<div class="categories-container">
  {% assign skill_categories = site.posts | map: "categories" | flatten | uniq %}
  {% for category in skill_categories %}
    <div class="category-card" id="{{ category | slugify }}">
      <h3>{{ category }}</h3>
      <ul>
        {% for post in site.posts %}
          {% if post.categories contains category %}
            <li>
              <a href="{{ post.url }}">{{ post.title }}</a>
              <span class="post-date">{{ post.date | date: "%d/%m/%Y" }}</span>
            </li>
          {% endif %}
        {% endfor %}
      </ul>

      {% if site.data.categories.skills contains category %}
        <div class="linkedin-skill-badge">
          <img src="/assets/images/linkedin-logo.png" alt="LinkedIn Skill" class="linkedin-mini-icon">
          <span>LinkedIn Verified Skill</span>
        </div>
      {% endif %}
    </div>
  {% endfor %}
</div>

## Company Experience

<div class="categories-container">
  {% if site.data.categories.companies %}
    {% for company in site.data.categories.companies %}
      {% assign company_posts = site.posts | where: "linkedin_experience", company %}
      {% if company_posts.size > 0 %}
        <div class="category-card company-card">
          <h3>{{ company }}</h3>
          <ul>
            {% for post in company_posts %}
              <li>
                <a href="{{ post.url }}">{{ post.title }}</a>
                <span class="post-date">{{ post.date | date: "%d/%m/%Y" }}</span>
              </li>
            {% endfor %}
          </ul>
          <div class="linkedin-company-badge">
            <img src="/assets/images/linkedin-logo.png" alt="LinkedIn Company" class="linkedin-mini-icon">
            <span>Based on LinkedIn Experience</span>
          </div>
        </div>
      {% endif %}
    {% endfor %}
  {% endif %}
</div>
