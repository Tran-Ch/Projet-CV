// === STARFIELD ===
const canvas = document.getElementById('starfield');
if (!canvas) throw new Error('Canvas element not found');

const context = canvas.getContext('2d');
const root = document.documentElement;
let stars = [];
let width = 0;
let height = 0;
let pixelRatio = window.devicePixelRatio || 1;

const STAR_COUNT = 260;
const STAR_SPEED = 0.12;

function resizeCanvas() {
  pixelRatio = window.devicePixelRatio || 1;
  width = window.innerWidth;
  height = window.innerHeight;

  canvas.width = width * pixelRatio;
  canvas.height = height * pixelRatio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  generateStars();
}

function generateStars() {
  stars = Array.from({ length: STAR_COUNT }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 1.4 + 0.2,
    alpha: Math.random() * 0.5 + 0.3,
    twinkle: Math.random() * 0.03 + 0.005,
    drift: Math.random() * STAR_SPEED + 0.05
  }));
}

function drawStars() {
  context.clearRect(0, 0, width, height);

  stars.forEach(star => {
    star.y += star.drift;

    if (star.y > height + star.radius) {
      star.y = -star.radius;
      star.x = Math.random() * width;
    }

    star.alpha += star.twinkle * (Math.random() > 0.5 ? 1 : -1);
    star.alpha = Math.min(0.9, Math.max(0.1, star.alpha));

    const glow = context.createRadialGradient(
      star.x,
      star.y,
      0,
      star.x,
      star.y,
      star.radius * 4
    );

    glow.addColorStop(0, `rgba(187,229,255,${star.alpha})`);
    glow.addColorStop(1, 'rgba(187,229,255,0)');

    context.beginPath();
    context.fillStyle = glow;
    context.arc(star.x, star.y, star.radius * 4, 0, Math.PI * 2);
    context.fill();
  });

  requestAnimationFrame(drawStars);
}

resizeCanvas();
drawStars();
window.addEventListener('resize', resizeCanvas);

// === PARALLAX ===
window.addEventListener('pointermove', (e) => {
  const x = (e.clientX / window.innerWidth - 0.5) * 40;
  const y = (e.clientY / window.innerHeight - 0.5) * 40;
  root.style.setProperty('--pointer-x', `${x}px`);
  root.style.setProperty('--pointer-y', `${y}px`);
});

window.addEventListener('pointerleave', () => {
  root.style.setProperty('--pointer-x', '0px');
  root.style.setProperty('--pointer-y', '0px');
});

