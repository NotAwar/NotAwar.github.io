---
layout: page
title: CV
permalink: /cv/
---

<div class="cv-gold">
  <header class="cv-header">
    <h1>Awar Abdulkarim</h1>
    <p class="position">Senior Cloud Engineer | Competency Lead for Cloud Native</p>
  </header>

  <section class="cv-section">
    <h2>Summary</h2>
    <p>Senior Cloud Engineer with expertise in cloud-native technologies, DevOps practices, and architecture design. Currently serving as Competency Lead for Cloud Native at Sopra Steria, focusing on innovative solutions in the cloud space.</p>
  </section>

  <div class="linkedin-badge-container">
    <div class="badge-base LI-profile-badge" data-locale="no_NO" data-size="large" data-theme="dark" data-type="HORIZONTAL" data-vanity="notawar" data-version="v1">
      <a class="badge-base__link LI-simple-link" href="https://no.linkedin.com/in/notawar?trk=profile-badge">Awar Abdulkarim</a>
    </div>
  </div>

  <section class="cv-section">
    <h2>Work Experience</h2>
    {% for job in site.data.cv.work %}
    <div class="experience">
      <h3>{{ job.position }}</h3>
      <p class="company">{{ job.company }}</p>
      <p class="date">{{ job.startDate }} - {{ job.endDate }}</p>
      <p>{{ job.description }}</p>
    </div>
    {% endfor %}
  </section>

  <section class="cv-section">
    <h2>Technical Skills</h2>
    <div class="skills-list">
      <span>Cloud Architecture</span>
      <span>Azure</span>
      <span>Kubernetes</span>
      <span>Docker</span>
      <span>CI/CD</span>
      <span>Python</span>
      <span>C++</span>
      <span>VHDL</span>
    </div>
  </section>

  <footer class="cv-footer">
    <a href="https://github.com/NotAwar" class="gold-btn">View GitHub Projects</a>
  </footer>
</div>
