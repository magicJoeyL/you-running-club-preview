const reel = document.querySelector('#hero-reel');
const slides = Array.from(reel.children);
const controls = document.querySelector('.reel-controls');
const count = document.querySelector('#reel-count');
const current = () => Math.max(0, Math.min(slides.length-1, Math.round(reel.scrollLeft / reel.clientWidth)));
function show(index, immediate = false) {
  const next = (index + slides.length) % slides.length;
  reel.scrollTo({left: next * reel.clientWidth, behavior: immediate || matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
}
function update() {
  const index = current();
  const label = String(index + 1).padStart(2, '0') + ' / ' + String(slides.length).padStart(2, '0');
  if (count.textContent !== label) count.textContent = label;
}
controls.hidden = false;
controls.querySelectorAll('[data-step]').forEach(button => button.addEventListener('click', () => show(current() + Number(button.dataset.step))));
reel.addEventListener('scroll', update, {passive: true});
reel.addEventListener('keydown', event => {
  if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
  event.preventDefault();
  show(current() + (event.key === 'ArrowLeft' ? -1 : 1), true);
});
window.addEventListener('resize', update);
update();
const menuToggle = document.querySelector('.nav-toggle');
const menu = document.querySelector('#site-menu');
function closeMenu() {
  menu.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.querySelector('span').textContent = '＋';
}
if (menuToggle && menu) {
  menuToggle.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('is-open', open);
    menuToggle.querySelector('span').textContent = open ? '−' : '＋';
  });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menuToggle.focus();
    }
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('nav') && menuToggle.getAttribute('aria-expanded') === 'true') closeMenu();
  });
  window.addEventListener('resize', () => { if (innerWidth > 1000) closeMenu(); });
}

(() => {
  const gallery = document.querySelector('[data-partner-reel]');
  if (!gallery) return;
  const photos = [...gallery.querySelectorAll('.partner-slide')];
  const dots = [...gallery.querySelectorAll('[data-partner-dot]')];
  if (photos.length < 2 || photos.length !== dots.length) return;
  const controls = gallery.querySelector('.partner-controls');
  const eventLabel = gallery.querySelector('[data-partner-event]');
  const live = gallery.querySelector('[data-partner-live]');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const interval = 5500;
  let index = 0, visible = false, hovered = false, focused = false, timer;
  function display(next, announce = false) {
    index = (next + photos.length) % photos.length;
    photos.forEach((photo,n) => {
      const active = n === index;
      photo.classList.toggle('is-current', active);
      photo.setAttribute('aria-hidden', String(!active));
      dots[n].setAttribute('aria-pressed',String(active));
    });
    eventLabel.textContent = photos[index].dataset.event;
    if (announce) live.textContent = (index+1) + ' / ' + photos.length + '：' + eventLabel.textContent;
  }
  function refresh() {
    clearTimeout(timer);
    if (motion.matches || !visible || hovered || focused || gallery.contains(document.activeElement) || document.hidden) return;
    timer = setTimeout(() => { if (!motion.matches && visible && !hovered && !focused && !gallery.contains(document.activeElement) && !document.hidden) display(index+1); refresh(); }, interval);
  }
  controls.hidden = false;
  dots.forEach((dot,n) => dot.addEventListener('click', () => { display(n,true); refresh(); }));
  gallery.addEventListener('pointerenter', e => { if(e.pointerType==='mouse'){hovered=true;refresh();} });
  gallery.addEventListener('pointerleave', () => { hovered=false;refresh(); });
  gallery.addEventListener('focusin', () => { focused=true;refresh(); });
  gallery.addEventListener('focusout', e => { focused=gallery.contains(e.relatedTarget);refresh(); });
  gallery.addEventListener('keydown', e => {
    if (!['ArrowLeft','ArrowRight'].includes(e.key)) return;
    e.preventDefault();
    display(index+(e.key==='ArrowLeft'?-1:1),true);
    dots[index].focus();
    refresh();
  });
  document.addEventListener('visibilitychange',refresh);
  motion.addEventListener('change',refresh);
  if('IntersectionObserver' in window){
    const observer = new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;refresh();},{threshold:.15});
    observer.observe(gallery);
  }else{visible=true;refresh();}
})();
