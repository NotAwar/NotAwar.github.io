---
layout: linkedin_extended
title: "Cloud Native Day Oslo 2025 – My Notes & Takeaways"
date: 2025-03-14
categories: [CloudNative, Kubernetes, DevEx]
image: "/assets/images/posts/cloud-native-day-oslo.jpg"
linkedin_url: "https://www.linkedin.com/posts/notawar_hashtag-activity-id"
linkedin_published_date: "14/03/2025"
reading_time: 7
author: Awar
---

# Cloud Native Day Oslo 2025 – My Notes & Takeaways  

This article expands on my [LinkedIn post]({{ page.linkedin_url }}) about **[Cloud Native Day Oslo 2025](https://oslo.cloudnativeday.no/)**. While the LinkedIn post introduced some key insights, here I'll go deeper into the sessions I attended and the takeaways I found most valuable.  

---

## **Introduction**  

**[Cloud Native Day Oslo](https://oslo.cloudnativeday.no/)** took place on March 13, 2025, at **Rebel, Oslo**, bringing together over **250 attendees** and **30 expert speakers** from the cloud-native ecosystem. The event was packed with discussions on Kubernetes, FinOps, platform engineering, and cloud-native development.  

Since the event had split tracks, I couldn't attend everything, but I took detailed notes on the sessions I did attend. Below is a chronological breakdown of the talks, including my thoughts, highlights, and key takeaways.  

---

## **Platform Engineering with Amazon EKS at Scale with Schibsted**  
**Presented by:** Yves Hwang and Birgir Stefansson  

I was curious about how **Schibsted**, as a massive company, manages Kubernetes at scale. Birgir did a great job simplifying their approach:  

🔹 **Key Takeaways:**  
- They structured their platform using an **Internal Developer Platform (IdP)** model.  
- A dedicated **Main IdP team** provisions services/products for subsidiaries.  
- Terms like **"Golden Road" and "Paved Path"** came up often—pre-planned, structured approaches to platform engineering.  
- The sheer scale of their operation is impressive.  

---

## **Lessons Learned While Building the Vipps MobilePay Cloud Platform**  
**Presented by:** Kaja Hannestad and Erik Paulsen Skålerud  

This talk was **relevant to my day job**, covering **FinOps, platform engineering, and internal tooling**.  

🔹 **Key Takeaways:**  
- A **small IdP team (11 people)** supports **100-200+ developers** across **four countries**.  
- They leverage **Azure API Management (APIM)** for minimizing downtime.  
- **Backstage for internal tooling** – something I’ve been considering recently.  
- **Karpenter** came up during Q&A as well as in later sessions.  

---

## **Sopra Steria: From DevOps to DevEx – Building High-Impact Internal Developer Platforms (IdP) Teams** *(Sponsored Segment)*  
**Presented by:** Eirik Holgernes  

I've heard a version of this talk before, but it remains valuable. **DevEx** (Developer Experience) was a key theme:  
- Treat your **IdP as a product** and actively **market it internally**.  
- Streamline onboarding and developer workflows.  

---

## **AMA: CNCF & Open Source**  
**Panelists:** Roberth Strand, Jessica Andersson, and Marcus Noble  

This was **my favorite session of the day**! As someone relatively new to CNCF contributions, I loved the discussion on:  
- How to become a **CNCF Ambassador or Maintainer**.  
- The process of **creating a CNCF project**.  
- Community-driven open-source challenges.  

---

## **Crossplane for Platform Engineers**  
**Presented by:** Steven Borrelli  

Big news: **Crossplane V2** is launching at **KubeCon**!  

🔹 **Major Changes in Crossplane V2:**  
- **XRDS, XR, and compositions** work differently.  
- **Functions now operate in a completely new way** compared to older versions.  
- The Crossplane I first encountered a few years ago has **evolved significantly**.  

---

## **Kueue: Fair and Efficient Job Scheduling for Kubernetes**  
**Presented by:** Jean-Baptiste Leroy  

This was a **showcase of [Kueue](https://kueue.sigs.k8s.io/)** for job scheduling in Kubernetes. Nothing groundbreaking, but a **great deep dive into its capabilities**.  

---

## **Lightning Talk: 5 Pitfalls of Building Developer Platforms**  
**Presented by:** Jessica Andersson  

*Sigh*... yeah. This one **hit hard**. The title says it all. Let’s not talk about this one. 😅  

---

## **Don't Be a Victim of Your Own Success: A Backstage Survival Guide**  
**Presented by:** Scott Guymer  

Yet another **Backstage-focused** talk, this time by **Philips**, sharing how they scaled their internal developer portal.  

---

## **Moving Out of Systems Programming into Kubernetes: Is It Time to Swap Golang for Rust?**  
**Presented by:** Scott Gerring and Ramon Lopez Narvaez  

I hadn’t planned on attending this one, but **I'm glad I did**!  

🔹 **Key Takeaways:**  
- Rust is **gaining traction** in Kubernetes development.  
- Trade-offs between **Go vs. Rust** were well presented.  
- A great **intro to Rust for Kubernetes developers**.  

---

## **Final Thoughts & Key Takeaways**  

📌 **Themes Across Multiple Talks:**  
✅ **IdP is becoming central to platform engineering** – with an increasing focus on **DevEx**.  
✅ **Backstage is emerging as a dominant internal tooling platform**.  
✅ **Platform engineering strategies like "Golden Road" and "Paved Path"** are gaining adoption.  
✅ **Crossplane V2 will be a game-changer** for **infrastructure orchestration**.  
✅ **Rust vs. Go is now an active debate in Kubernetes development**.  

Overall, **[Cloud Native Day Oslo 2025](https://oslo.cloudnativeday.no/)** was a fantastic experience, and I’m looking forward to seeing how these trends evolve over the next year. 🚀  

---

## **Additional Resources**  

- [Cloud Native Day Oslo Official Website](https://oslo.cloudnativeday.no/)  
- [Cloud Native Computing Foundation (CNCF)](https://www.cncf.io/)  
- [Crossplane Official Docs](https://crossplane.io/docs/)  

---

## **Conclusion**  

Cloud Native Day Oslo 2025 reinforced the importance of **platform engineering, DevEx, and cloud-native tooling**. If you work in **Kubernetes, FinOps, or platform engineering**, these are the key trends to watch.  

What are your thoughts? Let’s discuss! 🚀  