// ===== Capsule Button Animation =====
(() => {
  const wraps = document.querySelectorAll('.capsule-demo');
  if (!wraps.length) return;

  wraps.forEach(($wrap) => {
    const $cap = $wrap.querySelector('.capsule');
    const $inner = $wrap.querySelector('.inner');
    const $arrow = $wrap.querySelector('.arrow');

    if (!$cap || !$inner || !$arrow) return;

    function primeLengths() {
      const capLen = $cap.getTotalLength();
      const innerLen = $inner.getTotalLength();

      $cap.style.setProperty('--cap-len', capLen);
      $inner.style.setProperty('--inner-len', innerLen);
    }

    function prepArrowDraw() {
      const lines = Array.from($arrow.querySelectorAll('line'));

      for (const ln of lines) {
        const len = ln.getTotalLength();
        ln.style.setProperty('--len', len);
        ln.style.strokeDasharray = String(len);
        ln.style.strokeDashoffset = String(len);
        ln.style.animation = 'none';
      }

      lines.sort((a, b) => {
        const ax = Math.min(a.x1.baseVal.value, a.x2.baseVal.value);
        const bx = Math.min(b.x1.baseVal.value, b.x2.baseVal.value);
        return ax - bx;
      });

      const rs = getComputedStyle(root);
      const tOutline = parseFloat(rs.getPropertyValue('--outline-duration')) || 0;
      const tInner = parseFloat(rs.getPropertyValue('--inner-duration')) || 0;
      const baseDelay = tOutline + tInner + 0.05;

      $arrow.style.opacity = 1;
      $arrow.style.animation = 'none';

      const segDur = 0.28;
      const stagger = 0.08;

      lines.forEach((ln, i) => {
        ln.style.animation = `capsule_line-draw ${segDur}s ease-out forwards ${baseDelay + i * stagger}s`;
      });

      const lastFinish = baseDelay + (lines.length - 1) * stagger + segDur;
      const bounceDur = 0.8;

      $arrow.style.animation = `capsule_bounce-twice ${bounceDur}s ease-in-out ${lastFinish}s 1 forwards`;

      $arrow.onanimationend = (e) => {
        if (e.animationName === 'capsule_bounce-twice') {
          setTimeout(replay, 60);
        }
      };
    }

    function replay() {
      $cap.style.animation = 'none';
      $inner.style.animation = 'none';
      $inner.style.opacity = 0;

      $arrow.style.opacity = 0;
      $arrow.style.animation = 'none';

      for (const ln of $arrow.querySelectorAll('line')) {
        ln.style.animation = 'none';
      }

      const capLen = $cap.getTotalLength();
      const innerLen = $inner.getTotalLength();

      $cap.style.strokeDashoffset = capLen;
      $inner.style.strokeDashoffset = innerLen;

      void $cap.getBoundingClientRect();

      $cap.style.animation = `capsule_draw-outline var(--outline-duration) var(--ease) forwards`;
      $inner.style.animation =
        `capsule_fade-in .01s linear forwards var(--outline-duration),
         capsule_draw-inner var(--inner-duration) var(--ease) forwards calc(var(--outline-duration) + .05s),
         capsule_fade-out .25s ease forwards calc(var(--outline-duration) + var(--inner-duration) + .05s)`;

      prepArrowDraw();
    }

    primeLengths();
    replay();
    window.addEventListener('resize', primeLengths);
  });
})();

// === cập nhật chiều cao navbar thực ===
function setNavHeightVar() {
  const nav = document.getElementById('mainNav');
  if (!nav) return;

  const h = Math.ceil(nav.getBoundingClientRect().height);
  document.documentElement.style.setProperty('--nav-h', `${h}px`);
}

window.addEventListener('load', setNavHeightVar);
window.addEventListener('resize', setNavHeightVar);
document.addEventListener('shown.bs.collapse', setNavHeightVar);
document.addEventListener('hidden.bs.collapse', setNavHeightVar);

// === Timeline line ===
function updateTimelineLine() {
  const timeline = document.querySelector('.timeline');
  if (!timeline) return;

  const dots = Array.from(timeline.querySelectorAll('.timeline-dot'));
  if (dots.length < 2) return;

  const timelineRect = timeline.getBoundingClientRect();
  const firstDotRect = dots[0].getBoundingClientRect();
  const lastDotRect = dots[dots.length - 1].getBoundingClientRect();

  const firstCenterX =
    firstDotRect.left - timelineRect.left + firstDotRect.width / 2;

  const firstCenterY =
    firstDotRect.top - timelineRect.top + firstDotRect.height / 2;

  const lastCenterY =
    lastDotRect.top - timelineRect.top + lastDotRect.height / 2;

  let tail = 180;
  let topOffset = 60;

  if (window.innerWidth <= 576) {
    tail = 90;
    topOffset = 35;
  } else if (window.innerWidth <= 992) {
    tail = 110;
    topOffset = 42;
  } else if (window.innerWidth <= 1366) {
    tail = 150;
    topOffset = 55;
  } else {
    tail = 180;
    topOffset = 60;
  }

  const lineTop = Math.max(0, firstCenterY - topOffset);
  const lineHeight = Math.max(120, (lastCenterY - lineTop) + tail);

  timeline.style.setProperty('--timeline-line-left', `${firstCenterX}px`);
  timeline.style.setProperty('--timeline-line-top', `${lineTop}px`);
  timeline.style.setProperty('--timeline-line-height', `${lineHeight}px`);
}

window.addEventListener('load', updateTimelineLine);
window.addEventListener('resize', updateTimelineLine);
document.addEventListener('DOMContentLoaded', updateTimelineLine);

