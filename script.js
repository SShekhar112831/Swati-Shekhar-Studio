/*
  Script for Swati Shekhar Portfolio
  - Handles: mobile nav, smooth scroll, gallery build + filtering, lightbox, contact helper
*/

// --------------------------
// Config: Update these values
// --------------------------
const CONTACT = {
  email: "email@example.com",
  linkedin: "#",
  instagram: "#",
  whatsapp: "", // e.g., https://wa.me/911234567890
  resumeUrl: "assets/resume/Swati_Shekhar_Resume.pdf"
};

// Artwork dataset (replace with real images when available)
const ARTWORKS = [
  { id: "madhubani-1", title: "Peacock in Bloom", form: "Madhubani", src: "assets/images/placeholder.svg", year: 2023, medium: "Acrylic on Canvas", size: "12×16 in" },
  { id: "warli-1", title: "Village Dance", form: "Warli", src: "assets/images/placeholder.svg", year: 2022, medium: "Ink on Paper", size: "A3" },
  { id: "mandala-1", title: "Symmetry Calm", form: "Mandala", src: "assets/images/placeholder.svg", year: 2024, medium: "Fineliner on Paper", size: "A4" },
  { id: "zentangle-1", title: "Flow State", form: "Zentangle", src: "assets/images/placeholder.svg", year: 2021, medium: "Ink on Paper", size: "A4" },
  { id: "calligraphy-1", title: "Devanagari Grace", form: "Calligraphy", src: "assets/images/placeholder.svg", year: 2023, medium: "Ink & Brush Pen", size: "A3" },
  { id: "madhubani-2", title: "Floral Harmony", form: "Madhubani", src: "assets/images/placeholder.svg", year: 2022, medium: "Watercolor on Paper", size: "12×12 in" },
  { id: "mandala-2", title: "Golden Ratio", form: "Mandala", src: "assets/images/placeholder.svg", year: 2023, medium: "Ink on Paper", size: "A4" }
];

const CATEGORIES = ["All", ...Array.from(new Set(ARTWORKS.map(a => a.form)))];

// --------------------------
// Utilities
// --------------------------
function $(sel, ctx = document) { return ctx.querySelector(sel); }
function $all(sel, ctx = document) { return Array.from(ctx.querySelectorAll(sel)); }

function createEl(tag, className, attrs = {}) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "text") { el.textContent = v; }
    else if (k === "html") { el.innerHTML = v; }
    else { el.setAttribute(k, v); }
  }
  return el;
}

function mailtoUrl(to, subject, body) {
  const params = new URLSearchParams({ subject, body });
  return `mailto:${to}?${params.toString()}`;
}

// --------------------------
// Navigation & Scrolling
// --------------------------
function initNav() {
  const toggle = $('.nav-toggle');
  const menu = $('#nav-menu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Close on link click (mobile)
  $all('a', menu).forEach(a => a.addEventListener('click', () => {
    menu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }));

  // Smooth scroll for in-page anchors
  $all('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.replaceState(null, '', targetId);
      }
    });
  });
}

// --------------------------
// Gallery (filters + cards)
// --------------------------
function buildFilters() {
  const bar = $('#gallery-filters');
  if (!bar) return;
  CATEGORIES.forEach((cat, idx) => {
    const btn = createEl('button', '', { role: 'tab', 'aria-selected': String(idx === 0), 'data-filter': cat });
    btn.textContent = cat;
    btn.addEventListener('click', () => applyFilter(cat, btn));
    bar.appendChild(btn);
  });
}

function buildGallery(items) {
  const grid = $('#gallery-grid');
  const empty = $('#gallery-empty');
  if (!grid || !empty) return;
  grid.innerHTML = '';

  if (!items.length) {
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  items.forEach(item => {
    const card = createEl('article', 'art-card', { tabindex: '0' });
    const fig = createEl('figure', '');
    const img = createEl('img', '', { src: item.src, alt: `${item.title} — ${item.form}`, loading: 'lazy' });
    img.addEventListener('error', () => { img.src = 'assets/images/placeholder.svg'; });
    fig.appendChild(img);
    card.appendChild(fig);

    const body = createEl('div', 'art-body');
    const title = createEl('h3', 'art-title', { text: item.title });
    const meta = createEl('p', 'art-meta', { text: `${item.form} • ${item.medium} • ${item.year}` });
    const actions = createEl('div', 'art-actions');
    const viewBtn = createEl('button', 'btn btn-outline', { type: 'button' });
    viewBtn.textContent = 'View';
    viewBtn.addEventListener('click', () => openLightbox(item));
    actions.appendChild(viewBtn);
    body.appendChild(title);
    body.appendChild(meta);
    body.appendChild(actions);
    card.appendChild(body);

    card.addEventListener('keypress', e => { if (e.key === 'Enter') openLightbox(item); });
    grid.appendChild(card);
  });
}

function applyFilter(category, clickedBtn) {
  $all('#gallery-filters [role="tab"]').forEach(btn => btn.setAttribute('aria-selected', 'false'));
  if (clickedBtn) clickedBtn.setAttribute('aria-selected', 'true');
  const filtered = category === 'All' ? ARTWORKS : ARTWORKS.filter(a => a.form === category);
  buildGallery(filtered);
}

// --------------------------
// Lightbox
// --------------------------
let lightboxEl = null;
function ensureLightbox() {
  if (lightboxEl) return lightboxEl;
  lightboxEl = createEl('div', 'lightbox', { role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Artwork preview' });
  const content = createEl('div', 'lightbox-content');
  const img = createEl('img', '');
  const close = createEl('button', 'lightbox-close', { type: 'button' });
  close.textContent = '✕';
  close.addEventListener('click', () => lightboxEl.classList.remove('open'));
  lightboxEl.addEventListener('click', e => { if (e.target === lightboxEl) lightboxEl.classList.remove('open'); });
  content.appendChild(img);
  content.appendChild(close);
  lightboxEl.appendChild(content);
  document.body.appendChild(lightboxEl);
  return lightboxEl;
}

function openLightbox(item) {
  const lb = ensureLightbox();
  $('img', lb).src = item.src;
  lb.classList.add('open');
}

// --------------------------
// Contact helpers
// --------------------------
function hydrateContact() {
  const emailLink = $('#contact-email');
  const linkedinLink = $('#contact-linkedin');
  const instaLink = $('#contact-instagram');
  if (emailLink && CONTACT.email) emailLink.href = `mailto:${CONTACT.email}`;
  if (emailLink && CONTACT.email) emailLink.textContent = CONTACT.email;
  if (linkedinLink && CONTACT.linkedin) linkedinLink.href = CONTACT.linkedin;
  if (instaLink && CONTACT.instagram) instaLink.href = CONTACT.instagram;

  const resumeLinks = $all('a[href*="Swati_Shekhar_Resume.pdf"]');
  resumeLinks.forEach(a => a.href = CONTACT.resumeUrl);
}

function initContactForm() {
  const form = $('#contact-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#name').value.trim();
    const email = $('#email').value.trim();
    const message = $('#message').value.trim();
    const subject = `Inquiry from ${name}`;
    const body = `${message}\n\nReply to: ${email}`;
    if (!CONTACT.email) return alert('Email not configured yet.');
    window.location.href = mailtoUrl(CONTACT.email, subject, body);
  });
}

// --------------------------
// Misc
// --------------------------
function setYear() {
  const el = $('#year');
  if (el) el.textContent = new Date().getFullYear();
}

// --------------------------
// Init
// --------------------------
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  hydrateContact();
  buildFilters();
  buildGallery(ARTWORKS);
  applyFilter('All');
  initContactForm();
  setYear();
});


