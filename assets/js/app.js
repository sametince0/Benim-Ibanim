        // AOS Animation
        AOS.init({
            duration: 700,
            easing: 'ease-out-cubic',
            once: true,
            offset: 80
        });

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

        // Parallax effect for hero section (optional, if you want a subtle effect)
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const hero = document.querySelector('.hero');
            if (hero && scrolled < hero.offsetHeight) {
                const rate = scrolled * -0.3;
                hero.style.transform = `translateY(${rate}px)`;
            }
        });

        // Enhanced hover effects for feature cards
        document.querySelectorAll('.feature-card').forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-6px) scale(1.02)';
                this.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            });

            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        });

        // Add stagger animation to cards on scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -30px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe all animated elements
        document.querySelectorAll('.screenshot-card, .feature-card, .step-card').forEach(el => {
            el.style.opacity = '0'; /* Başlangıçta gizle */
            el.style.transform = 'translateY(20px)'; /* Başlangıçta biraz aşağıda */
            observer.observe(el);
        });

        // Add floating animation variance (if desired, currently not active for hero-logo for cleaner look)
        // document.querySelectorAll('.hero-logo').forEach((logo, index) => {
        //     logo.style.animationDelay = `${index * 0.5}s`;
        // });

        // Smooth entrance animations
        window.addEventListener('load', () => {
            document.body.style.opacity = '1';
        });
                
        const lightbox = GLightbox({
            selector: '.glightbox'
        });
        