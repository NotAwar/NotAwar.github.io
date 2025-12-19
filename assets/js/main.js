// Main JavaScript for enhanced user experience
document.addEventListener('DOMContentLoaded', function() {
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Intersection Observer for scroll-triggered animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    }, observerOptions);

    // Observe sections for scroll animations
    document.querySelectorAll('.projects-section, .linkedin-section, .contact-section').forEach(section => {
        observer.observe(section);
    });

    // Add loading animation to project cards
    function animateProjectCards() {
        const projectCards = document.querySelectorAll('.project-card');
        projectCards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1 + 0.1}s`;
        });
    }

    // Add loading animation to LinkedIn cards
    function animateLinkedInCards() {
        const linkedinCards = document.querySelectorAll('.linkedin-card');
        linkedinCards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.2 + 0.2}s`;
        });
    }

    // Initialize animations
    animateProjectCards();
    animateLinkedInCards();

    // Enhanced navigation hover effects
    const navLinks = document.querySelectorAll('.page-link');
    navLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 4px 12px rgba(255, 215, 0, 0.2)';
        });
        
        link.addEventListener('mouseleave', function() {
            // Don't reset transform/shadow if this is the active page
            if (!this.classList.contains('active')) {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = 'none';
            }
        });
    });

    // Enhanced button click effects
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', function(e) {
            // Create ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                if (ripple.parentNode) {
                    ripple.remove();
                }
            }, 600);
        });
    });

    // Add parallax effect to hero section
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const heroSection = document.querySelector('.hero-section');
        
        if (heroSection) {
            const rate = scrolled * -0.3;
            heroSection.style.transform = `translateY(${rate}px)`;
        }
    });

    // Dark mode toggle (future enhancement)
    function initDarkModeToggle() {
        const toggleButton = document.querySelector('.dark-mode-toggle');
        if (toggleButton) {
            toggleButton.addEventListener('click', () => {
                document.body.classList.toggle('light-mode');
                localStorage.setItem('theme', 
                    document.body.classList.contains('light-mode') ? 'light' : 'dark'
                );
            });
        }
    }

    initDarkModeToggle();

    // Subtle particle effects on hover for special elements
    function createParticles(element) {
        const rect = element.getBoundingClientRect();
        const particleContainer = document.createElement('div');
        particleContainer.className = 'gold-particles';
        particleContainer.style.position = 'absolute';
        particleContainer.style.top = rect.top + 'px';
        particleContainer.style.left = rect.left + 'px';
        particleContainer.style.width = rect.width + 'px';
        particleContainer.style.height = rect.height + 'px';
        document.body.appendChild(particleContainer);
        
        // Reduced particle count for subtlety
        for (let i = 0; i < 4; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * rect.width + 'px';
            particle.style.top = Math.random() * rect.height + 'px';
            particleContainer.appendChild(particle);
        }
        
        setTimeout(() => {
            if (particleContainer.parentNode) {
                particleContainer.remove();
            }
        }, 1500);
    }

    // Add subtle particle effects only to primary elements
    document.querySelectorAll('.project-card, .hero-buttons .primary-btn').forEach(element => {
        element.addEventListener('mouseenter', () => createParticles(element));
    });

    // Konami code easter egg
    let konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // ↑↑↓↓←→←→BA
    let konamiInput = [];
    
    document.addEventListener('keydown', function(e) {
        konamiInput.push(e.keyCode);
        
        if (konamiInput.length > konamiCode.length) {
            konamiInput.shift();
        }
        
        if (JSON.stringify(konamiInput) === JSON.stringify(konamiCode)) {
            document.body.classList.add('konami-activated');
            
            // Create celebration particles
            for (let i = 0; i < 50; i++) {
                setTimeout(() => {
                    const particle = document.createElement('div');
                    particle.style.position = 'fixed';
                    particle.style.left = Math.random() * window.innerWidth + 'px';
                    particle.style.top = Math.random() * window.innerHeight + 'px';
                    particle.style.width = '10px';
                    particle.style.height = '10px';
                    particle.style.background = `hsl(${Math.random() * 360}, 100%, 70%)`;
                    particle.style.borderRadius = '50%';
                    particle.style.pointerEvents = 'none';
                    particle.style.zIndex = '10000';
                    particle.style.animation = 'particleFloat 3s ease-out forwards';
                    document.body.appendChild(particle);
                    
                    setTimeout(() => {
                        if (particle.parentNode) {
                            particle.remove();
                        }
                    }, 3000);
                }, i * 50);
            }
            
            // Reset after 5 seconds
            setTimeout(() => {
                document.body.classList.remove('konami-activated');
                konamiInput = [];
            }, 5000);
        }
    });

    // Console message for developers
    console.log(`
    ┌─────────────────────────────────────┐
    │  Thanks for checking out my site!  │
    │  Try the Konami code for a surprise │
    │  ↑↑↓↓←→←→BA                          │
    │  Let's connect:                     │
    │  GitHub: @NotAwar                   │
    │  LinkedIn: /in/notawar              │
    └─────────────────────────────────────┘
    `);
});

// CSS for ripple effect and animations
const style = document.createElement('style');
style.textContent = `
    .btn {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    @keyframes particleFloat {
        to {
            transform: translateY(-100px);
            opacity: 0;
        }
    }
    
    .particle {
        position: absolute;
        width: 3px;
        height: 3px;
        background: var(--gold-primary);
        border-radius: 50%;
        animation: particleFloat 1.5s ease-out forwards;
    }
    
    .konami-activated {
        animation: rainbow 2s linear infinite;
    }
    
    @keyframes rainbow {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
    }
`;
document.head.appendChild(style);