// === Typing titles ===
document.addEventListener('DOMContentLoaded', () => {
  const configs = [
    { selector: '#apropos .typing-text', texts: ['À propos', 'Profil'] },
    { selector: '#competences .typing-text', texts: ['Compétences', 'Skills'] },
    { selector: '#formation .typing-text', texts: ['Formation'] },
    { selector: '#portfolio .typing-text', texts: ['Portfolio'] },
    { selector: '#contact .typing-text', texts: ['Contact'] }
  ];

  const typeDelay = 70;
  const holdDelay = 1400;
  const eraseDelay = 45;

  configs.forEach(cfg => {
    const el = document.querySelector(cfg.selector);
    if (!el) return;

    let i = 0;
    let pos = 0;
    let typing = true;

    function tick() {
      const t = cfg.texts[i];

      if (typing) {
        pos++;
        el.textContent = t.slice(0, pos);

        if (pos >= t.length) {
          typing = false;
          setTimeout(tick, holdDelay);
          return;
        }

        setTimeout(tick, typeDelay);
      } else {
        pos--;
        el.textContent = t.slice(0, pos);

        if (pos <= 0) {
          typing = true;
          i = (i + 1) % cfg.texts.length;
        }

        setTimeout(tick, eraseDelay);
      }
    }

    el.textContent = '';
    tick();
  });
});

function updateMobileFloatingUI() {
  const container = document.querySelector('.snap-container');
  const social = document.querySelector('.social-buttons');
  const downCapsule = document.querySelector('.capsule-demo:not(.capsule-demo--up)');
  const upCapsule = document.querySelector('.capsule-demo--up');
  const activePanel = document.querySelector('.panel[id].is-active-panel');

  if (!container || !social || !downCapsule || !upCapsule || !activePanel) return;

  if (window.innerWidth > 992) {
    social.classList.remove('ui-hidden-mobile');
    downCapsule.classList.remove('ui-hidden-mobile');
    upCapsule.classList.remove('ui-hidden-mobile');
    return;
  }

  const nav = document.getElementById('mainNav');
  const navH = nav ? Math.ceil(nav.getBoundingClientRect().height) : 80;
  const viewportHeight = container.clientHeight - navH;

  const maxInnerScroll = Math.max(0, activePanel.scrollHeight - viewportHeight);
  const currentInnerScroll = Math.max(
    0,
    container.scrollTop - Math.max(0, activePanel.offsetTop - navH)
  );

  const hasInternalOverflow = maxInnerScroll > 40;
  const notReachedBottomYet = currentInnerScroll < maxInnerScroll - 40;
  const shouldHideFloatingUI = hasInternalOverflow && notReachedBottomYet;

  social.classList.toggle('ui-hidden-mobile', shouldHideFloatingUI);
  downCapsule.classList.toggle('ui-hidden-mobile', shouldHideFloatingUI);
  upCapsule.classList.toggle('ui-hidden-mobile', shouldHideFloatingUI);
}

function getCurrentlyActivePanelId() {
  return document.querySelector('.panel.is-active-panel')?.id || '';
}

function runLayoutStabilize(callback) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (typeof callback === 'function') callback();
    });
  });
}

