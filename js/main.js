/* ============================================
   上海拓维智科信息科技有限公司 - 交互脚本
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // -- DOM 元素 --
    const header = document.getElementById('header');
    const nav = document.getElementById('nav');
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.querySelectorAll('.nav-link');
    const backToTop = document.getElementById('backToTop');
    const contactForm = document.getElementById('contactForm');
    const sections = document.querySelectorAll('section[id]');

    // ============================================
    // 导航栏滚动效果
    // ============================================
    function onScroll() {
        const scrollY = window.scrollY;

        // 导航栏阴影
        header.classList.toggle('scrolled', scrollY > 50);

        // 返回顶部按钮
        backToTop.classList.toggle('visible', scrollY > 500);

        // 导航高亮
        let current = '';
        sections.forEach(section => {
            const top = section.offsetTop - 100;
            const height = section.offsetHeight;
            if (scrollY >= top && scrollY < top + height) {
                current = section.getAttribute('id');
            }
        });
        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
        });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // 初始调用

    // ============================================
    // 移动端菜单
    // ============================================
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        nav.classList.toggle('open');
    });

    // 点击导航链接关闭菜单
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            nav.classList.remove('open');
        });
    });

    // 点击页面其他位置关闭菜单
    document.addEventListener('click', (e) => {
        if (!header.contains(e.target)) {
            menuToggle.classList.remove('active');
            nav.classList.remove('open');
        }
    });

    // ============================================
    // 返回顶部
    // ============================================
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ============================================
    // 滚动渐入动画
    // ============================================
    const fadeElements = document.querySelectorAll(
        '.service-card, .case-card, .stat-item, .about-text, .contact-form-wrapper, .contact-item'
    );
    fadeElements.forEach((el, i) => {
        el.classList.add('fade-in');
        if (i % 5 === 0) el.classList.add('delay-1');
        else if (i % 5 === 1) el.classList.add('delay-2');
        else if (i % 5 === 2) el.classList.add('delay-3');
        else if (i % 5 === 3) el.classList.add('delay-4');
        else el.classList.add('delay-5');
    });

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );

    fadeElements.forEach(el => observer.observe(el));

    // ============================================
    // 案例筛选
    // ============================================
    const filterBtns = document.querySelectorAll('.filter-btn');
    const caseCards = document.querySelectorAll('.case-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;

            caseCards.forEach(card => {
                if (filter === 'all' || card.dataset.category === filter) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });

    // ============================================
    // 数字滚动计数
    // ============================================
    const statNumbers = document.querySelectorAll('.stat-number');
    let statsAnimated = false;

    function animateStats() {
        if (statsAnimated) return;
        const statsSection = document.getElementById('about');
        if (!statsSection) return;
        const rect = statsSection.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.7 && rect.bottom > 0) {
            statsAnimated = true;
            statNumbers.forEach(el => {
                const target = +el.dataset.target;
                const duration = 2000;
                const startTime = performance.now();

                function update(now) {
                    const elapsed = now - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    // easeOutExpo
                    const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
                    el.textContent = Math.floor(eased * target);
                    if (progress < 1) requestAnimationFrame(update);
                }
                requestAnimationFrame(update);
            });
        }
    }

    window.addEventListener('scroll', animateStats, { passive: true });
    animateStats();

    // ============================================
    // 表单验证
    // ============================================
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        let valid = true;

        // 清除之前的错误
        contactForm.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
        contactForm.querySelectorAll('.form-error').forEach(el => el.remove());

        // 必填字段
        const requiredFields = [
            { id: 'name', msg: '请输入您的姓名' },
            { id: 'phone', msg: '请输入您的联系电话' },
            { id: 'message', msg: '请输入留言内容' }
        ];

        requiredFields.forEach(field => {
            const el = document.getElementById(field.id);
            if (!el.value.trim()) {
                valid = false;
                el.classList.add('error');
                showError(el, field.msg);
            }
        });

        // 手机号格式
        const phone = document.getElementById('phone');
        const phoneValue = phone.value.trim();
        if (phoneValue && !/^1[3-9]\d{9}$/.test(phoneValue)) {
            valid = false;
            phone.classList.add('error');
            showError(phone, '请输入正确的手机号码');
        }

        // 邮箱格式（可选字段）
        const email = document.getElementById('email');
        const emailValue = email.value.trim();
        if (emailValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
            valid = false;
            email.classList.add('error');
            showError(email, '请输入正确的邮箱地址');
        }

        if (valid) {
            showToast('留言提交成功，我们会尽快与您联系！');
            contactForm.reset();
        }
    });

    function showError(input, message) {
        const errorEl = document.createElement('p');
        errorEl.className = 'form-error';
        errorEl.textContent = message;
        errorEl.style.cssText = 'color: #ff4d4d; font-size: 0.8rem; margin-top: 4px;';
        input.parentElement.appendChild(errorEl);
    }

    // ============================================
    // Toast 提示
    // ============================================
    function showToast(message) {
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #1e90ff, #00d4ff);
            color: #fff;
            padding: 14px 32px;
            border-radius: 50px;
            font-size: 0.95rem;
            font-weight: 600;
            z-index: 9999;
            box-shadow: 0 8px 32px rgba(30, 144, 255, 0.4);
            animation: toastIn 0.4s ease, toastOut 0.4s ease 2.5s forwards;
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    // 动态注入 Toast 动画
    const toastStyle = document.createElement('style');
    toastStyle.textContent = `
        @keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(-20px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
        @keyframes toastOut { from { opacity: 1; } to { opacity: 0; } }
    `;
    document.head.appendChild(toastStyle);

    // ============================================
    // 粒子背景 Canvas
    // ============================================
    const canvas = document.getElementById('particleCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let animFrame;

        function resizeCanvas() {
            canvas.width = canvas.parentElement.offsetWidth;
            canvas.height = canvas.parentElement.offsetHeight;
        }

        class Particle {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.4;
                this.speedY = (Math.random() - 0.5) * 0.4;
                this.opacity = Math.random() * 0.5 + 0.2;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
                if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(30, 144, 255, ${this.opacity})`;
                ctx.fill();
            }
        }

        function createParticles(count) {
            particles = Array.from({ length: count }, () => new Particle());
        }

        function connectParticles() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(30, 144, 255, ${0.08 * (1 - dist / 120)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => { p.update(); p.draw(); });
            connectParticles();
            animFrame = requestAnimationFrame(animate);
        }

        function initParticles() {
            resizeCanvas();
            createParticles(60);
            cancelAnimationFrame(animFrame);
            animate();
        }

        window.addEventListener('resize', initParticles);
        initParticles();
    }
});
