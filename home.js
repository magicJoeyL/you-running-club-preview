(() => {
  const reel = document.querySelector('#hero-reel');
  const controls = document.querySelector('.hero-dot-controls');
  const area = reel?.closest('.hero-carousel');
  if (!reel || !controls || !area) return;
  const slides = [...reel.children];
  const dots = [...controls.querySelectorAll('[data-hero-dot]')];
  if (slides.length !== dots.length || slides.length < 2) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const interval = 6500;
  let active = 0, visible = false, hovered = false, interacting = false, timer;
  const current = () => Math.max(0, Math.min(slides.length-1, Math.round(reel.scrollLeft / reel.clientWidth)));
  function sync() {
    active = current();
    dots.forEach((dot,n) => dot.setAttribute('aria-pressed',String(n===active)));
  }
  function paused() {
    return motion.matches || !visible || hovered || interacting || area.contains(document.activeElement) || document.hidden;
  }
  function refresh() {
    clearTimeout(timer);
    if (paused()) return;
    timer = setTimeout(() => {
      if (!paused()) show((active+1)%slides.length,active===slides.length-1);
      refresh();
    },interval);
  }
  function show(index,immediate=false) {
    const next = (index+slides.length)%slides.length;
    reel.scrollTo({left:next*reel.clientWidth,behavior:immediate||motion.matches?'instant':'smooth'});
  }
  controls.hidden = false;
  dots.forEach((dot,n)=>dot.addEventListener('click',()=>{show(n);refresh();}));
  reel.addEventListener('scroll',()=>{sync();refresh();},{passive:true});
  area.addEventListener('keydown',e=>{
    if (!['ArrowLeft','ArrowRight'].includes(e.key)) return;
    e.preventDefault();
    const n=(active+(e.key==='ArrowLeft'?-1:1)+slides.length)%slides.length;
    show(n,true);
    dots[n].focus();
    refresh();
  });
  area.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){hovered=true;refresh();}});
  area.addEventListener('pointerleave',()=>{hovered=false;refresh();});
  reel.addEventListener('pointerdown',()=>{interacting=true;refresh();},{passive:true});
  window.addEventListener('pointerup',()=>{interacting=false;refresh();},{passive:true});
  window.addEventListener('pointercancel',()=>{interacting=false;refresh();},{passive:true});
  area.addEventListener('focusin',refresh);
  area.addEventListener('focusout',()=>queueMicrotask(refresh));
  document.addEventListener('visibilitychange',refresh);
  motion.addEventListener('change',refresh);
  window.addEventListener('resize',()=>{show(active,true);sync();refresh();});
  if('IntersectionObserver' in window){
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;refresh();},{threshold:.1});
    observer.observe(reel);
  }else{visible=true;refresh();}
  sync();
})();
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
