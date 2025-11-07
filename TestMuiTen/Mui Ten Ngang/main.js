const cap   = document.getElementById('capsule');
const inner = document.getElementById('inner');
const arrow = document.getElementById('downArrow');

function primeLengths() {
  const capLen   = cap.getTotalLength();
  const innerLen = inner.getTotalLength();
  cap.style.setProperty('--cap-len', capLen);
  inner.style.setProperty('--inner-len', innerLen);
}

function prepArrowDraw() {
  const lines = Array.from(arrow.querySelectorAll('line'));

  // reset + chuẩn bị dash
  for (const ln of lines) {
    const len = ln.getTotalLength();
    ln.style.setProperty('--len', len);
    ln.style.strokeDasharray = String(len);
    ln.style.strokeDashoffset = String(len);
    ln.style.animation = 'none';
  }

  // Thứ tự trái -> giữa -> phải
  lines.sort((a, b) => {
    const ax = Math.min(a.x1.baseVal.value, a.x2.baseVal.value);
    const bx = Math.min(b.x1.baseVal.value, b.x2.baseVal.value);
    return ax - bx;
  });

  // Bắt đầu sau outline + inner
  const rs = getComputedStyle(document.documentElement);
  const tOutline = parseFloat(rs.getPropertyValue('--outline-duration')) || 0;
  const tInner   = parseFloat(rs.getPropertyValue('--inner-duration')) || 0;
  const baseDelay = tOutline + tInner + 0.05;

  arrow.style.opacity = 1;
  arrow.style.animation = 'none';

  const segDur = 0.28, stagger = 0.08;
  lines.forEach((ln, i) => {
    ln.style.animation = `line-draw ${segDur}s ease-out forwards ${baseDelay + i*stagger}s`;
  });

  const lastFinish = baseDelay + (lines.length - 1) * stagger + segDur;
  const bounceDur  = 0.8;
  arrow.style.animation = `bounce-twice ${bounceDur}s ease-in-out ${lastFinish}s 1 forwards`;

  arrow.onanimationend = (e) => {
    if (e.animationName === 'bounce-twice') setTimeout(replay, 60);
  };
}

function alignInnerToArrow(targetX = 100, targetY = 284, fine = {dx:0, dy:0}) {
  inner.removeAttribute('transform'); // đo trước
  const L   = inner.getTotalLength();
  const P1  = inner.getPointAtLength(Math.max(0, L - 0.01));
  const P2  = inner.getPointAtLength(L);

  let ux = P2.x - P1.x, uy = P2.y - P1.y;
  const norm = Math.hypot(ux, uy) || 1;
  ux /= norm; uy /= norm;

  const sw  = parseFloat(getComputedStyle(inner).strokeWidth) || 6;
  const capComp = sw / 2;

  const visualEndX = P2.x + ux * capComp;
  const visualEndY = P2.y + uy * capComp;

  const dx = (targetX - visualEndX) + (fine.dx || 0);
  const dy = (targetY - visualEndY) + (fine.dy || 0);

  inner.setAttribute('transform', `translate(${dx}, ${dy})`);
  primeLengths();
}

function replay() {
  // Reset animations
  cap.style.animation = 'none';
  inner.style.animation = 'none';

  // Reset dash/opacity
  cap.style.strokeDashoffset   = cap.style.getPropertyValue('--cap-len');
  inner.style.strokeDashoffset = inner.style.getPropertyValue('--inner-len');
  inner.style.opacity = 0;

  // Reset arrow
  arrow.style.opacity = 0;
  arrow.style.animation = 'none';
  for (const ln of arrow.querySelectorAll('line')) ln.style.animation = 'none';

  // Reflow
  void cap.getBoundingClientRect();

  // Chạy outline + inner
  cap.style.animation = `draw-outline var(--outline-duration) var(--ease) forwards`;
  inner.style.animation =
    `fade-in .01s linear forwards var(--outline-duration),
     draw-inner var(--inner-duration) var(--ease) forwards calc(var(--outline-duration) + .05s),
     fade-out .25s ease forwards calc(var(--outline-duration) + var(--inner-duration) + .05s)`;

  // Mũi tên: vẽ các nét → nhún 2 lần → tự lặp
  prepArrowDraw();
}

// Khởi tạo
primeLengths();
alignInnerToArrow(100, 284);
replay();
