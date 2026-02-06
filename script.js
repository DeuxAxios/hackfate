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
    initActiveNav();
    initBackToTop();
    loadInventorySections();
    loadBenchmarkSection();
});

// ---------- Data-driven content loaders ----------
let inventoryCache = null;
let benchmarkCache = null;

async function loadInventoryData() {
    if (inventoryCache) return inventoryCache;
    const response = await fetch('reports/inventory_public.json');
    if (!response.ok) throw new Error('Unable to load inventory_public.json');
    inventoryCache = await response.json();
    return inventoryCache;
}

async function loadBenchmarkData() {
    if (benchmarkCache) return benchmarkCache;
    const response = await fetch('reports/benchmarks_curated.json');
    if (!response.ok) throw new Error('Unable to load benchmarks_curated.json');
    benchmarkCache = await response.json();
    return benchmarkCache;
}

function renderTags(tags = []) {
    return tags
        .slice(0, 3)
        .map(tag => `<span class="research-tag">${tag}</span>`)
        .join('');
}

function renderTierBadge(tier) {
    const cls = tier === 'Proved' ? 'tag-verified' : tier === 'Validated' ? 'tag-validated' : '';
    return `<span class="research-tag ${cls}">${tier}</span>`;
}

function renderSystemBadge(system) {
    return `<span class="research-tag">${system}</span>`;
}

function safeSummary(text) {
    return text || 'Summary available on request.';
}

async function loadInventorySections() {
    try {
        const data = await loadInventoryData();
        renderInnovations(data);
        renderTechnology(data);
        renderResearch(data);
        renderProofs(data);
    } catch (err) {
        console.warn('Inventory load failed:', err);
    }
}

function renderInnovations(data) {
    const target = document.querySelector('[data-inventory-grid]');
    if (!target) return;
    const items = data.filter(item => item.disclosure === 'Public');
    const sorted = items.sort((a, b) => a.system.localeCompare(b.system) || a.title.localeCompare(b.title));
    target.innerHTML = sorted.map(item => `
        <article class="catalog-card">
            <div class="catalog-card-header">${renderSystemBadge(item.system)} ${renderTierBadge(item.tier)}</div>
            <h3>${item.title}</h3>
            <p>${safeSummary(item.summary)}</p>
            <div class="catalog-tags">${renderTags(item.tags)}</div>
            ${item.public_link ? `<a class="catalog-link" href="${item.public_link}">Evidence &rarr;</a>` : `<span class="catalog-link">Evidence available on request</span>`}
        </article>
    `).join('');
}

function renderTechnology(data) {
    const target = document.querySelector('[data-tech-grid]');
    if (!target) return;
    const publicItems = data.filter(item => item.disclosure === 'Public');
    const systems = Array.from(new Set(publicItems.map(i => i.system)));
    target.innerHTML = systems.map(system => {
        const items = publicItems.filter(i => i.system === system);
        return `
            <div class="tech-card">
                <div class="tech-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 2v20M2 12h20"/></svg>
                </div>
                <h3>${system}</h3>
                <p class="tech-tagline">${items.length} public items</p>
                <ul class="tech-features">
                    ${items.map(i => `<li>${i.title}</li>`).join('')}
                </ul>
                <p class="tech-note">${items[0] ? safeSummary(items[0].summary) : ''}</p>
            </div>
        `;
    }).join('');
}

function renderResearch(data) {
    const target = document.querySelector('[data-research-grid]');
    if (!target) return;
    const items = data.filter(i => i.disclosure === 'Public' && (i.tier === 'Proved' || i.tier === 'Validated'));
    target.innerHTML = items.map(item => `
        <div class="research-card">
            <div class="research-header">${renderSystemBadge(item.system)} ${renderTierBadge(item.tier)}</div>
            <h3 class="research-title">${item.title}</h3>
            <p class="research-headline">${safeSummary(item.summary)}</p>
            <div class="research-stats">
                <div class="stat">
                    <span class="stat-value">${item.validation_type || 'evidence'}</span>
                    <span class="stat-label">Validation</span>
                </div>
                <div class="stat">
                    <span class="stat-value">${item.date || '2026'}</span>
                    <span class="stat-label">Last update</span>
                </div>
            </div>
            ${item.public_link ? `<a href="${item.public_link}" class="btn btn-primary">View Evidence</a>` : `<span class="research-tag">Evidence on request</span>`}
        </div>
    `).join('');
}

function renderProofs(data) {
    const target = document.querySelector('[data-proof-grid]');
    const stats = document.querySelector('[data-proof-stats]');
    if (!target && !stats) return;
    const proved = data.filter(i => i.tier === 'Proved' && i.disclosure === 'Public');
    if (stats) {
        const total = proved.length;
        stats.textContent = `${total} proof${total === 1 ? '' : 's'} tracked in inventory.`;
    }
    if (!target) return;
    if (!proved.length) {
        target.innerHTML = '<p class="no-results visible">No public proofs listed yet.</p>';
        return;
    }
    target.innerHTML = proved.map(item => `
        <div class="proof-card" data-type="proof">
            <div class="proof-card-header">
                <h3>${item.title}</h3>
                <span class="proof-type-badge coq">Proved</span>
            </div>
            <p>${safeSummary(item.summary)}</p>
            ${item.public_link ? `<a href="${item.public_link}" class="proof-link">View Proof</a>` : '<span class="proof-link">Proof available on request</span>'}
        </div>
    `).join('');
}

async function loadBenchmarkSection() {
    const target = document.querySelector('[data-benchmark-grid]');
    const meta = document.querySelector('[data-benchmark-meta]');
    if (!target) return;
    try {
        const data = await loadBenchmarkData();
        if (meta && data.length) {
            meta.textContent = `Curated benchmark set · Updated ${data[0].date}`;
        }
        target.innerHTML = data.map(entry => `
            <article class="benchmark-card">
                <h3>${entry.name}</h3>
                <p>${entry.variant}</p>
                <span class="benchmark-stat">${entry.value} ${entry.unit}</span>
                <p class="benchmark-note">${entry.notes || ''}</p>
                <p class="benchmark-meta">${entry.hardware}</p>
            </article>
        `).join('');
    } catch (err) {
        console.warn('Benchmark load failed:', err);
        target.innerHTML = '<p class="benchmark-footnote">Benchmarks unavailable right now.</p>';
    }
}

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

// Highlight active navigation link based on current page
function initActiveNav() {
    const navLinks = document.querySelectorAll('.nav-links a[href]');
    const path = window.location.pathname.split('/').pop() || 'index.html';
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === path) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        }
    });
}

// Back to top visibility toggle
function initBackToTop() {
    const backToTop = document.querySelector('.back-to-top');
    if (!backToTop) return;
    const toggle = throttle(() => {
        backToTop.classList.toggle('visible', window.scrollY > 400);
    }, 100);
    window.addEventListener('scroll', toggle);
    toggle();
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
        '.research-card, .tech-card, .overview-card, .catalog-card, .benchmark-card, .about-stat, .section-title, .stat'
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
