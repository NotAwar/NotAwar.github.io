---
layout: page
title: CV
permalink: /cv/
---

# Professional Experience

<div class="cv-download">
  <a href="/assets/files/Awar_CV.pdf" class="btn" download>Download CV as PDF</a>
</div>

{% include linkedin-sync-status.html %}

## Education

{% if site.data.cv.education %}
  {% for edu in site.data.cv.education %}
    <div class="education-entry">
      <h3>{{ edu.degree }}</h3>
      <p class="institution">{{ edu.institution }}</p>
      <p class="date">{{ edu.date }}</p>
      <p>{{ edu.description }}</p>
    </div>
  {% endfor %}
{% else %}
  <div class="education-entry">
    <h3>Master's Degree in Computer Science</h3>
    <p class="institution">University Name</p>
    <p class="date">2018 - 2020</p>
    <p>Specialized in Machine Learning and Distributed Systems. Thesis on "Optimizing Distributed Database Systems for High-Volume Transaction Processing".</p>
  </div>

  <div class="education-entry">
    <h3>Bachelor's Degree in Software Engineering</h3>
    <p class="institution">University Name</p>
    <p class="date">2014 - 2018</p>
    <p>Focus on software design patterns, algorithms, and data structures. Graduated with honors.</p>
  </div>
{% endif %}

## Professional Experience

{% if site.data.cv.work %}
  {% for job in site.data.cv.work %}
    <div class="experience-entry">
      <h3>{{ job.position }}</h3>
      <p class="company">{{ job.company }}</p>
      <p class="date">{{ job.date }}</p>
      {% if job.summary contains ". " %}
        <ul>
          {% assign summaries = job.summary | split: ". " %}
          {% for item in summaries %}
            {% if item != "" %}
              <li>{{ item }}{% unless item contains "." %}.{% endunless %}</li>
            {% endif %}
          {% endfor %}
        </ul>
      {% else %}
        <p>{{ job.summary }}</p>
      {% endif %}
    </div>
  {% endfor %}
{% else %}
  <div class="experience-entry">
    <h3>Senior Engineer</h3>
    <p class="company">Current Company</p>
    <p class="date">January 2021 - Present</p>
    <ul>
      <li>Lead architect for cloud-native platform serving 500,000+ users, improving system reliability by 35%</li>
      <li>Designed and implemented enterprise-wide CI/CD strategy, reducing deployment time from days to minutes</li>
      <li>Technical lead for team of 8 engineers, mentoring junior developers and establishing engineering best practices</li>
      <li>Partnered with product leadership to define technical roadmap aligned with business objectives</li>
      <li>Reduced cloud infrastructure costs by 40% through optimization and right-sizing initiatives</li>
    </ul>
  </div>

  <div class="experience-entry">
    <h3>Software Engineer</h3>
    <p class="company">Previous Company</p>
    <p class="date">June 2018 - December 2020</p>
    <ul>
      <li>Developed high-performance RESTful APIs handling 2M+ daily requests with 99.99% uptime</li>
      <li>Optimized critical database queries, reducing average response time by 40%</li>
      <li>Implemented OAuth 2.0 authentication system, enhancing security across all services</li>
      <li>Collaborated in agile team environment, leading sprint planning and retrospectives</li>
      <li>Created comprehensive monitoring and alerting system using ELK stack and Prometheus</li>
    </ul>
  </div>
{% endif %}

## Technical Skills

<div class="skills-section">
  {% if site.data.cv.skills %}
    {% assign skill_groups = site.data.cv.skills | group_by_exp: "item", "item | slice: 0" | sort: "name" %}
    {% for group in skill_groups %}
      <div class="skill-category">
        <h3>{{ group.name }}</h3>
        <p>{{ group.items | join: ", " }}</p>
      </div>
    {% endfor %}
  {% else %}
    <div class="skill-category">
      <h3>Programming Languages</h3>
      <p>Python, JavaScript/TypeScript, Java, Go, SQL</p>
    </div>

    <div class="skill-category">
      <h3>Frameworks & Libraries</h3>
      <p>React, Node.js, Django, Spring Boot, TensorFlow</p>
    </div>
    
    <div class="skill-category">
      <h3>Cloud & DevOps</h3>
      <p>AWS (Solutions Architect certified), Docker, Kubernetes, CI/CD, Terraform, GitOps</p>
    </div>
    
    <div class="skill-category">
      <h3>Databases</h3>
      <p>PostgreSQL, MongoDB, Redis, Elasticsearch, DynamoDB</p>
    </div>
  {% endif %}
</div>

## Certifications

{% if site.data.cv.certifications %}
  <ul class="certification-list">
    {% for cert in site.data.cv.certifications %}
      <li>{{ cert }}</li>
    {% endfor %}
  </ul>
{% else %}
  - AWS Certified Solutions Architect - Professional
  - Google Cloud Professional Data Engineer
  - Microsoft Certified: Azure Developer Associate
  - Certified Kubernetes Administrator (CKA)
  - Professional Scrum Master I
{% endif %}

## Contact Information

- Email: <your.email@example.com>
- LinkedIn: [linkedin.com/in/notawar](https://www.linkedin.com/in/notawar/)
- GitHub: [github.com/NotAwar](https://github.com/NotAwar)
