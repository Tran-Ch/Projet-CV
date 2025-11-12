// === STARFIELD ===
const canvas = document.getElementById('starfield');
if (!canvas) throw new Error('Canvas element not found');
const context = canvas.getContext('2d');
const root = document.documentElement;
let stars = [], width = 0, height = 0, pixelRatio = window.devicePixelRatio || 1;
const STAR_COUNT = 260, STAR_SPEED = 0.12;

function resizeCanvas() {
  pixelRatio = window.devicePixelRatio || 1;
  width = window.innerWidth; height = window.innerHeight;
  canvas.width = width * pixelRatio; canvas.height = height * pixelRatio;
  canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  generateStars();
}
function generateStars() {
  stars = Array.from({ length: STAR_COUNT }, () => ({
    x: Math.random() * width, y: Math.random() * height,
    radius: Math.random() * 1.4 + 0.2, alpha: Math.random() * 0.5 + 0.3,
    twinkle: Math.random() * 0.03 + 0.005, drift: Math.random() * STAR_SPEED + 0.05
  }));
}
function drawStars() {
  context.clearRect(0, 0, width, height);
  stars.forEach(star => {
    star.y += star.drift;
    if (star.y > height + star.radius) { star.y = -star.radius; star.x = Math.random() * width; }
    star.alpha += star.twinkle * (Math.random() > 0.5 ? 1 : -1);
    star.alpha = Math.min(0.9, Math.max(0.1, star.alpha));
    const glow = context.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.radius * 4);
    glow.addColorStop(0, `rgba(187,229,255,${star.alpha})`);
    glow.addColorStop(1, 'rgba(187,229,255,0)');
    context.beginPath(); context.fillStyle = glow;
    context.arc(star.x, star.y, star.radius * 4, 0, Math.PI * 2); context.fill();
  });
  requestAnimationFrame(drawStars);
}
resizeCanvas(); drawStars();
window.addEventListener('resize', resizeCanvas);

// === PARALLAX (giữ nguyên nếu cần dùng cho bg) ===
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

// ===== Capsule Button Animation (scoped) =====
(() => {
  const $wrap = document.querySelector('.capsule-demo');
  if (!$wrap) return;

  const $cap    = $wrap.querySelector('#capsule');
  const $inner  = $wrap.querySelector('#inner');
  const $arrow  = $wrap.querySelector('#downArrow');

  function primeLengths() {
    const capLen   = $cap.getTotalLength();
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
    const tInner   = parseFloat(rs.getPropertyValue('--inner-duration')) || 0;
    const baseDelay = tOutline + tInner + 0.05;

    $arrow.style.opacity = 1;
    $arrow.style.animation = 'none';

    const segDur = 0.28, stagger = 0.08;
    lines.forEach((ln, i) => {
      ln.style.animation = `capsule_line-draw ${segDur}s ease-out forwards ${baseDelay + i*stagger}s`;
    });

    const lastFinish = baseDelay + (lines.length - 1) * stagger + segDur;
    const bounceDur  = 0.8;
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
    for (const ln of $arrow.querySelectorAll('line')) ln.style.animation = 'none';

    const capLen   = $cap.getTotalLength();
    const innerLen = $inner.getTotalLength();
    $cap.style.strokeDashoffset   = capLen;
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
})();

// === Cập nhật biến --nav-h theo chiều cao thực tế của navbar ===
function setNavHeightVar(){
  const nav = document.getElementById('mainNav');
  if (!nav) return;
  const h = Math.ceil(nav.getBoundingClientRect().height);
  document.documentElement.style.setProperty('--nav-h', `${h}px`);
}
window.addEventListener('load', setNavHeightVar);
window.addEventListener('resize', setNavHeightVar);
document.addEventListener('shown.bs.collapse', setNavHeightVar);
document.addEventListener('hidden.bs.collapse', setNavHeightVar);

// Set active navigation link based on current URL
document.addEventListener("DOMContentLoaded", function() {
  // Set active link based on current page
  const currentPath = window.location.pathname.split("/").pop().toLowerCase() || 'index.html';
  
  document.querySelectorAll(".navbar .nav-link.nav-bordered").forEach(link => {
    const href = link.getAttribute("href")?.toLowerCase() || "";
    // If link matches current page
    if (href.includes(currentPath) && currentPath !== "") {
      link.classList.add("active");
    } 
    // If it's the home page (index.html)
    else if ((currentPath === 'index.html' || currentPath === '') && href.includes("index")) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  // Update active link on scroll
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".navbar .nav-link.nav-bordered");

  window.addEventListener("scroll", () => {
    let current = "";
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute("id");
      }
    });

    navLinks.forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("href").includes(current)) {
        link.classList.add("active");
      }
    });
  });
});

// === Scrollspy khởi tạo trên snap-container ===
window.addEventListener('load', () => {
  const scrollSpyEl = document.querySelector('.snap-container') || document.body;
  if (window.bootstrap && scrollSpyEl) {
    bootstrap.ScrollSpy.getOrCreateInstance(scrollSpyEl, {
      target: '#mainNav',
      offset: Math.ceil(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'))) || 100
    }).refresh();
  }
});

// === Tiêu đề Compétences/Skills: gõ chữ, giữ dấu <> cố định ===
document.addEventListener('DOMContentLoaded', () => {
  const el = document.querySelector('.typing-text');
  if (!el) return;

  const texts = ["Compétences", "Skills"]; // chỉ gõ phần chữ, <> do CSS ::before/::after
  let i = 0, pos = 0, typing = true;

  const typeDelay = 70;   // tốc độ gõ
  const holdDelay = 1400; // dừng khi gõ xong
  const eraseDelay = 45;  // tốc độ xoá

  function tick() {
    const t = texts[i];
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
        i = (i + 1) % texts.length;
      }
      setTimeout(tick, eraseDelay);
    }
  }

  // bắt đầu gõ
  el.textContent = "";
  pos = 0; typing = true; i = 0;
  tick();
});