// ===== SECTION NAVIGATION + WHEEL LOCK + CONTACT CAPSULE =====
document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.snap-container');
  const nav = document.getElementById('mainNav');
  const downCapsule = document.querySelector('.capsule-demo:not(.capsule-demo--up)');
  const upCapsule = document.querySelector('.capsule-demo--up');

  if (!container || !nav || !downCapsule || !upCapsule) return;

  const panels = Array.from(document.querySelectorAll('.panel'));
  const navLinks = Array.from(document.querySelectorAll('#mainNav .nav-link'));
  const internalLinks = navLinks.filter(link => {
    const href = link.getAttribute('href') || '';
    return href.startsWith('#');
  });

  const linksMap = new Map(
    internalLinks.map(link => [link.getAttribute('href'), link])
  );

  const panelScrollState = new Map();
  panels.forEach(panel => panelScrollState.set(panel.id, 0));

  let activePanelIndex = 0;
  let isProgrammaticScroll = false;
  let programmaticTimer = null;

  function getNavHeight() {
    return Math.ceil(nav.getBoundingClientRect().height) || 80;
  }

  function getViewportHeightInsideContainer() {
    return container.clientHeight - getNavHeight();
  }

  function getPanelBaseTop(index) {
    return Math.max(0, panels[index].offsetTop - getNavHeight());
  }

  function getPanelMaxInnerScroll(index) {
    const panel = panels[index];
    if (!panel) return 0;

    const viewportHeight = getViewportHeightInsideContainer();

    if (window.innerWidth <= 992) {
      return Math.max(0, panel.scrollHeight - viewportHeight);
    }

    if (panel.id !== 'formation') {
      return 0;
    }

    return Math.max(0, panel.scrollHeight - viewportHeight);
  }

  function clampInnerScroll(index, value) {
    return Math.max(0, Math.min(getPanelMaxInnerScroll(index), value));
  }

  function getActivePanel() {
    return panels[activePanelIndex];
  }

  function getCurrentInnerScroll() {
    const panel = getActivePanel();
    if (!panel) return 0;
    return panelScrollState.get(panel.id) || 0;
  }

  function setActiveNavByIndex(index) {
    const panel = panels[index];
    if (!panel) return;

    const hash = `#${panel.id}`;

    linksMap.forEach(link => link.classList.remove('active'));
    if (linksMap.has(hash)) {
      linksMap.get(hash).classList.add('active');
    }

    panels.forEach(p => p.classList.remove('is-active-panel'));
    panel.classList.add('is-active-panel');

    const social = document.querySelector('.social-buttons');
    if (social) {
      social.classList.toggle('is-visible', hash === '#apropos' || hash === '#contact');
    }

    updateMobileFloatingUI();
  }

  function updateCapsulesVisibility() {
    const panel = getActivePanel();
    if (!panel) return;

    const isLast = activePanelIndex === panels.length - 1;
    const currentInner = getCurrentInnerScroll();
    const maxInner = getPanelMaxInnerScroll(activePanelIndex);

    const formationNeedsHide =
      panel.id === 'formation' &&
      maxInner > 24 &&
      currentInner < maxInner - 24;

    const hideDown = isLast || formationNeedsHide;
    const showUp = isLast;

    downCapsule.classList.toggle('is-hidden', hideDown);
    upCapsule.classList.toggle('is-hidden', !showUp);
  }

  function syncPanelPosition(behavior = 'auto') {
    const panel = getActivePanel();
    if (!panel) return;

    const panelId = panel.id;
    const currentInner = panelScrollState.get(panelId) || 0;
    const clampedInner = clampInnerScroll(activePanelIndex, currentInner);

    panelScrollState.set(panelId, clampedInner);

    const targetTop = getPanelBaseTop(activePanelIndex) + clampedInner;

    isProgrammaticScroll = true;
    container.scrollTo({
      top: targetTop,
      behavior
    });

    clearTimeout(programmaticTimer);
    programmaticTimer = window.setTimeout(() => {
      isProgrammaticScroll = false;
      setActiveNavByIndex(activePanelIndex);
      updateCapsulesVisibility();
      updateMobileFloatingUI();
    }, behavior === 'smooth' ? 500 : 0);
  }

  function stabilizeCurrentPanel() {
    runLayoutStabilize(() => {
      syncPanelPosition('auto');
      updateCapsulesVisibility();
      updateMobileFloatingUI();
    });
  }

  function closeMobileMenuThen(callback) {
    const col = document.getElementById('mainNavCollapse');
    if (!col) {
      callback();
      return;
    }

    const isMenuOpen = col.classList.contains('show');
    if (!isMenuOpen || window.innerWidth > 992) {
      callback();
      return;
    }

    const bsCollapse =
      bootstrap.Collapse.getInstance(col) ||
      new bootstrap.Collapse(col, { toggle: false });

    const onHidden = () => {
      col.removeEventListener('hidden.bs.collapse', onHidden);
      setNavHeightVar();
      runLayoutStabilize(callback);
    };

    col.addEventListener('hidden.bs.collapse', onHidden, { once: true });
    bsCollapse.hide();
  }

  function goToPanel(index, updateHash = true) {
    const clampedIndex = Math.max(0, Math.min(index, panels.length - 1));
    activePanelIndex = clampedIndex;

    const panel = panels[activePanelIndex];
    if (!panel) return;

    panelScrollState.set(panel.id, 0);

    if (updateHash) {
      history.replaceState(null, '', `#${panel.id}`);
    }

    syncPanelPosition('smooth');

    runLayoutStabilize(() => {
      syncPanelPosition('auto');
      updateCapsulesVisibility();
      updateMobileFloatingUI();
    });
  }

  internalLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();

      const targetId = link.getAttribute('href');
      const targetIndex = panels.findIndex(panel => `#${panel.id}` === targetId);
      if (targetIndex === -1) return;

      closeMobileMenuThen(() => {
        goToPanel(targetIndex, true);
      });
    });
  });

  downCapsule.addEventListener('click', () => {
    if (activePanelIndex < panels.length - 1) {
      goToPanel(activePanelIndex + 1, true);
    }
  });

  downCapsule.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (activePanelIndex < panels.length - 1) {
        goToPanel(activePanelIndex + 1, true);
      }
    }
  });

  upCapsule.addEventListener('click', () => {
    goToPanel(0, true);
  });

  upCapsule.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      goToPanel(0, true);
    }
  });

  container.addEventListener('wheel', (e) => {
    const panel = getActivePanel();
    if (!panel) return;

    e.preventDefault();

    const panelId = panel.id;
    const currentInner = panelScrollState.get(panelId) || 0;
    const nextInner = clampInnerScroll(activePanelIndex, currentInner + e.deltaY);

    if (nextInner === currentInner) {
      updateCapsulesVisibility();
      return;
    }

    panelScrollState.set(panelId, nextInner);
    syncPanelPosition('auto');
  }, { passive: false });

  container.addEventListener('scroll', () => {
    if (isProgrammaticScroll) return;
    syncPanelPosition('auto');
    updateMobileFloatingUI();
    updateCapsulesVisibility();
  });

  window.addEventListener('resize', () => {
    stabilizeCurrentPanel();
  });

  window.addEventListener('load', () => {
    setNavHeightVar();
    stabilizeCurrentPanel();
  });

  window.addEventListener('pageshow', () => {
    setNavHeightVar();
    stabilizeCurrentPanel();
  });

  document.querySelectorAll('#apropos img, #portfolio img, #formation img').forEach(img => {
    if (!img.complete) {
      img.addEventListener('load', () => {
        stabilizeCurrentPanel();
      }, { once: true });
    }
  });

  const initialIndex = location.hash
    ? panels.findIndex(panel => `#${panel.id}` === location.hash)
    : 0;

  activePanelIndex = initialIndex >= 0 ? initialIndex : 0;
  const initialPanel = panels[activePanelIndex];
  if (initialPanel) {
    panelScrollState.set(initialPanel.id, 0);
  }

  setActiveNavByIndex(activePanelIndex);
  updateCapsulesVisibility();
  syncPanelPosition('auto');
  stabilizeCurrentPanel();
});

