// =====================================================
// Christof Neessen — Portfolio
// =====================================================

(function () {
  'use strict';

  const isTouch = matchMedia('(hover: none)').matches;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;


  // ---------- Reveal on Scroll ----------
  const revealEls = document.querySelectorAll('[data-reveal]');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('is-visible'), i * 60);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
  );
  revealEls.forEach((el) => observer.observe(el));

  // ---------- Hero: Letter-by-letter reveal ----------
  document.querySelectorAll('.hero__line').forEach((line) => {
    const text = line.textContent.trim();
    line.textContent = '';
    [...text].forEach((ch, i) => {
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = ch === ' ' ? ' ' : ch;
      span.style.transitionDelay = `${i * 35}ms`;
      line.appendChild(span);
    });
  });
  // Trigger after a tiny delay so layout is set
  requestAnimationFrame(() => {
    document.querySelectorAll('.hero__line').forEach((line, i) => {
      setTimeout(() => line.classList.add('is-shown'), 200 + i * 220);
    });
  });

  // ---------- Word-cycle in tagline ----------
  const wordCycle = document.querySelector('.word-cycle');
  if (wordCycle && !reduceMotion) {
    const words = (wordCycle.dataset.words || '').split(',').map(s => s.trim()).filter(Boolean);
    const span = wordCycle.querySelector('.word-cycle__current');
    let idx = 0;
    const cycle = () => {
      span.classList.remove('is-in');
      span.classList.add('is-out');
      setTimeout(() => {
        idx = (idx + 1) % words.length;
        span.textContent = words[idx];
        span.classList.remove('is-out');
        span.classList.add('is-in');
      }, 400);
    };
    setInterval(cycle, 2600);
  }

  // ---------- Scroll progress bar ----------
  const progress = document.querySelector('.scroll-progress');
  if (progress) {
    const updateProgress = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
      progress.style.width = `${pct}%`;
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  // ---------- Nav background on scroll ----------
  const nav = document.querySelector('.nav');
  const onScroll = () => {
    if (window.scrollY > 40) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- Render language dots (supports half levels: 4.5, 3.5, ...) ----------
  document.querySelectorAll('.dots').forEach((el) => {
    const level = parseFloat(el.dataset.level) || 0;
    el.innerHTML = '';
    for (let i = 0; i < 5; i++) {
      const span = document.createElement('span');
      let cls = 'dot-pill';
      if (level >= i + 1) cls += ' is-filled';
      else if (level >= i + 0.5) cls += ' is-half';
      span.className = cls;
      span.style.transitionDelay = `${i * 80}ms`;
      el.appendChild(span);
    }
  });

  // ---------- Custom Cursor ----------
  const cursor = document.querySelector('.cursor');
  const cursorDot = document.querySelector('.cursor-dot');

  if (cursor && cursorDot && !isTouch) {
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let cx = mx, cy = my;

    window.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
      cursorDot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    });

    const tick = () => {
      cx += (mx - cx) * 0.18;
      cy += (my - cy) * 0.18;
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(tick);
    };
    tick();

    const hoverables = document.querySelectorAll('a, button, [data-magnetic]');
    hoverables.forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
    });
  }

  // ---------- Magnetic Buttons ----------
  if (!isTouch) {
    const magnets = document.querySelectorAll('[data-magnetic]');
    magnets.forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${x * 0.18}px, ${y * 0.25}px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });

    // 3D Tilt + Image Parallax on Project Cards
    document.querySelectorAll('.project').forEach((card) => {
      const img = card.querySelector('.project__media img');
      const MAX_TILT = 7; // degrees
      let rafId = null;
      let pendingX = 0, pendingY = 0;

      const apply = () => {
        rafId = null;
        const ry = pendingX * MAX_TILT;       // rotateY (left-right)
        const rx = -pendingY * MAX_TILT;      // rotateX (up-down)
        card.style.transform = `perspective(1400px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-8px)`;
        if (img) {
          img.style.transform = `scale(1.08) translate(${pendingX * -16}px, ${pendingY * -16}px)`;
        }
      };

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        pendingX = (e.clientX - rect.left) / rect.width - 0.5;
        pendingY = (e.clientY - rect.top) / rect.height - 0.5;
        if (!rafId) rafId = requestAnimationFrame(apply);
      });
      card.addEventListener('mouseenter', () => {
        card.classList.add('is-tilting');
      });
      card.addEventListener('mouseleave', () => {
        card.classList.remove('is-tilting');
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
        card.style.transform = '';
        if (img) img.style.transform = '';
      });
    });
  }

  // ---------- Smooth-scroll for in-page anchors ----------
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length > 1) {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          window.scrollTo({
            top: target.offsetTop - 60,
            behavior: 'smooth',
          });
        }
      }
    });
  });

  // ---------- Hero parallax ----------
  const heroBg = document.querySelector('.hero__bg-text');
  const heroSparkle = document.querySelector('.hero__sparkle');
  if (heroBg || heroSparkle) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (heroBg) heroBg.style.transform = `translateX(calc(-50% - ${y * 0.4}px))`;
      if (heroSparkle) heroSparkle.style.transform = `translateY(${y * 0.25}px)`;
    }, { passive: true });
  }

  // ---------- Klaus, der Cursor-Dieb ----------
  const klaus = document.getElementById('klaus');
  if (klaus && !isTouch && !reduceMotion) {
    const IDLE_MS = 10000;
    const SPEED = 240; // px/s
    const PEEK_DELAY_MIN = 2500;
    const PEEK_DELAY_MAX = 5500;
    const PEEK_DURATION = 3200;
    const KLAUS_W = 92;

    let lastMove = Date.now();
    let lastMouseX = window.innerWidth / 2;
    let lastMouseY = window.innerHeight / 2;
    let active = false;
    let phase = 'idle'; // idle | approach | stealing | retreat | hiding | peeking | fleeing
    let hideSide = 'left';
    let savedTop = 0;
    let walkAnim = null;
    let pauseTimer = null;
    let peekTimer = null;

    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

    const cancelTimers = () => {
      if (walkAnim)   { try { walkAnim.cancel(); } catch (e) {} walkAnim = null; }
      if (pauseTimer) { clearTimeout(pauseTimer); pauseTimer = null; }
      if (peekTimer)  { clearTimeout(peekTimer);  peekTimer = null; }
    };

    const cancelKlaus = () => {
      cancelTimers();
      klaus.classList.remove('is-active', 'is-walking', 'is-flipped',
                             'has-loot', 'is-fleeing', 'is-peeking',
                             'is-celebrating');
      klaus.style.transform = '';
      document.body.classList.remove('klaus-stole-cursor');
      void klaus.offsetWidth;
      active = false;
      phase = 'idle';
    };

    // ── Phase 1: Approach (von Rand bis Cursor) ──
    const startApproach = () => {
      phase = 'approach';
      // Zufällige Seite — beide gleich wahrscheinlich
      hideSide = Math.random() > 0.5 ? 'left' : 'right';
      const fromLeft = (hideSide === 'left');

      savedTop = clamp(lastMouseY - 46, 60, window.innerHeight - 140);

      klaus.classList.add('is-active', 'is-walking');
      klaus.classList.toggle('is-flipped', !fromLeft);

      const startX  = fromLeft ? -110 : window.innerWidth + 20;
      const targetX = clamp(lastMouseX - KLAUS_W / 2, 0, window.innerWidth - KLAUS_W);
      const duration = (Math.abs(targetX - startX) / SPEED) * 1000;

      walkAnim = klaus.animate([
        { transform: `translate(${startX}px, ${savedTop}px)` },
        { transform: `translate(${targetX}px, ${savedTop}px)` }
      ], { duration, easing: 'linear', fill: 'forwards' });

      walkAnim.onfinish = () => onApproachDone(targetX);
    };

    const onApproachDone = (atX) => {
      if (!active) return;
      phase = 'stealing';
      klaus.classList.add('has-loot');
      document.body.classList.add('klaus-stole-cursor');
      // kurze Pause — Klaus packt zu
      pauseTimer = setTimeout(() => {
        if (active) startRetreat(atX);
      }, 380);
    };

    // ── Phase 2: Retreat (mit Beute zur Versteck-Seite) ──
    const startRetreat = (fromX) => {
      phase = 'retreat';
      klaus.classList.toggle('is-flipped'); // umdrehen

      const targetX = (hideSide === 'left') ? -110 : window.innerWidth + 20;
      const duration = (Math.abs(targetX - fromX) / SPEED) * 1000;

      walkAnim = klaus.animate([
        { transform: `translate(${fromX}px, ${savedTop}px)` },
        { transform: `translate(${targetX}px, ${savedTop}px)` }
      ], { duration, easing: 'linear', fill: 'forwards' });

      walkAnim.onfinish = onRetreatDone;
    };

    const onRetreatDone = () => {
      if (!active) return;
      phase = 'hiding';
      klaus.classList.remove('is-walking');
      schedulePeek();
    };

    // ── Phase 3: Peek-Loop ──
    const schedulePeek = () => {
      if (peekTimer) clearTimeout(peekTimer);
      const delay = PEEK_DELAY_MIN + Math.random() * (PEEK_DELAY_MAX - PEEK_DELAY_MIN);
      peekTimer = setTimeout(() => { if (active) doPeek(); }, delay);
    };

    const doPeek = () => {
      if (!active) return;
      phase = 'peeking';

      // 30 % Chance, die Seite zu wechseln (er schleicht sich rüber)
      if (Math.random() > 0.7) {
        hideSide = (hideSide === 'left') ? 'right' : 'left';
      }
      const fromLeft = (hideSide === 'left');
      klaus.classList.toggle('is-flipped', !fromLeft);
      klaus.classList.add('is-peeking');

      // zufällige Höhe für jeden Peek
      const top = clamp(80 + Math.random() * (window.innerHeight - 240),
                        80, window.innerHeight - 160);
      const hidden = fromLeft ? -110 : window.innerWidth + 20;
      const peekIn = fromLeft ? -52  : window.innerWidth - 40;

      walkAnim = klaus.animate([
        { transform: `translate(${hidden}px, ${top}px)` },
        { transform: `translate(${peekIn}px, ${top}px)`, offset: 0.25 },
        { transform: `translate(${peekIn}px, ${top}px)`, offset: 0.75 },
        { transform: `translate(${hidden}px, ${top}px)` }
      ], {
        duration: PEEK_DURATION,
        easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        fill: 'forwards'
      });

      walkAnim.onfinish = () => {
        if (!active) return;
        klaus.classList.remove('is-peeking');
        schedulePeek();
      };
    };

    // ── Flee (Klaus wird beim Anschleichen erwischt) ──
    const fleeKlaus = () => {
      if (phase !== 'approach') return false;
      cancelTimers();

      const rect = klaus.getBoundingClientRect();
      const currentX = rect.left;

      klaus.classList.remove('has-loot', 'is-walking');
      klaus.classList.toggle('is-flipped'); // 180°
      klaus.classList.add('is-fleeing');
      document.body.classList.remove('klaus-stole-cursor');
      phase = 'fleeing';

      const isFlipped = klaus.classList.contains('is-flipped');
      const targetX = isFlipped ? -130 : window.innerWidth + 50;

      walkAnim = klaus.animate([
        { transform: `translate(${currentX}px, ${savedTop}px)` },
        { transform: `translate(${targetX}px,  ${savedTop}px)` }
      ], {
        duration: 1000,
        easing: 'cubic-bezier(0.5, 0, 0.75, 0)',
        fill: 'forwards'
      });

      walkAnim.onfinish = cancelKlaus;
      return true;
    };

    // ── Mausbewegung: passende Reaktion je nach Phase ──
    window.addEventListener('mousemove', (e) => {
      lastMove = Date.now();
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      if (!active) return;

      // CTA-Phasen lassen wir in Ruhe — Klaus erledigt seinen Job
      if (phase.indexOf('cta-') === 0) return;

      if (phase === 'approach') {
        fleeKlaus();
      } else if (phase === 'fleeing') {
        // schon dabei zu fliehen — laufen lassen
      } else {
        // retreat / hiding / peeking / stealing → einfach verschwinden lassen
        cancelKlaus();
      }
    });

    // ── Idle-Trigger ──
    setInterval(() => {
      if (!active && Date.now() - lastMove > IDLE_MS) {
        active = true;
        startApproach();
      }
    }, 1000);

    // ─────────────────────────────────────────────
    // CTA-KLAUS (Variante "Conférencier"):
    //   1) Klaus marschiert von einer Seite direkt zur CTA
    //   2) Bleibt direkt daneben stehen, dreht sich Richtung Button
    //   3) Tippt mit seinem Stern den Button an
    //      → Button reagiert mit Spring-Bounce + weißem Halo-Burst
    //      → Klaus springt vor Freude
    //   4) CTA wird permanent "lebendig":
    //      • blauer Shimmer wandert durch
    //      • weiße Halo atmet sanft
    //   5) Klaus zieht ab — die CTA strahlt weiter
    // Reset bei Scroll-Up: alles zurück
    // ─────────────────────────────────────────────
    let ctaTriggered = false;

    const deactivateCTAActive = () => {
      const cta = document.querySelector('.contact .btn--inverse');
      if (cta) cta.classList.remove('is-cta-active', 'is-cta-tap');
    };

    const startCTAVisit = () => {
      const cta = document.querySelector('.contact .btn--inverse');
      if (!cta) return;
      if (active) cancelKlaus();
      deactivateCTAActive();
      active = true;
      phase = 'cta-walk';

      hideSide = Math.random() > 0.5 ? 'left' : 'right';
      const fromLeft = (hideSide === 'left');
      klaus.classList.add('is-active', 'is-walking');
      klaus.classList.toggle('is-flipped', !fromLeft);

      const ctaRect = cta.getBoundingClientRect();
      // Klaus stellt sich auf der Anflug-Seite direkt neben den Button
      const standY = clamp(ctaRect.top + ctaRect.height / 2 - 50, 40, window.innerHeight - 140);
      const standX = fromLeft
        ? clamp(ctaRect.left  - KLAUS_W - 16, 0, window.innerWidth - KLAUS_W)
        : clamp(ctaRect.right + 16,            0, window.innerWidth - KLAUS_W);

      const startX = fromLeft ? -110 : window.innerWidth + 20;
      const distance = Math.abs(standX - startX);
      const duration = Math.max(1400, (distance / SPEED) * 1000);

      walkAnim = klaus.animate([
        { transform: `translate(${startX}px, ${standY}px)` },
        { transform: `translate(${standX}px, ${standY}px)` }
      ], { duration, easing: 'linear', fill: 'forwards' });

      walkAnim.onfinish = () => onCTAArrived(standX, standY, cta);
    };

    const onCTAArrived = (atX, atY, cta) => {
      if (!active) return;
      phase = 'cta-pause';
      klaus.classList.remove('is-walking');
      // Klaus schaut Richtung Button (CTA links → Klaus rechts schauen, also is-flipped=false)
      const ctaRect = cta.getBoundingClientRect();
      const buttonOnRight = ctaRect.left > atX;
      klaus.classList.toggle('is-flipped', !buttonOnRight);
      // Kurze dramatische Pause, dann tippen
      pauseTimer = setTimeout(() => { if (active) ctaTap(atX, atY, cta); }, 700);
    };

    const ctaTap = (atX, atY, cta) => {
      if (!active) return;
      phase = 'cta-tap';
      // Button reagiert
      cta.classList.add('is-cta-tap');
      setTimeout(() => cta.classList.remove('is-cta-tap'), 850);
      // Permanenter Glow startet leicht versetzt
      setTimeout(() => cta.classList.add('is-cta-active'), 350);
      // Klaus springt vor Freude
      klaus.classList.add('is-celebrating');
      setTimeout(() => klaus.classList.remove('is-celebrating'), 1200);
      // Dann zieht Klaus ab
      pauseTimer = setTimeout(() => { if (active) ctaVisitExit(atX, atY); }, 1400);
    };

    const ctaVisitExit = (fromX, fromY) => {
      if (!active) return;
      phase = 'cta-exiting';
      klaus.classList.add('is-walking');
      // Zur näheren Seite raus
      const exitLeft = fromX < window.innerWidth / 2;
      klaus.classList.toggle('is-flipped', !exitLeft);
      const targetX = exitLeft ? -130 : window.innerWidth + 30;
      const duration = Math.max(900, (Math.abs(targetX - fromX) / SPEED) * 1000);

      walkAnim = klaus.animate([
        { transform: `translate(${fromX}px, ${fromY}px)` },
        { transform: `translate(${targetX}px, ${fromY}px)` }
      ], { duration, easing: 'cubic-bezier(0.45, 0, 0.7, 1)', fill: 'forwards' });

      walkAnim.onfinish = cancelKlaus;
    };

    // ── data-magnetic-Effekt am CTA unterdrücken, solange er "active" ist
    //    (sonst überschreibt der Hover-Translate unsere Tap-Animation) ──
    document.querySelectorAll('[data-magnetic]').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        if (el.classList.contains('is-cta-active') || el.classList.contains('is-cta-tap')) {
          e.stopImmediatePropagation();
        }
      }, true);
    });

    // ── Trigger via IntersectionObserver ──
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      const ctaObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const ratio = entry.intersectionRatio;
          if (ratio >= 0.5 && !ctaTriggered) {
            ctaTriggered = true;
            setTimeout(() => {
              if (!ctaTriggered) return;
              startCTAVisit();
            }, 900);
          } else if (ratio < 0.05) {
            if (active && phase.indexOf('cta-') === 0) cancelKlaus();
            deactivateCTAActive();
            ctaTriggered = false;
          }
        });
      }, { threshold: [0, 0.05, 0.5] });
      ctaObserver.observe(contactSection);
    }
  }

  // ---------- Project Filter ----------
  const filterBtns = document.querySelectorAll('[data-filter]');
  const projects = document.querySelectorAll('[data-project]');
  if (filterBtns.length && projects.length) {
    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;
        // Toggle active state
        filterBtns.forEach((b) => {
          b.classList.toggle('is-active', b === btn);
          b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
        });
        // Phase 1: fade everything out
        projects.forEach((p) => p.classList.add('is-filter-fade'));
        // Phase 2: hide non-matching, then fade matching back in
        setTimeout(() => {
          projects.forEach((p) => {
            const cats = (p.dataset.categories || '').split(/\s+/).filter(Boolean);
            const matches = filter === 'all' || cats.includes(filter);
            p.classList.toggle('is-filtered-out', !matches);
          });
          requestAnimationFrame(() => {
            projects.forEach((p) => p.classList.remove('is-filter-fade'));
          });
        }, 320);
      });
    });
  }

  // ---------- Project Lightbox ----------
  const lightbox = document.getElementById('lightbox');
  const lbImg = lightbox.querySelector('.lightbox__img');
  const lbTitle = lightbox.querySelector('.lightbox__title');
  const lbDesc = lightbox.querySelector('.lightbox__desc');
  const lbTags = lightbox.querySelector('.lightbox__tags');
  const lbCounter = lightbox.querySelector('.lightbox__counter');
  const lbPrev = lightbox.querySelector('[data-prev]');
  const lbNext = lightbox.querySelector('[data-next]');

  let currentImages = [];
  let currentIdx = 0;

  const renderImage = () => {
    if (!currentImages.length) return;
    lbImg.classList.add('is-swapping');
    setTimeout(() => {
      lbImg.src = currentImages[currentIdx];
      lbImg.classList.remove('is-swapping');
    }, 200);
    lbCounter.textContent = `${currentIdx + 1} / ${currentImages.length}`;
    lbPrev.disabled = currentImages.length <= 1;
    lbNext.disabled = currentImages.length <= 1;
  };

  const openLightbox = (project) => {
    const images = (project.dataset.images || '').split(',').map(s => s.trim()).filter(Boolean);
    const tags = (project.dataset.tags || '').split(',').map(s => s.trim()).filter(Boolean);
    currentImages = images;
    currentIdx = 0;

    lbTitle.innerHTML = project.dataset.title || '';
    lbDesc.innerHTML = project.dataset.desc || '';
    lbTags.innerHTML = tags.map(t => `<span>${t}</span>`).join('');
    renderImage();

    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
  };

  const closeLightbox = () => {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
  };

  document.querySelectorAll('[data-project]').forEach((p) => {
    p.addEventListener('click', (e) => {
      e.preventDefault();
      openLightbox(p);
    });
  });

  lightbox.querySelectorAll('[data-close]').forEach((el) => {
    el.addEventListener('click', closeLightbox);
  });

  lbPrev.addEventListener('click', () => {
    currentIdx = (currentIdx - 1 + currentImages.length) % currentImages.length;
    renderImage();
  });
  lbNext.addEventListener('click', () => {
    currentIdx = (currentIdx + 1) % currentImages.length;
    renderImage();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft' && currentImages.length > 1) lbPrev.click();
    if (e.key === 'ArrowRight' && currentImages.length > 1) lbNext.click();
  });
})();
