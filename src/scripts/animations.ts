import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

const reduceMotion = typeof window !== 'undefined'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initSmoothScroll() {
  if (reduceMotion) return null;

  const lenis = new Lenis({
    duration: 1.15,
    smoothWheel: true,
    touchMultiplier: 1.5,
    lerp: 0.1,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  return lenis;
}

export function initHeroAnimation() {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!hero) return;

  const titleLines = Array.from(hero.querySelectorAll<HTMLElement>('[data-hero-line]'));
  const sub = hero.querySelector<HTMLElement>('[data-hero-sub]');
  const meta = hero.querySelector<HTMLElement>('[data-hero-meta]');
  const scroll = hero.querySelector<HTMLElement>('[data-hero-scroll]');
  const mediaImg = hero.querySelector<HTMLImageElement>('[data-hero-media] img');

  if (reduceMotion) {
    // Make sure everything is visible
    gsap.set([...titleLines, sub, meta, scroll].filter(Boolean), { opacity: 1, y: 0 });
    if (mediaImg) gsap.set(mediaImg, { scale: 1 });
    return;
  }

  const splits = titleLines.map((line) => new SplitText(line, {
    type: 'chars,words',
    charsClass: 'hero-char',
  }));
  const allChars = splits.flatMap((s) => s.chars);

  // Container lines are visible; chars hold the animated state
  gsap.set(titleLines, { opacity: 1, y: 0 });
  gsap.set(allChars, { yPercent: 110, opacity: 0 });

  if (mediaImg) {
    gsap.to(mediaImg, { scale: 1.0, duration: 30, ease: 'sine.out' });
  }

  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

  splits.forEach((split, idx) => {
    tl.to(split.chars, {
      yPercent: 0,
      opacity: 1,
      duration: 1.1,
      stagger: 0.018,
    }, idx === 0 ? 0.35 : '-=0.85');
  });

  if (sub) tl.to(sub, { y: 0, opacity: 1, duration: 1 }, '-=0.45');
  if (meta) tl.to(meta, { opacity: 1, duration: 0.9 }, '-=0.55');
  if (scroll) tl.to(scroll, { opacity: 1, duration: 0.8 }, '-=0.5');
}

export function initRevealOnScroll() {
  if (reduceMotion) return;

  // Text reveal: word-by-word stagger via SplitText
  document.querySelectorAll<HTMLElement>('[data-reveal="text"]').forEach((el) => {
    const split = new SplitText(el, {
      type: 'lines,words',
      linesClass: 'reveal-line',
      wordsClass: 'reveal-word',
    });
    gsap.set(el, { opacity: 1 });
    gsap.set(split.words, { yPercent: 110, opacity: 0 });

    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(split.words, {
          yPercent: 0,
          opacity: 1,
          duration: 1.1,
          ease: 'expo.out',
          stagger: 0.025,
        });
      },
    });
  });

  // Fade-up reveal
  document.querySelectorAll<HTMLElement>('[data-reveal="fade"]').forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 1.2,
      ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    });
  });

  // Mask reveal (clip-path)
  document.querySelectorAll<HTMLElement>('[data-reveal="mask"]').forEach((el) => {
    gsap.to(el, {
      clipPath: 'inset(0 0 0% 0)',
      duration: 1.6,
      ease: 'expo.inOut',
      scrollTrigger: { trigger: el, start: 'top 80%', once: true },
    });
  });

  // Parallax on elements marked [data-parallax="strength"] (default 0.15)
  document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
    const strength = parseFloat(el.dataset.parallax || '0.15');
    gsap.to(el, {
      yPercent: -strength * 100,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  });
}

export function initCounters() {
  document.querySelectorAll<HTMLElement>('[data-counter]').forEach((el) => {
    const target = parseFloat(el.dataset.counter || '0');
    const decimals = parseInt(el.dataset.counterDecimals || '0', 10);
    const useGrouping = el.dataset.counterGrouping !== 'false';

    const fmt = (n: number) =>
      n.toLocaleString('pt-BR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
        useGrouping,
      });

    if (reduceMotion) {
      el.textContent = fmt(target);
      return;
    }

    const obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      duration: 1.8,
      ease: 'expo.out',
      onUpdate: () => {
        el.textContent = fmt(obj.val);
      },
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    });
  });
}

export function initMagnetic() {
  if (reduceMotion) return;

  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    const strength = parseFloat(el.dataset.magnetic || '0.3');

    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * strength;
      const y = (e.clientY - rect.top - rect.height / 2) * strength;
      gsap.to(el, { x, y, duration: 0.6, ease: 'power3.out' });
    });

    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.5)' });
    });
  });
}

export function initCursor() {
  if (reduceMotion) return;
  if (window.matchMedia('(hover: none)').matches) return;

  const cursor = document.createElement('div');
  cursor.className = 'site-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  document.body.appendChild(cursor);

  const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const mouse = { x: pos.x, y: pos.y };
  let activated = false;

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    if (!activated) {
      activated = true;
      cursor.classList.add('is-active');
    }
  });

  gsap.ticker.add(() => {
    pos.x += (mouse.x - pos.x) * 0.2;
    pos.y += (mouse.y - pos.y) * 0.2;
    cursor.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`;
  });

  const growSelector = 'a, button, [data-magnetic], [data-cursor="grow"]';
  document.querySelectorAll(growSelector).forEach((el) => {
    el.addEventListener('mouseenter', () => cursor.classList.add('is-grown'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('is-grown'));
  });
}

export async function initLightbox() {
  const gallery = document.getElementById('galeria-grid');
  if (!gallery) return;

  const [{ default: PhotoSwipeLightbox }] = await Promise.all([
    import('photoswipe/lightbox'),
    import('photoswipe/style.css'),
  ]);

  const lightbox = new PhotoSwipeLightbox({
    gallery: '#galeria-grid',
    children: 'a[data-pswp-width]',
    pswpModule: () => import('photoswipe'),
    bgOpacity: 0.94,
    showHideAnimationType: 'zoom',
    paddingFn: () => ({ top: 32, bottom: 32, left: 16, right: 16 }),
  });

  lightbox.init();
}

export function initAll() {
  initSmoothScroll();
  initHeroAnimation();
  initRevealOnScroll();
  initCounters();
  initMagnetic();
  initCursor();
  initLightbox();
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}
