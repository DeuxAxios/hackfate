// HackFate - Interactive Scripts
// Dark Cyberpunk Theme Interactions

// Utility: Throttle function for scroll performance
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Store interval/animation IDs for cleanup
let glitchIntervalId = null;
let gridAnimationId = null;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initSmoothScroll();
    initScrollAnimations();
    initGlitchEffect();
    initGridAnimation();
    initVisibilityHandler();
});

// Mobile Navigation Toggle
function initNavigation() {
    const toggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    const nav = document.querySelector('.nav');

    if (toggle && navLinks && nav) {
        toggle.addEventListener('click', () => {
            toggle.classList.toggle('active');
            navLinks.classList.toggle('active');
            toggle.setAttribute('aria-expanded', toggle.classList.contains('active'));
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                toggle.classList.remove('active');
                navLinks.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // Nav background on scroll (throttled for performance)
    window.addEventListener('scroll', throttle(() => {
        if (window.scrollY > 100) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    }, 100));
}

// Smooth Scrolling for Anchor Links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (!href || href === '#') {
                return;
            }
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const navElement = document.querySelector('.nav');
                const navHeight = navElement ? navElement.offsetHeight : 0;
                const targetPosition = target.offsetTop - navHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: prefersReducedMotion ? 'auto' : 'smooth'
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
                if (entry.target.classList.contains('stat')) {
                    const statValue = entry.target.querySelector('.stat-value');
                    if (statValue) {
                        animateValue(statValue);
                    }
                }
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll(
        '.research-card, .tech-card, .about-stat, .section-title, .stat'
    );

    if (prefersReducedMotion) {
        animatedElements.forEach(el => {
            el.classList.add('animate-in');
        });
        return;
    }

    animatedElements.forEach(el => {
        el.classList.add('animate-ready');
        observer.observe(el);
    });
}

// Animate numeric values (fixed to handle non-numeric values properly)
function animateValue(element) {
    const text = element.textContent.trim();

    // Skip non-numeric values like "O(k)", "95%+", infinity symbol
    if (element.dataset.animated) return;

    // Extract leading number if present
    const match = text.match(/^(\d+)/);
    if (!match) {
        // No leading number, skip animation
        element.dataset.animated = 'true';
        return;
    }

    const num = parseInt(match[1], 10);
    if (isNaN(num) || num === 0) {
        element.dataset.animated = 'true';
        return;
    }

    element.dataset.animated = 'true';
    const suffix = text.slice(match[1].length);
    const duration = 1500;
    const start = performance.now();

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

// Enhanced Glitch Effect (with cleanup)
function initGlitchEffect() {
    const glitchElement = document.querySelector('.glitch');
    if (!glitchElement || prefersReducedMotion) return;

    // Clear any existing interval
    if (glitchIntervalId) {
        clearInterval(glitchIntervalId);
    }

    // Random glitch intensity bursts
    glitchIntervalId = setInterval(() => {
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
    if (!heroBg || prefersReducedMotion) return;

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
        gridAnimationId = requestAnimationFrame(drawGrid);
    }

    // Only animate when hero is visible
    const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !document.hidden) {
                drawGrid();
            } else {
                if (gridAnimationId) {
                    cancelAnimationFrame(gridAnimationId);
                    gridAnimationId = null;
                }
            }
        });
    }, { threshold: 0 });

    heroObserver.observe(heroBg);
}

// Scroll indicator hide on scroll (throttled)
document.addEventListener('scroll', throttle(() => {
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.style.opacity = window.scrollY > 100 ? '0' : '1';
    }
}, 100));

// Visibility change handler for cleanup/restart
function initVisibilityHandler() {
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // Page is hidden - pause animations to save battery
            if (glitchIntervalId) {
                clearInterval(glitchIntervalId);
                glitchIntervalId = null;
            }
            if (gridAnimationId) {
                cancelAnimationFrame(gridAnimationId);
                gridAnimationId = null;
            }
        } else {
            // Page is visible - restart animations
            initGlitchEffect();
            // Grid animation will restart via IntersectionObserver
        }
    });
}

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