// === formation cards ===
window.addEventListener('load', function () {
  const formationPanel = document.getElementById('formation');
  const container = document.querySelector('.snap-container');
  const nav = document.getElementById('mainNav');

  function getNavHeight() {
    if (!nav) return 80;
    return Math.ceil(nav.getBoundingClientRect().height) || 80;
  }

  function updateFormationExtraSpace() {
    if (!formationPanel) return;

    const lastTimelineItem = formationPanel.querySelector('.timeline-item:last-child');
    const lastCard = lastTimelineItem?.querySelector('.flip-card');
    const lastFront = lastCard?.querySelector('.flip-front');
    const lastBack = lastCard?.querySelector('.flip-back');

    if (!lastCard || !lastFront || !lastBack) {
      root.style.setProperty('--formation-last-extra-space', '0px');
      return;
    }

    const frontH = lastFront.scrollHeight;
    const backH = lastBack.scrollHeight;
    const extra = Math.max(0, backH - frontH);

    root.style.setProperty('--formation-last-extra-space', `${extra + 8}px`);
  }

  function clampFormationScrollIfNeeded() {
  if (!formationPanel || !container) return;

  const activePanelId = getCurrentlyActivePanelId();

  // Chỉ được phép clamp khi section hiện tại thực sự là formation
  if (activePanelId !== 'formation') return;

  const navH = getNavHeight();
  const panelTop = Math.max(0, formationPanel.offsetTop - navH);
  const viewportHeight = container.clientHeight - navH;
  const maxInnerScroll = Math.max(0, formationPanel.scrollHeight - viewportHeight);
  const maxAllowedTop = panelTop + maxInnerScroll;

  if (container.scrollTop >= panelTop - 2 && container.scrollTop > maxAllowedTop) {
    container.scrollTop = maxAllowedTop;
  }
}

  function measureAllCards() {
    document.querySelectorAll('.flip-card').forEach(function (card) {
      const front = card.querySelector('.flip-front');
      const back = card.querySelector('.flip-back');
      const inner = card.querySelector('.flip-inner');

      if (!front || !back || !inner) return;

      const frontH = front.scrollHeight;
      const backH = back.scrollHeight;
      const maxH = Math.max(frontH, backH);

      card.style.height = `${frontH}px`;
      inner.style.height = `${maxH}px`;

      card.dataset.frontHeight = String(frontH);
      card.dataset.maxHeight = String(maxH);
    });

    updateFormationExtraSpace();

    requestAnimationFrame(() => {
      updateTimelineLine();
      clampFormationScrollIfNeeded();
      updateMobileFloatingUI();
    });
  }

  measureAllCards();

  document.querySelectorAll('.flip-card').forEach(function (card) {
    card.addEventListener('mouseenter', function () {
      if (window.innerWidth <= 992) return;

      if (card.dataset.maxHeight) {
        card.style.height = `${card.dataset.maxHeight}px`;
      }

      requestAnimationFrame(() => {
        updateFormationExtraSpace();
        updateTimelineLine();
        clampFormationScrollIfNeeded();
        updateMobileFloatingUI();
      });
    });

    card.addEventListener('mouseleave', function () {
      if (window.innerWidth <= 992) return;

      if (card.dataset.frontHeight) {
        card.style.height = `${card.dataset.frontHeight}px`;
      }

      requestAnimationFrame(() => {
        updateFormationExtraSpace();
        updateTimelineLine();
        clampFormationScrollIfNeeded();
      });
    });

    card.addEventListener('transitionend', function (e) {
      if (e.propertyName === 'height') {
        updateFormationExtraSpace();
        updateTimelineLine();
        clampFormationScrollIfNeeded();
        updateMobileFloatingUI();
      }
    });

    card.addEventListener('click', function (e) {
      if (window.innerWidth > 992) return;

      e.stopPropagation();

      const isOpen = card.classList.contains('is-flipped');

      document.querySelectorAll('.flip-card.is-flipped').forEach(otherCard => {
        if (otherCard !== card) {
          otherCard.classList.remove('is-flipped');
          if (otherCard.dataset.frontHeight) {
            otherCard.style.height = `${otherCard.dataset.frontHeight}px`;
          }
        }
      });

      if (isOpen) {
        card.classList.remove('is-flipped');
        if (card.dataset.frontHeight) {
          card.style.height = `${card.dataset.frontHeight}px`;
        }
      } else {
        card.classList.add('is-flipped');
        if (card.dataset.maxHeight) {
          card.style.height = `${card.dataset.maxHeight}px`;
        }
      }

      requestAnimationFrame(() => {
        updateFormationExtraSpace();
        updateTimelineLine();
        clampFormationScrollIfNeeded();
        updateMobileFloatingUI();
      });
    });
  });

  document.addEventListener('click', function (e) {
    if (window.innerWidth > 992) return;

    const clickedCard = e.target.closest('.flip-card');
    if (clickedCard) return;

    document.querySelectorAll('.flip-card.is-flipped').forEach(card => {
      card.classList.remove('is-flipped');

      if (card.dataset.frontHeight) {
        card.style.height = `${card.dataset.frontHeight}px`;
      }
    });

    requestAnimationFrame(() => {
      updateFormationExtraSpace();
      updateTimelineLine();
      clampFormationScrollIfNeeded();
      updateMobileFloatingUI();
    });
  });

  window.addEventListener('resize', function () {
    measureAllCards();
  });
});

