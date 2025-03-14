---
layout: page
title: About
permalink: /about/
---

<div class="about-section">
  # About This Site

  LinkedIn's character limits make it challenging to explore complex technical topics in depth. This site hosts expanded versions of my LinkedIn posts, providing:

- Detailed technical explanations
- Complete code examples
- Step-by-step tutorials
- Additional resources and references

## About Me

  I'm a Senior Engineer at {{ site.data.about.current_position.company | default: "Sopra Steria" }} with expertise in cloud architecture and DevOps. I'm passionate about sharing knowledge and insights that help others solve complex technical problems.

  <div class="linkedin-badge-container">
    <div class="badge-base LI-profile-badge" data-locale="no_NO" data-size="large" data-theme="dark" data-type="HORIZONTAL" data-vanity="notawar" data-version="v1"><a class="badge-base__link LI-simple-link" href="https://no.linkedin.com/in/notawar?trk=profile-badge">Awar Abdulkarim</a></div>
  </div>

  <div class="tech-icons">
    {% if site.data.about.skills %}
      {% for skill in site.data.about.skills %}
        <span class="tech-icon">{{ skill }}</span>
      {% endfor %}
    {% else %}
      <span class="tech-icon">Cloud Architecture</span>
      <span class="tech-icon">DevOps</span>
      <span class="tech-icon">Kubernetes</span>
      <span class="tech-icon">Automation</span>
    {% endif %}
  </div>

## Connect With Me

  <div class="connect-buttons">
    <a href="{{ site.linkedin.profile_url }}" class="connect-btn linkedin-btn">LinkedIn</a>
    <a href="https://github.com/{{ site.github_username }}" class="connect-btn github-btn">GitHub</a>
  </div>
</div>
