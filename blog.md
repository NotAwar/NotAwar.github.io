---
layout: page
title: Blog
permalink: /blog/
---

# Blog Posts

{% for post in site.posts %}
## [{{ post.title }}]({{ post.url | relative_url }})
{{ post.date | date: "%d/%m/%Y" }}

{{ post.excerpt }}

[Read more]({{ post.url | relative_url }})

---
{% endfor %}
