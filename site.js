const labels = {
  ko: {
    services: '서비스', planning: '장기 로드맵', tutoring: '튜터링', camp: '섬머캠프', application: '지원 전략 · 첨삭',
    testimonials: '후기', blogs: '인사이트', about: '소개', contact: '문의', consult: '상담 예약',
    tagline: '학생의 가능성을 세계의 기준으로 준비합니다.', navigate: '바로가기', connect: '연락하기'
  },
  en: {
    services: 'Services', planning: 'Long-term planning', tutoring: 'Tutoring', camp: 'Summer camp', application: 'Application support',
    testimonials: 'Testimonials', blogs: 'Insights', about: 'About', contact: 'Contact', consult: 'Book a consultation',
    tagline: 'Preparing each student’s potential for the world stage.', navigate: 'Navigate', connect: 'Connect'
  }
};

function currentLanguage() {
  try { return localStorage.getItem('mep-language') === 'en' ? 'en' : 'ko'; } catch { return 'ko'; }
}

class SiteHeader extends HTMLElement {
  connectedCallback() {
    const lang = currentLanguage();
    const t = labels[lang];
    this.innerHTML = `
      <a class="skip-link" href="#main">Skip to main content</a>
      <header class="site-header">
        <div class="nav-shell">
          <a class="brand" href="/" aria-label="My EDU Prep home"><img src="/assets/logo.webp" alt="My EDU Prep"></a>
          <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav"><span class="sr-only">Menu</span><span></span><span></span></button>
          <nav class="site-nav" id="site-nav" aria-label="Primary navigation">
            <details class="nav-services">
              <summary>${t.services}</summary>
              <div class="nav-dropdown">
                <a href="/long-term-planning/">${t.planning}</a>
                <a href="/tutoring/">${t.tutoring}</a>
                <a href="/summer-camp/">${t.camp}</a>
                <a href="/application-support/">${t.application}</a>
              </div>
            </details>
            <a href="/testimonials/">${t.testimonials}</a>
            <a href="/blogs/">${t.blogs}</a>
            <a href="/about/">${t.about}</a>
            <div class="language-switch" aria-label="Language">
              <button type="button" data-lang-button="ko" aria-pressed="${lang === 'ko'}">KR</button>
              <button type="button" data-lang-button="en" aria-pressed="${lang === 'en'}">EN</button>
            </div>
            <a class="nav-cta" href="/contact/">${t.consult}</a>
          </nav>
        </div>
      </header>`;
  }
}

class SiteFooter extends HTMLElement {
  connectedCallback() {
    const lang = currentLanguage();
    const t = labels[lang];
    this.innerHTML = `
      <footer class="site-footer">
        <div class="wrap footer-top">
          <div class="footer-brand"><img src="/assets/logo.webp" alt="My EDU Prep"><p>${t.tagline}</p></div>
          <div class="footer-nav">
            <div><strong>${t.services}</strong><a href="/long-term-planning/">${t.planning}</a><a href="/tutoring/">${t.tutoring}</a><a href="/summer-camp/">${t.camp}</a><a href="/application-support/">${t.application}</a></div>
            <div><strong>${t.navigate}</strong><a href="/testimonials/">${t.testimonials}</a><a href="/blogs/">${t.blogs}</a><a href="/about/">${t.about}</a><a href="/contact/">${t.contact}</a></div>
            <div><strong>${t.connect}</strong><a href="mailto:info@myeduprep.com">Email</a><a href="https://www.instagram.com/myeduprep/" target="_blank" rel="noopener">Instagram</a><a href="https://blog.naver.com/myeduprep" target="_blank" rel="noopener">Naver Blog</a><a href="https://www.youtube.com/@uk0uh" target="_blank" rel="noopener">YouTube</a></div>
          </div>
        </div>
        <div class="wrap footer-bottom"><p>© <span data-year></span> My EDU Prep. All rights reserved.</p><a href="#top">Back to top ↑</a></div>
      </footer>`;
  }
}

customElements.define('site-header', SiteHeader);
customElements.define('site-footer', SiteFooter);

function setLanguage(lang, reload = false) {
  document.body.dataset.lang = lang;
  document.documentElement.lang = lang;
  try { localStorage.setItem('mep-language', lang); } catch {}
  document.querySelectorAll('[data-lang-button]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.langButton === lang)));
  const title = document.body.dataset[`title${lang === 'ko' ? 'Ko' : 'En'}`];
  const description = document.body.dataset[`description${lang === 'ko' ? 'Ko' : 'En'}`];
  if (title) document.title = title;
  if (description) document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  if (reload) window.location.reload();
}

const initialLanguage = currentLanguage();
setLanguage(initialLanguage);

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.site-nav');
menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  navigation?.classList.toggle('open', !open);
  document.body.classList.toggle('menu-open', !open);
});
navigation?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  menuButton?.setAttribute('aria-expanded', 'false');
  navigation?.classList.remove('open');
  document.body.classList.remove('menu-open');
}));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    menuButton?.setAttribute('aria-expanded', 'false');
    navigation?.classList.remove('open');
    document.body.classList.remove('menu-open');
  }
});
document.querySelectorAll('[data-lang-button]').forEach((button) => button.addEventListener('click', () => setLanguage(button.dataset.langButton, true)));

const path = window.location.pathname;
document.querySelectorAll('.site-nav a').forEach((link) => {
  if (link.getAttribute('href') === path) link.classList.add('active');
});

document.querySelectorAll('[data-year]').forEach((item) => { item.textContent = String(new Date().getFullYear()); });
const revealItems = document.querySelectorAll('[data-reveal]');
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('visible'));
} else {
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  }), { threshold: .1, rootMargin: '0px 0px -30px' });
  revealItems.forEach((item) => observer.observe(item));
}
