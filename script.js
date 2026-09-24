/* ============================================================
   ANIMATED WIREFRAME BACKGROUND
   ============================================================ */
(function initBg() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W = 0, H = 0, dpr = 1;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  const COLS = 14;
  const ROWS = 20;
  const AMP  = 14;
  const PERSPECTIVE = 0.35;

  const cubes = [
    { x: -0.25, y: -0.15, size: 26, speed:  0.15, phase: 0.0, z: 1.0 },
    { x:  0.30, y:  0.10, size: 20, speed: -0.20, phase: 1.4, z: 0.9 },
    { x:  0.05, y:  0.35, size: 16, speed:  0.25, phase: 2.6, z: 0.8 },
    { x: -0.35, y:  0.30, size: 22, speed: -0.12, phase: 3.9, z: 0.85 }
  ];

  const CUBE_VERTS = [
    [-1,-1,-1],[ 1,-1,-1],[ 1, 1,-1],[-1, 1,-1],
    [-1,-1, 1],[ 1,-1, 1],[ 1, 1, 1],[-1, 1, 1]
  ];
  const CUBE_EDGES = [
    [0,1],[1,2],[2,3],[3,0],
    [4,5],[5,6],[6,7],[7,4],
    [0,4],[1,5],[2,6],[3,7]
  ];

  function rotY(p, a) {
    const c = Math.cos(a), s = Math.sin(a);
    return [p[0]*c + p[2]*s, p[1], -p[0]*s + p[2]*c];
  }
  function rotX(p, a) {
    const c = Math.cos(a), s = Math.sin(a);
    return [p[0], p[1]*c - p[2]*s, p[1]*s + p[2]*c];
  }

  function drawGrid(t) {
    const stepX = W / (COLS - 1);
    const stepY = H / (ROWS - 1);

    const points = [];
    for (let j = 0; j < ROWS; j++) {
      const row = [];
      for (let i = 0; i < COLS; i++) {
        const x = i * stepX;
        const y = j * stepY;
        const wave =
          Math.sin(i * 0.55 + t * 0.0009) * 0.5 +
          Math.sin(j * 0.42 - t * 0.0007) * 0.5;
        const z = wave * AMP;
        const depth = 1 + (j / ROWS) * PERSPECTIVE * 0.15;
        row.push([x, y + z * 0.25, z * depth]);
      }
      points.push(row);
    }

    ctx.lineWidth = 1;

    for (let j = 0; j < ROWS; j++) {
      for (let i = 0; i < COLS - 1; i++) {
        const a = points[j][i];
        const b = points[j][i + 1];
        const depth = (a[2] + b[2]) / (2 * AMP);
        const alpha = 0.05 + Math.max(0, depth) * 0.10;
        ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
        ctx.beginPath();
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(b[0], b[1]);
        ctx.stroke();
      }
    }
    for (let i = 0; i < COLS; i++) {
      for (let j = 0; j < ROWS - 1; j++) {
        const a = points[j][i];
        const b = points[j + 1][i];
        const depth = (a[2] + b[2]) / (2 * AMP);
        const alpha = 0.05 + Math.max(0, depth) * 0.10;
        ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
        ctx.beginPath();
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(b[0], b[1]);
        ctx.stroke();
      }
    }
  }

  function drawCube(cx, cy, size, rx, ry) {
    const verts = CUBE_VERTS.map(v => {
      let p = rotY(v, ry);
      p = rotX(p, rx);
      const persp = 1 / (1 - p[2] * 0.12);
      return [
        cx + p[0] * size * persp,
        cy + p[1] * size * persp
      ];
    });

    ctx.strokeStyle = 'rgba(255,255,255,0.20)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (const [a, b] of CUBE_EDGES) {
      ctx.moveTo(verts[a][0], verts[a][1]);
      ctx.lineTo(verts[b][0], verts[b][1]);
    }
    ctx.stroke();
  }

  function frame(t) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);

    drawGrid(t);

    const cx0 = W / 2;
    const cy0 = H / 2;
    const radius = Math.min(W, H) * 0.55;
    for (const c of cubes) {
      const cxp = cx0 + c.x * radius + Math.sin(t * 0.0004 + c.phase) * 10;
      const cyp = cy0 + c.y * radius + Math.cos(t * 0.0005 + c.phase) * 8;
      drawCube(cxp, cyp, c.size, t * 0.0008 * c.speed, t * 0.0006 * c.speed + c.phase);
    }

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
})();

/* ============================================================
   APP LOGIC
   ============================================================ */
const CURRENT_VERSION_CODE = 1;

const burger = document.getElementById('burger');
if (burger) {
  burger.addEventListener('click', () => {
    alert('Меню появится в следующих версиях');
  });
}

async function checkVersion() {
  const url = 'https://raw.githubusercontent.com/ВАШ_ЛОГИН/ВАШ_РЕПОЗИТОРИЙ/main/version.json?t=' + Date.now();
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return;
    const data = await res.json();
    if (typeof data.latestVersionCode === 'number' &&
        data.latestVersionCode > CURRENT_VERSION_CODE) {
      if (data.forceUpdate) showBlockingUpdate(data);
    }
  } catch (e) {
    console.log('Version check failed:', e);
  }
}

function showBlockingUpdate(data) {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 100000;
    background: #000; color: #e6e0e9;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 32px; text-align: center;
    font-family: Roboto, system-ui, sans-serif;
  `;
  const msg = data.message || 'Вышла новая версия. Пожалуйста, обновитесь.';
  overlay.innerHTML = `
    <h2 style="font-size:22px;font-weight:500;margin-bottom:12px;">Доступно обновление</h2>
    <p style="color:#cac4d0;font-size:14px;line-height:1.55;margin-bottom:28px;max-width:420px;">${msg}</p>
    <a href="${data.updateUrl}" style="
      display: inline-flex; align-items: center; justify-content: center;
      padding: 14px 28px;
      background: #d0bcff; color: #381e72;
      text-decoration: none; font-weight: 500; font-size: 15px;
      border-radius: 100px;
    ">Скачать обновление</a>
  `;
  document.body.appendChild(overlay);
}

window.addEventListener('load', checkVersion);