// Fonction pour gérer les liens actifs et le défilement
function setupNavigation() {
  const currentPath = window.location.pathname.split("/").pop().toLowerCase();

  // Mettre à jour les liens actifs basés sur l'URL actuelle
  document.querySelectorAll(".navbar .nav-link.nav-bordered").forEach(link => {
    const href = link.getAttribute("href")?.toLowerCase() || "";
    if (href.includes(currentPath) && currentPath !== "") {
      link.classList.add("active");
    } 
    else if (currentPath === "" && href.includes("index")) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  // Gestion du défilement et mise à jour des liens actifs
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".navbar .nav-link.nav-bordered");

  function updateActiveSection() {
    let current = "";
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute("id") || "";
      }
    });

    navLinks.forEach(link => {
      const href = link.getAttribute("href") || "";
      link.classList.toggle("active", href.includes(current));
    });
  }

  window.addEventListener("scroll", updateActiveSection);
  updateActiveSection(); // Appel initial pour définir l'état actif
}

// Initialiser la navigation lorsque le DOM est chargé
document.addEventListener("DOMContentLoaded", setupNavigation);

// === Điều hướng: click capsule -> tới section kế tiếp ===
(function enableCapsuleNext(){
  const container = document.querySelector('.snap-container');
  const capsule = document.querySelector('.capsule-demo');
  if (!container || !capsule) return;

  const panels = Array.from(document.querySelectorAll('.panel'));

  function currentIndex(){
    const y = container.scrollTop;
    let best = 0, bestDist = Infinity;
    panels.forEach((p, idx) => {
      const dist = Math.abs(p.offsetTop - y);
      if (dist < bestDist){ bestDist = dist; best = idx; }
    });
    return best;
  }

  function scrollToIndex(i){
    const clamped = Math.max(0, Math.min(panels.length - 1, i));
    panels[clamped].scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function isOnLast(){ return currentIndex() >= panels.length - 1; }

  function updateCapsuleVisibility(){
    capsule.classList.toggle('is-hidden', isOnLast());
  }

  capsule.addEventListener('click', () => { if (!isOnLast()) scrollToIndex(currentIndex() + 1); });
  capsule.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' '){
      e.preventDefault();
      if (!isOnLast()) scrollToIndex(currentIndex() + 1);
    }
  });

  container.addEventListener('scroll', () => {
    if (enableCapsuleNext._raf) cancelAnimationFrame(enableCapsuleNext._raf);
    enableCapsuleNext._raf = requestAnimationFrame(updateCapsuleVisibility);
  });
  window.addEventListener('resize', updateCapsuleVisibility);
  document.addEventListener('activate.bs.scrollspy', updateCapsuleVisibility);

  updateCapsuleVisibility();
})();

// ===== NAV ACTIVE HIGHLIGHT: Bootstrap ScrollSpy + Fallback =====
document.addEventListener('DOMContentLoaded', () => {
  const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 80;
  const scroller  = document.querySelector('.snap-container');

  // 1) Khởi tạo ScrollSpy trên container cuộn (không phải body)
  if (scroller && window.bootstrap?.ScrollSpy) {
    // Đảm bảo container đáp ứng yêu cầu
    scroller.style.position = scroller.style.position || 'relative';
    try {
      // Destroy cũ nếu có (tránh init 2 lần khi HMR)
      const oldSpy = bootstrap.ScrollSpy.getInstance(scroller);
      if (oldSpy) oldSpy.dispose();
      new bootstrap.ScrollSpy(scroller, {
        target: '#mainNav',
        offset: navHeight + 8
      });
    } catch (e) {
      console.warn('ScrollSpy init warning:', e);
    }
  }

  // 2) Tự đóng menu khi click link (trên mobile)
  document.querySelectorAll('#mainNav .nav-link').forEach(a => {
    a.addEventListener('click', () => {
      const col = document.getElementById('mainNavCollapse');
      if (col && col.classList.contains('show')) {
        new bootstrap.Collapse(col).hide();
      }
    });
  });

  // 3) Fallback: IntersectionObserver để set .active khi Snap/ScrollSpy “khó ở”
  const links = new Map([...document.querySelectorAll('#mainNav .nav-link')].map(l => [l.getAttribute('href'), l]));
  const sections = document.querySelectorAll('main.panel[id], section.panel[id]');
  const io = new IntersectionObserver((entries) => {
    // Lấy entry nổi bật nhất trong viewport
    const visible = entries
      .filter(en => en.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;

    const id = '#' + visible.target.id;
    // Xóa active cũ
    links.forEach(el => el.classList.remove('active'));
    // Gắn active mới
    if (links.has(id)) links.get(id).classList.add('active');

    // Hiển thị/ẩn 3 nút chỉ ở A PROPOS và CONTACT
    const social = document.querySelector('.social-buttons');
    if (social) {
      social.classList.toggle('is-visible', id === '#apropos' || id === '#contact');
    }

  }, {
    root: scroller || null,          // dùng chính snap-container nếu có
    threshold: [0.5, 0.6, 0.7, 0.8]  // section chiếm ≥50% mới xem là "đang ở"
  });

  sections.forEach(sec => io.observe(sec));

  // 4) Khi load với hash, set active tức thì
  if (location.hash && links.has(location.hash)) {
    links.forEach(el => el.classList.remove('active'));
    links.get(location.hash).classList.add('active');
  }
});

