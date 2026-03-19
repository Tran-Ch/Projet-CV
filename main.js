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

// === HIỆU ỨNG LOGO + CHỮ ===
window.addEventListener('load', () => {
    const logoLeft = document.querySelector('.logo-container-left');
    const logoRight = document.querySelector('.logo-container-right');
    const textInside = document.querySelector('.hero__text-inside');

    if (logoLeft && logoRight && textInside) {
        // Logo trượt ra sau 3 giây
        setTimeout(() => {
            logoLeft.classList.add('move-left');
            logoRight.classList.add('move-right');
        }, 3000);

        // Sau khi logo trượt xong, hiển thị chữ
        setTimeout(() => {
            textInside.classList.add('show-text');
        }, 4800);
    }
});

// === RELOAD HANDLER ===
const reloadHandler = document.querySelector('.signature__reload-all');
if (reloadHandler) {
    const reload = () => window.location.reload();

    reloadHandler.addEventListener('click', reload);

    reloadHandler.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            reload();
        }
    });
}

// ===== Capsule Button Animation (scoped) =====
(() => {
  const root = document.documentElement;
  const $wrap = document.querySelector('.capsule-demo');
  if (!$wrap) return;

  const $svg    = $wrap.querySelector('.capsule-svg');
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
    // reset dash
    for (const ln of lines) {
      const len = ln.getTotalLength();
      ln.style.setProperty('--len', len);
      ln.style.strokeDasharray = String(len);
      ln.style.strokeDashoffset = String(len);
      ln.style.animation = 'none';
    }
    // thứ tự trái -> giữa -> phải
    lines.sort((a, b) => {
      const ax = Math.min(a.x1.baseVal.value, a.x2.baseVal.value);
      const bx = Math.min(b.x1.baseVal.value, b.x2.baseVal.value);
      return ax - bx;
    });

    const rs = getComputedStyle(root);
    const tOutline = parseFloat(rs.getPropertyValue('--outline-duration')) || 0;
    const tInner   = parseFloat(rs.getPropertyValue('--inner-duration')) || 0;
    const baseDelay = tOutline + tInner + 0.05;

    // hiện mũi tên & vẽ từng nét
    $arrow.style.opacity = 1;
    $arrow.style.animation = 'none';

    const segDur = 0.28, stagger = 0.08;
    lines.forEach((ln, i) => {
      ln.style.animation = `capsule_line-draw ${segDur}s ease-out forwards ${baseDelay + i*stagger}s`;
    });

    // nhún 2 lần sau khi vẽ xong
    const lastFinish = baseDelay + (lines.length - 1) * stagger + segDur;
    const bounceDur  = 0.8;
    $arrow.style.animation = `capsule_bounce-twice ${bounceDur}s ease-in-out ${lastFinish}s 1 forwards`;

    $arrow.onanimationend = (e) => {
      if (e.animationName === 'capsule_bounce-twice') {
        setTimeout(replay, 60); // tự lặp lại toàn bộ
      }
    };
  }

  // căn đường xanh “khớp” đỉnh mũi tên (giữ nguyên logic chuẩn)
  function alignInnerToArrow(targetX = 100, targetY = 284, fine = {dx:0, dy:0}) {
    $inner.removeAttribute('transform');
    const L   = $inner.getTotalLength();
    const P1  = $inner.getPointAtLength(Math.max(0, L - 0.01));
    const P2  = $inner.getPointAtLength(L);
    let ux = P2.x - P1.x, uy = P2.y - P1.y;
    const norm = Math.hypot(ux, uy) || 1;
    ux /= norm; uy /= norm;
    const sw  = parseFloat(getComputedStyle($inner).strokeWidth) || 6;
    const capComp = sw / 2;
    const visualEndX = P2.x + ux * capComp;
    const visualEndY = P2.y + uy * capComp;
    const dx = (targetX - visualEndX) + (fine.dx || 0);
    const dy = (targetY - visualEndY) + (fine.dy || 0);
    $inner.setAttribute('transform', `translate(${dx}, ${dy})`);
    primeLengths();
  }

  function replay() {
    // reset vòng trắng + đường xanh
    $cap.style.animation = 'none';
    $inner.style.animation = 'none';
    $inner.style.opacity = 0;

    // reset mũi tên
    $arrow.style.opacity = 0;
    $arrow.style.animation = 'none';
    for (const ln of $arrow.querySelectorAll('line')) ln.style.animation = 'none';

    // cập nhật dashoffset theo length thật
    const capLen   = $cap.getTotalLength();
    const innerLen = $inner.getTotalLength();
    $cap.style.strokeDashoffset   = capLen;
    $inner.style.strokeDashoffset = innerLen;

    // reflow
    void $cap.getBoundingClientRect();

    // chạy lại outline + inner
    $cap.style.animation = `capsule_draw-outline var(--outline-duration) var(--ease) forwards`;
    $inner.style.animation =
      `capsule_fade-in .01s linear forwards var(--outline-duration),
       capsule_draw-inner var(--inner-duration) var(--ease) forwards calc(var(--outline-duration) + .05s),
       capsule_fade-out .25s ease forwards calc(var(--outline-duration) + var(--inner-duration) + .05s)`;

    // vẽ mũi tên
    prepArrowDraw();
  }

  // init
  primeLengths();
  alignInnerToArrow(100, 284);
  replay();

  // nếu viewport thay đổi nhiều, có thể tính lại
  window.addEventListener('resize', () => {
    primeLengths();
  });
})();
