---
layout: home
title: Home
---

# Extended LinkedIn Content

This site hosts expanded versions of my LinkedIn posts, providing in-depth technical explanations, complete code examples, and additional resources that don't fit LinkedIn's character limits.

{% include linkedin-sync-status.html %}

## Latest Extended Posts

<div class="linkedin-extended-grid">
  {% assign linkedin_posts = site.linkedin_extended | sort: "date" | reverse | limit: 3 %}
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

{% if site.linkedin_extended.size > 3 %}
<div class="view-all-link-container">
  <a href="/linkedin-extended/" class="view-all-link">View all extended posts →</a>
</div>
{% endif %}

{% if linkedin_posts.size == 0 %}
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
