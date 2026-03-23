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

  const $cap = $wrap.querySelector('#capsule');
  const $inner = $wrap.querySelector('#inner');
  const $arrow = $wrap.querySelector('#downArrow');

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
})();

// === Cập nhật biến --nav-h theo chiều cao thực tế của navbar ===
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

// === Tiêu đề: gõ chữ cho A PROPOS / COMPÉTENCES / FORMATION / PORTFOLIO / CONTACT ===
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

// ===== NAV ACTIVE HIGHLIGHT: Bootstrap ScrollSpy + Fallback =====
document.addEventListener('DOMContentLoaded', () => {
  const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 80;
  const scroller = document.querySelector('.snap-container');

  if (scroller && window.bootstrap?.ScrollSpy) {
    scroller.style.position = scroller.style.position || 'relative';

    try {
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

  document.querySelectorAll('#mainNav .nav-link').forEach(a => {
    a.addEventListener('click', () => {
      const col = document.getElementById('mainNavCollapse');
      if (col && col.classList.contains('show')) {
        new bootstrap.Collapse(col).hide();
      }
    });
  });

  const links = new Map(
    [...document.querySelectorAll('#mainNav .nav-link')].map(l => [l.getAttribute('href'), l])
  );

  const sections = document.querySelectorAll('main.panel[id], section.panel[id]');

  const io = new IntersectionObserver((entries) => {
    const visible = entries
      .filter(en => en.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;

    const id = '#' + visible.target.id;

    links.forEach(el => el.classList.remove('active'));
    if (links.has(id)) links.get(id).classList.add('active');

    const social = document.querySelector('.social-buttons');
    if (social) {
      social.classList.toggle('is-visible', id === '#apropos' || id === '#contact');
    }
  }, {
    root: scroller || null,
    threshold: [0.5, 0.6, 0.7, 0.8]
  });

  sections.forEach(sec => io.observe(sec));

  if (location.hash && links.has(location.hash)) {
    links.forEach(el => el.classList.remove('active'));
    links.get(location.hash).classList.add('active');
  }
});

// === Điều hướng: click capsule -> tới section kế tiếp ===
(function enableCapsuleNext() {
  const container = document.querySelector('.snap-container');
  const capsule = document.querySelector('.capsule-demo');
  if (!container || !capsule) return;

  const panels = Array.from(document.querySelectorAll('.panel'));

  function currentIndex() {
    const y = container.scrollTop;
    let best = 0;
    let bestDist = Infinity;

    panels.forEach((p, idx) => {
      const dist = Math.abs(p.offsetTop - y);
      if (dist < bestDist) {
        bestDist = dist;
        best = idx;
      }
    });

    return best;
  }

  function scrollToIndex(i) {
    const clamped = Math.max(0, Math.min(panels.length - 1, i));
    panels[clamped].scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function isOnLast() {
    return currentIndex() >= panels.length - 1;
  }

  function updateCapsuleVisibility() {
    capsule.classList.toggle('is-hidden', isOnLast());
  }

  capsule.addEventListener('click', () => {
    if (!isOnLast()) scrollToIndex(currentIndex() + 1);
  });

  capsule.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
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

// === JS: đo front/back, thay đổi chiều cao thẻ để đẩy các item dưới xuống ===
window.addEventListener('load', function () {
  document.querySelectorAll('.flip-card').forEach(function (card) {
    const front = card.querySelector('.flip-front');
    const back = card.querySelector('.flip-back');
    const inner = card.querySelector('.flip-inner');

    if (!front || !back || !inner) return;

    const frontH = front.scrollHeight;
    const backH = back.scrollHeight;
    const maxH = Math.max(frontH, backH);

    card.style.height = frontH + 'px';
    inner.style.height = maxH + 'px';

    card.dataset.frontHeight = frontH;
    card.dataset.maxHeight = maxH;

    card.addEventListener('mouseenter', function () {
      card.style.height = card.dataset.maxHeight + 'px';
    });

    card.addEventListener('mouseleave', function () {
      card.style.height = card.dataset.frontHeight + 'px';
    });
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

// === JS: mở/close modal chi tiết dự án ===
document.addEventListener('DOMContentLoaded', function () {
  const modal = document.getElementById('projectModal');
  const closeBtn = document.querySelector('.close-btn');
  const seeMoreButtons = document.querySelectorAll('.overlay-link');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');
  const modalImg = document.getElementById('modal-img');
  const modalDemo = document.getElementById('modal-demo');
  const modalGithub = document.getElementById('modal-github');
  const modalTags = document.getElementById('modal-tags');

  if (!modal || !closeBtn) return;

  // Dữ liệu link demo / github / tags / ảnh riêng cho từng project
  // Có thể thay bằng link thật của từng project sau này
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
      demo: '#',
      github: 'https://github.com/Tran-Ch/Projet-CV.git',
      tags: ['Html', 'CSS', 'Javascript'],
      modalImage: '../photos/photo3-1.png',
      description: "J’ai imaginé ce CV interactif comme bien plus qu’une simple présentation professionnelle : une véritable expérience immersive. En combinant JavaScript vanilla et CSS3, avec des effets glitch, j’ai voulu créer une interface vivante, fluide et entièrement responsive, capable de capter l’attention et de marquer durablement les esprits."
    },
    'Digital Ecosystem': {
      demo: ' https://tran-ch.github.io/Digital-Ecosystem/',
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
      description: "Comming soon..."
    }
  };

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

  seeMoreButtons.forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();

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

  // Đóng modal khi click nút X
  closeBtn.addEventListener('click', closeModal);

  // Đóng modal khi click ra ngoài modal-content
  modal.addEventListener('click', function (event) {
    if (event.target === modal) {
      closeModal();
    }
  });

  // Đóng modal bằng phím ESC
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && modal.classList.contains('show')) {
      closeModal();
    }
  });
});

// === CONTACT FORM: gửi bằng Formspree ===
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