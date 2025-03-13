---
layout: page
title: LinkedIn Extended Posts
permalink: /linkedin-extended/
description: In-depth explorations of topics I share on LinkedIn
---

# LinkedIn Extended Posts

LinkedIn's character limits often prevent sharing in-depth technical content. Here you'll find expanded versions of selected LinkedIn posts with:

- Comprehensive code examples
- Detailed technical explanations
- Step-by-step tutorials
- Additional resources and references

{% assign linkedin_posts = site.linkedin_extended | sort: "date" | reverse %}

{% if linkedin_posts.size > 0 %}
<div class="linkedin-extended-grid">
  {% for post in linkedin_posts %}
  <div class="extended-post-card">
    <h2><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h2>
    
    <div class="post-meta">
      <span class="post-date">{{ post.date | date: site.date_format }}</span>
      {% if post.reading_time %} • {{ post.reading_time }} min read{% endif %}
    </div>
    
    <div class="linkedin-indicator">
      <img src="/assets/images/linkedin-logo.png" alt="LinkedIn" class="linkedin-mini-icon">
      <span>Extends <a href="{{ post.linkedin_url }}" target="_blank">LinkedIn post</a></span>
    </div>
    
    <p class="post-excerpt">{{ post.excerpt | strip_html | truncatewords: 30 }}</p>
    
    <div class="read-more">
      <a href="{{ post.url | relative_url }}" class="read-more-link">Read full article →</a>
    </div>
  </div>
  {% endfor %}
</div>
{% else %}
<div class="notice-box">
  <p>No LinkedIn extended posts yet. Check back soon or visit my <a href="{{ site.linkedin.profile_url }}" target="_blank">LinkedIn profile</a> for my latest updates.</p>
</div>
{% endif %}

<div class="linkedin-profile-link">
  <a href="{{ site.linkedin.profile_url }}" target="_blank" class="linkedin-btn">
    <img src="/assets/images/linkedin-logo.png" alt="LinkedIn" class="linkedin-icon">
    <span>Connect on LinkedIn</span>
  </a>
</div>
