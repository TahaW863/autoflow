/* ===================================
   AUTOFLOW - Enhanced Animations
   =================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize 3D background effect
    init3DBackground();

    // Initialize scroll animations
    initScrollAnimations();

    // Initialize hero animations
    initHeroAnimations();

    // Initialize navbar scroll effect
    initNavbarScroll();

    // Initialize smooth scroll for anchor links
    initSmoothScroll();
});

/**
 * 3D Parallax Background with Depth Effect
 */
function init3DBackground() {
    const canvas = document.getElementById('mesh-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    // Mouse position for 3D effect
    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;

    // 3D Grid settings
    const gridSize = 40;
    const perspective = 800;
    const points = [];

    // Create 3D grid points
    function createGrid() {
        points.length = 0;
        const cols = Math.ceil(width / gridSize) + 4;
        const rows = Math.ceil(height / gridSize) + 4;

        for (let i = -2; i < cols; i++) {
            for (let j = -2; j < rows; j++) {
                points.push({
                    x: i * gridSize,
                    y: j * gridSize,
                    z: 0,
                    baseZ: 0,
                    wave: Math.random() * Math.PI * 2
                });
            }
        }
    }

    createGrid();

    // 3D projection function
    function project(x, y, z) {
        const centerX = width / 2;
        const centerY = height / 2;

        // Add mouse-based rotation
        const rotateX = (targetMouseY - height / 2) / height * 0.3;
        const rotateY = (targetMouseX - width / 2) / width * 0.3;

        // Rotate around Y axis
        const cosY = Math.cos(rotateY);
        const sinY = Math.sin(rotateY);
        let x1 = (x - centerX) * cosY - z * sinY;
        let z1 = (x - centerX) * sinY + z * cosY;

        // Rotate around X axis
        const cosX = Math.cos(rotateX);
        const sinX = Math.sin(rotateX);
        let y1 = (y - centerY) * cosX - z1 * sinX;
        let z2 = (y - centerY) * sinX + z1 * cosX;

        // Perspective projection
        const scale = perspective / (perspective + z2 + 200);

        return {
            x: centerX + x1 * scale,
            y: centerY + y1 * scale,
            scale: scale,
            z: z2
        };
    }

    // Draw the 3D grid
    function drawGrid(time) {
        // Update point heights with waves
        points.forEach((point, i) => {
            const distX = point.x - targetMouseX;
            const distY = point.y - targetMouseY;
            const dist = Math.sqrt(distX * distX + distY * distY);

            // Wave effect from mouse
            const wave = Math.sin(dist * 0.01 - time * 0.003) * 30;

            // Ripple from mouse position
            const ripple = Math.max(0, 1 - dist / 300) * 60;

            point.z = wave + ripple;
        });

        // Sort by z for proper rendering
        const sortedPoints = [...points].sort((a, b) => {
            const pa = project(a.x, a.y, a.z);
            const pb = project(b.x, b.y, b.z);
            return pa.z - pb.z;
        });

        // Draw connections
        ctx.strokeStyle = 'rgba(0, 212, 170, 0.08)';
        ctx.lineWidth = 0.5;

        for (let i = 0; i < points.length; i++) {
            const p1 = points[i];
            const proj1 = project(p1.x, p1.y, p1.z);

            // Connect to nearby points
            for (let j = i + 1; j < points.length; j++) {
                const p2 = points[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist <= gridSize * 1.5) {
                    const proj2 = project(p2.x, p2.y, p2.z);

                    // Color based on depth
                    const avgZ = (proj1.z + proj2.z) / 2;
                    const alpha = Math.max(0.02, Math.min(0.15, 0.08 + avgZ / 500));

                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(0, 212, 170, ${alpha})`;
                    ctx.moveTo(proj1.x, proj1.y);
                    ctx.lineTo(proj2.x, proj2.y);
                    ctx.stroke();
                }
            }
        }

        // Draw points
        sortedPoints.forEach(point => {
            const proj = project(point.x, point.y, point.z);

            if (proj.x < -50 || proj.x > width + 50 || proj.y < -50 || proj.y > height + 50) return;

            const size = 1.5 * proj.scale + point.z / 30;
            const alpha = Math.max(0.2, Math.min(0.8, 0.4 + proj.z / 100));

            // Distance from mouse for glow effect
            const distFromMouse = Math.sqrt(
                Math.pow(proj.x - targetMouseX, 2) +
                Math.pow(proj.y - targetMouseY, 2)
            );

            const glowIntensity = Math.max(0, 1 - distFromMouse / 200);

            ctx.beginPath();
            ctx.arc(proj.x, proj.y, Math.max(0.5, size), 0, Math.PI * 2);

            if (glowIntensity > 0.1) {
                // Glowing point near mouse
                const gradient = ctx.createRadialGradient(
                    proj.x, proj.y, 0,
                    proj.x, proj.y, size * 3
                );
                gradient.addColorStop(0, `rgba(0, 212, 170, ${alpha + glowIntensity * 0.5})`);
                gradient.addColorStop(0.5, `rgba(0, 168, 255, ${glowIntensity * 0.3})`);
                gradient.addColorStop(1, 'transparent');
                ctx.fillStyle = gradient;
                ctx.arc(proj.x, proj.y, size * 3, 0, Math.PI * 2);
            } else {
                ctx.fillStyle = `rgba(0, 212, 170, ${alpha})`;
            }
            ctx.fill();
        });
    }

    // Draw floating orb layers with 3D depth
    function drawOrbs(time) {
        const layers = [
            {
                x: width * 0.3, y: height * 0.3,
                radius: 400, color: '0, 212, 170',
                depth: 0.3, opacity: 0.15
            },
            {
                x: width * 0.7, y: height * 0.5,
                radius: 300, color: '0, 168, 255',
                depth: 0.5, opacity: 0.1
            },
            {
                x: width * 0.2, y: height * 0.8,
                radius: 350, color: '139, 92, 246',
                depth: 0.7, opacity: 0.08
            }
        ];

        layers.forEach(layer => {
            // 3D parallax offset based on mouse
            const offsetX = (targetMouseX - width / 2) * layer.depth * 0.1;
            const offsetY = (targetMouseY - height / 2) * layer.depth * 0.1;

            // Floating animation
            const floatX = Math.sin(time * 0.0005 + layer.depth * 10) * 30;
            const floatY = Math.cos(time * 0.0003 + layer.depth * 5) * 20;

            const x = layer.x + offsetX + floatX;
            const y = layer.y + offsetY + floatY;

            const gradient = ctx.createRadialGradient(x, y, 0, x, y, layer.radius);
            gradient.addColorStop(0, `rgba(${layer.color}, ${layer.opacity})`);
            gradient.addColorStop(0.5, `rgba(${layer.color}, ${layer.opacity * 0.5})`);
            gradient.addColorStop(1, 'transparent');

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
        });
    }

    // Animation loop
    function animate(time) {
        ctx.clearRect(0, 0, width, height);

        // Smooth mouse following
        mouseX += (targetMouseX - mouseX) * 0.05;
        mouseY += (targetMouseY - mouseY) * 0.05;

        // Draw layers
        drawOrbs(time);
        drawGrid(time);

        requestAnimationFrame(animate);
    }

    // Mouse move handler
    window.addEventListener('mousemove', (e) => {
        targetMouseX = e.clientX;
        targetMouseY = e.clientY;
    });

    // Touch support
    window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            targetMouseX = e.touches[0].clientX;
            targetMouseY = e.touches[0].clientY;
        }
    });

    // Resize handler
    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        createGrid();
    });

    // Start animation
    animate(0);
}

/**
 * Scroll-triggered fade-in animations
 */
function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -100px 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    const scrollElements = document.querySelectorAll('.scroll-fade');
    scrollElements.forEach(el => observer.observe(el));
}

/**
 * Hero section fade-in animations
 */
function initHeroAnimations() {
    const fadeElements = document.querySelectorAll('.fade-in');

    fadeElements.forEach((el, index) => {
        setTimeout(() => {
            el.classList.add('visible');
        }, 100 + (index * 100));
    });
}

/**
 * Navbar background on scroll
 */
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            navbar.style.background = 'rgba(10, 10, 10, 0.95)';
            navbar.style.backdropFilter = 'blur(20px)';
        } else {
            navbar.style.background = 'linear-gradient(to bottom, rgba(10, 10, 10, 0.9) 0%, rgba(10, 10, 10, 0) 100%)';
            navbar.style.backdropFilter = 'blur(10px)';
        }
    });
}

/**
 * Smooth scroll for anchor links
 */
function initSmoothScroll() {
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
}

// Chat demo animation
function initChatDemo() {
    const messages = document.querySelectorAll('.chat-messages-demo .msg, .chat-messages-demo .product-card');

    messages.forEach((msg, index) => {
        msg.style.opacity = '0';
        msg.style.transform = 'translateY(20px)';

        setTimeout(() => {
            msg.style.transition = 'all 0.5s ease';
            msg.style.opacity = '1';
            msg.style.transform = 'translateY(0)';
        }, 500 + (index * 600));
    });
}

// Initialize chat demo when it comes into view
const chatObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            initChatDemo();
            chatObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.3 });

const chatDemo = document.querySelector('.chat-demo');
if (chatDemo) {
    chatObserver.observe(chatDemo);
}
