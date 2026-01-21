// HackFate - Interactive Scripts
// Dark Cyberpunk Theme Interactions

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initSmoothScroll();
    initScrollAnimations();
    initGlitchEffect();
    initGridAnimation();
});

// Mobile Navigation Toggle
function initNavigation() {
    const toggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    const nav = document.querySelector('.nav');

    if (toggle && navLinks) {
        toggle.addEventListener('click', () => {
            toggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                toggle.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }

    // Nav background on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });
}

// Smooth Scrolling for Anchor Links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const navHeight = document.querySelector('.nav').offsetHeight;
                const targetPosition = target.offsetTop - navHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Scroll-triggered Animations
function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');

                // Animate stats with counting effect
                if (entry.target.classList.contains('stat-value')) {
                    animateValue(entry.target);
                }
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll(
        '.research-card, .tech-card, .about-stat, .section-title, .stat'
    );

    animatedElements.forEach(el => {
        el.classList.add('animate-ready');
        observer.observe(el);
    });
}

// Animate numeric values
function animateValue(element) {
    const text = element.textContent;
    const num = parseInt(text);

    if (isNaN(num) || element.dataset.animated) return;
    element.dataset.animated = 'true';

    const duration = 1500;
    const start = performance.now();
    const suffix = text.replace(/[\d,]/g, '');

    function update(currentTime) {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(num * easeOut);

        element.textContent = current + suffix;

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = text;
        }
    }

    requestAnimationFrame(update);
}

// Enhanced Glitch Effect
function initGlitchEffect() {
    const glitchElement = document.querySelector('.glitch');
    if (!glitchElement) return;

    // Random glitch intensity bursts
    setInterval(() => {
        if (Math.random() > 0.95) {
            glitchElement.style.setProperty('--glitch-intensity', '1');
            setTimeout(() => {
                glitchElement.style.setProperty('--glitch-intensity', '0.5');
            }, 100);
        }
    }, 100);
}

// Animated Grid Background
function initGridAnimation() {
    const heroBg = document.querySelector('.hero-bg');
    if (!heroBg) return;

    // Create canvas for grid animation
    const canvas = document.createElement('canvas');
    canvas.classList.add('grid-canvas');
    canvas.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        opacity: 0.15;
    `;
    heroBg.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let animationId;

    function resize() {
        canvas.width = heroBg.offsetWidth;
        canvas.height = heroBg.offsetHeight;
    }

    resize();
    window.addEventListener('resize', resize);

    // Grid properties
    const gridSize = 40;
    let time = 0;

    function drawGrid() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const cols = Math.ceil(canvas.width / gridSize) + 1;
        const rows = Math.ceil(canvas.height / gridSize) + 1;

        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 0.5;

        // Vertical lines
        for (let i = 0; i < cols; i++) {
            const x = i * gridSize;
            const wave = Math.sin(time * 0.02 + i * 0.1) * 2;

            ctx.beginPath();
            ctx.moveTo(x + wave, 0);
            ctx.lineTo(x - wave, canvas.height);
            ctx.globalAlpha = 0.3 + Math.sin(time * 0.01 + i * 0.2) * 0.2;
            ctx.stroke();
        }

        // Horizontal lines
        for (let i = 0; i < rows; i++) {
            const y = i * gridSize;
            const wave = Math.sin(time * 0.02 + i * 0.1) * 2;

            ctx.beginPath();
            ctx.moveTo(0, y + wave);
            ctx.lineTo(canvas.width, y - wave);
            ctx.globalAlpha = 0.3 + Math.sin(time * 0.01 + i * 0.2) * 0.2;
            ctx.stroke();
        }

        // Random highlight points
        if (Math.random() > 0.98) {
            const x = Math.floor(Math.random() * cols) * gridSize;
            const y = Math.floor(Math.random() * rows) * gridSize;

            ctx.fillStyle = '#00f0ff';
            ctx.globalAlpha = 0.8;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        time++;
        animationId = requestAnimationFrame(drawGrid);
    }

    // Only animate when hero is visible
    const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                drawGrid();
            } else {
                cancelAnimationFrame(animationId);
            }
        });
    }, { threshold: 0 });

    heroObserver.observe(heroBg);
}

// Scroll indicator hide on scroll
document.addEventListener('scroll', () => {
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        if (window.scrollY > 100) {
            scrollIndicator.style.opacity = '0';
        } else {
            scrollIndicator.style.opacity = '1';
        }
    }
});

// Research card expand/collapse
document.querySelectorAll('.research-card').forEach(card => {
    const content = card.querySelector('.research-content');
    const details = card.querySelector('.research-details');

    if (details) {
        // Add toggle functionality if needed
        card.addEventListener('click', (e) => {
            // Don't toggle if clicking a link or button
            if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') return;

            // Toggle expanded state (optional feature)
            // card.classList.toggle('expanded');
        });
    }
});

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    .animate-ready {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }

    .animate-in {
        opacity: 1;
        transform: translateY(0);
    }

    .research-card.animate-ready,
    .tech-card.animate-ready {
        transform: translateY(40px);
    }

    .stat.animate-ready {
        transform: translateY(20px);
    }

    /* Stagger animations for cards */
    .tech-card:nth-child(2).animate-ready { transition-delay: 0.1s; }
    .tech-card:nth-child(3).animate-ready { transition-delay: 0.2s; }
    .tech-card:nth-child(4).animate-ready { transition-delay: 0.3s; }

    .stat:nth-child(2).animate-ready { transition-delay: 0.1s; }
    .stat:nth-child(3).animate-ready { transition-delay: 0.2s; }

    .about-stat:nth-child(2).animate-ready { transition-delay: 0.15s; }
    .about-stat:nth-child(3).animate-ready { transition-delay: 0.3s; }

    .nav.scrolled {
        background: rgba(10, 10, 15, 0.98);
        backdrop-filter: blur(20px);
    }
`;
document.head.appendChild(style);

// Console Easter egg
console.log(`
%c  _    _          _____ _  _______ _______  _______ ______
%c | |  | |   /\\   / ____| |/ /  ___|__   __|/ ______|  ____|
%c | |__| |  /  \\ | |    | ' /| |_     | |  | |__   | |__
%c |  __  | / /\\ \\| |    |  < |  _|    | |  |  __|  |  __|
%c | |  | |/ ____ \\ |____| . \\| |      | |  | |____ | |____
%c |_|  |_/_/    \\_\\_____|_|\\_\\_|      |_|  |______|______|
%c
%c "Truth cannot be approximated."
%c
%c Interested in exact computation? Contact: founder@hackfate.us
`,
'color: #00f0ff; font-weight: bold',
'color: #00f0ff; font-weight: bold',
'color: #00d4ff; font-weight: bold',
'color: #00b8ff; font-weight: bold',
'color: #009cff; font-weight: bold',
'color: #0080ff; font-weight: bold',
'color: #8888aa',
'color: #ff00aa; font-style: italic',
'color: #8888aa',
'color: #00ff88'
);