// === Auto close navbar mobile when clicking outside ===
document.addEventListener('click', function (e) {
  const navCollapse = document.getElementById('mainNavCollapse');
  const nav = document.getElementById('mainNav');

  if (!navCollapse || !nav) return;

  const isMenuOpen = navCollapse.classList.contains('show');
  const clickedInsideNav = nav.contains(e.target);

  if (isMenuOpen && !clickedInsideNav) {
    const bsCollapse =
      bootstrap.Collapse.getInstance(navCollapse) ||
      new bootstrap.Collapse(navCollapse, { toggle: false });

    bsCollapse.hide();
  }
});

// === modal project ===
document.addEventListener('DOMContentLoaded', function () {
  const modal = document.getElementById('projectModal');
  const closeBtn = document.querySelector('.close-btn');
  const cards = document.querySelectorAll('.project-card');
  const seeMoreButtons = document.querySelectorAll('.overlay-link');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');
  const modalImg = document.getElementById('modal-img');
  const modalDemo = document.getElementById('modal-demo');
  const modalGithub = document.getElementById('modal-github');
  const modalTags = document.getElementById('modal-tags');

  if (!modal || !closeBtn) return;

  const projectData = {
    'Découvrir le Vietnam': {
      demo: 'http://wad09.interface3.be/',
      github: 'https://github.com/Tran-Ch/SymfonyCours.git',
      tags: ['Symfony', 'PHP#', 'Javascript', 'MySQL', 'Html', 'Css', 'Bootstrap', 'API', 'PHPmyAdmin'],
      modalImage: '../photos/photo1-1.png',
      description: "Ce projet touristique est né de ma profonde passion pour l’âme du Vietnam : la chaleur de son peuple, la richesse de sa culture millénaire et la vitalité de ses traditions. Chaque itinéraire, chaque expérience que je propose est conçu avec respect et admiration pour les valeurs locales, les savoir-faire artisanaux, la gastronomie authentique et les histoires humaines qui donnent à ce pays toute sa singularité. À travers mes suggestions de voyage, je souhaite offrir bien plus qu’un simple séjour, mais une immersion sincère dans la beauté, la générosité et la richesse culturelle du Vietnam."
    },
    'MyGouvernement.be': {
      demo: 'https://mygouvernement.hackathon2025.interface3.be/',
      github: 'https://github.com/Tran-Ch/HACKATHON-MyGouvernement.be.git',
      tags: ['Html', 'CSS', 'Javascript', 'Flask', 'Python'],
      modalImage: '../photos/photo2-1.png',
      description: "Développé lors d'un Hackathon, ce simulateur interactif place l'utilisateur aux commandes des finances publiques du pays. Grâce à une interface dynamique en JavaScript et un backend Flask, il transforme la complexité budgétaire en une expérience pédagogique et immersive où chaque décision politique a un impact visible."
    },
    'CV en Ligne': {
      demo: 'https://tran-ch.github.io/Projet-CV/',
      github: 'https://github.com/Tran-Ch/Projet-CV.git',
      tags: ['Html', 'CSS', 'Javascript'],
      modalImage: '../photos/photo3-1.png',
      description: "J’ai imaginé ce CV interactif comme bien plus qu’une simple présentation professionnelle : une véritable expérience immersive. En combinant JavaScript vanilla et CSS3, avec des effets glitch, j’ai voulu créer une interface vivante, fluide et entièrement responsive, capable de capter l’attention et de marquer durablement les esprits."
    },
    'Digital Ecosystem': {
      demo: 'https://tran-ch.github.io/Digital-Ecosystem/',
      github: 'https://github.com/Tran-Ch/Digital-Ecosystem.git',
      tags: ['Javascript', 'CSS', 'HTML5 Canvas', 'Responsive Design'],
      modalImage: '../photos/photo4-1.png',
      description: `Une simulation interactive de vie artificielle explorant l'intelligence collective et les comportements émergents. Ce projet transforme un algorithme mathématique en une expérience ludique et dynamique.

Points Clés :
• Intelligence Artificielle : Implémentation de l'algorithme de Reynolds (Séparation, Alignement, Cohésion) via des forces vectorielles.
• Environnement Réactif : Interaction en temps réel pour créer des obstacles destructibles ou nourrir les entités.
• Performance & UX : Rendu fluide à 60 FPS (Canvas API), interface responsive (Mobile/Tablette) et persistance des scores (LocalStorage).`,
    },
    'Le Jeu du Seau d\'Eau': {
      demo: 'https://tran-ch.github.io/Le-Jeu-du-Seau-d-Eau/',
      github: 'https://github.com/Tran-Ch/Le-Jeu-du-Seau-d-Eau.git',
      tags: ['Html', 'Css', 'Javascript'],
      modalImage: '../photos/photo5-1.png',
      description: "Ce mini-jeu interactif, développé en HTML, CSS et JavaScript, met en scène un seau vide chargé de trouver une source d’eau avant de venir arroser la plante au centre du plateau. Le joueur peut se déplacer dans toutes les directions, tout en s’adaptant à l’apparition aléatoire de cases bloquées. Ce projet illustre à la fois la logique de jeu, la gestion des interactions utilisateur et la manipulation dynamique du DOM."
    },
    'Food Scanner': {
      demo: '#',
      github: '#',
      tags: ['Mobile', 'Scanner', 'App'],
      modalImage: '',
      description: 'Comming soon...'
    }
  };

  function closeAllProjectOverlays() {
    cards.forEach(card => card.classList.remove('is-open'));
  }

  function openModal({
    title,
    desc,
    imgPath,
    demoLink = '#',
    githubLink = '#',
    tags = []
  }) {
    modalTitle.innerText = title;
    modalDesc.innerText = desc;
    modalImg.src = imgPath;
    modalImg.alt = title;
    modalDemo.href = demoLink;
    modalGithub.href = githubLink;

    if (modalTags) {
      modalTags.innerHTML = tags
        .map(tag => `<span class="modal-tag">${tag}</span>`)
        .join('');
    }

    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
  }

  cards.forEach(card => {
    card.addEventListener('click', function (e) {
      if (window.innerWidth > 992) return;

      const clickedVoirPlus = e.target.closest('.overlay-link');
      if (clickedVoirPlus) return;

      const isOpen = card.classList.contains('is-open');

      closeAllProjectOverlays();

      if (!isOpen) {
        card.classList.add('is-open');
      }
    });
  });

  seeMoreButtons.forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();

      const card = this.closest('.project-card');
      if (!card) return;

      const title = card.querySelector('.overlay-title')?.innerText || 'Project';
      const defaultDesc = card.querySelector('.overlay-desc')?.innerText || '';
      const defaultImgPath = card.querySelector('img')?.src || '';

      const project = projectData[title] || {
        demo: '#',
        github: '#',
        tags: []
      };

      openModal({
        title,
        desc: project.description || defaultDesc,
        imgPath: project.modalImage || defaultImgPath,
        demoLink: project.demo,
        githubLink: project.github,
        tags: project.tags || []
      });
    });
  });

  document.addEventListener('click', function (e) {
    if (window.innerWidth > 992) return;

    const clickedInsideCard = e.target.closest('.project-card');
    if (!clickedInsideCard) {
      closeAllProjectOverlays();
    }
  });

  closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', function (event) {
    if (event.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && modal.classList.contains('show')) {
      closeModal();
    }
  });
});

// === CONTACT FORM ===
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');

  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const name = document.getElementById('contactName')?.value.trim();
    const email = document.getElementById('contactEmail')?.value.trim();
    const message = document.getElementById('contactMessage')?.value.trim();

    if (!name || !email || !message) {
      if (status) {
        status.textContent = 'Veuillez remplir tous les champs.';
        status.style.color = '#ff6b6b';
      }
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Envoi...';

    if (status) {
      status.textContent = '';
    }

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: {
          Accept: 'application/json'
        }
      });

      if (response.ok) {
        form.reset();

        if (status) {
          status.textContent = 'Message envoyé avec succès.';
          status.style.color = '#55c0cf';
        }
      } else {
        if (status) {
          status.textContent = "Une erreur s'est produite. Veuillez réessayer.";
          status.style.color = '#ff6b6b';
        }
      }
    } catch (error) {
      if (status) {
        status.textContent = "Impossible d'envoyer le message.";
        status.style.color = '#ff6b6b';
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Envoyer';
    }
  });
});