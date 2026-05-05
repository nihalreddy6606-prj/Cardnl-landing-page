const canvas = document.querySelector("#shader-bg");
const ctx = canvas.getContext("2d", { alpha: false });

const settings = {
  bgColor1: "#000000",
  bgColor2: "#000000",
  color1: "#803731",
  color2: "#0043ca",
  color3: "#212121",
  rotationX: 50,
  rotationZ: -60,
  uDensity: 1.5,
  uSpeed: 0.3,
  uStrength: 1.5,
  reflection: 0.1,
  cameraZoom: 9.1,
};

let width = 0;
let height = 0;
let dpr = 1;

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function draw(time) {
  const t = time * 0.00018 * settings.uSpeed + 8;
  const horizon = height * 0.5;
  const rows = 80;
  const cols = 100;
  const rowHeight = height / rows;
  const colWidth = width / cols;

  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, settings.bgColor1);
  bg.addColorStop(0.52, "#030303");
  bg.addColorStop(1, settings.bgColor2);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  const redGlow = ctx.createRadialGradient(width * 0.16, height * 0.18, 0, width * 0.16, height * 0.18, width * 0.72);
  redGlow.addColorStop(0, "rgba(128, 55, 49, 0.75)");
  redGlow.addColorStop(0.42, "rgba(128, 55, 49, 0.17)");
  redGlow.addColorStop(1, "rgba(128, 55, 49, 0)");
  ctx.fillStyle = redGlow;
  ctx.fillRect(0, 0, width, height);

  const blueGlow = ctx.createRadialGradient(width * 0.78, height * 0.34, 0, width * 0.78, height * 0.34, width * 0.78);
  blueGlow.addColorStop(0, "rgba(0, 67, 202, 0.82)");
  blueGlow.addColorStop(0.38, "rgba(0, 67, 202, 0.2)");
  blueGlow.addColorStop(1, "rgba(0, 67, 202, 0)");
  ctx.fillStyle = blueGlow;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.translate(width * 0.5, horizon);
  ctx.rotate((settings.rotationZ * Math.PI) / 180);
  ctx.translate(-width * 0.5, -horizon);
  ctx.globalCompositeOperation = "screen";

  for (let y = 0; y < rows; y += 1) {
    const depth = y / rows;
    const perspective = Math.pow(depth, 1.9);
    const py = horizon + perspective * height * 0.72;
    const alpha = Math.max(0, 0.34 - depth * 0.25);

    ctx.beginPath();
    for (let x = 0; x <= cols; x += 1) {
      const px = x * colWidth;
      const wave =
        Math.sin(x * 0.18 * settings.uDensity + y * 0.12 + t * 6) * 16 +
        Math.sin(x * 0.05 - y * 0.2 + t * 3) * 20;
      const lift = wave * settings.uStrength * (0.12 + depth * 0.88);
      const pointY = py + lift;

      if (x === 0) {
        ctx.moveTo(px, pointY);
      } else {
        ctx.lineTo(px, pointY);
      }
    }

    ctx.strokeStyle = y % 3 === 0 ? `rgba(0, 67, 202, ${alpha})` : `rgba(128, 55, 49, ${alpha * 0.8})`;
    ctx.lineWidth = 1 + depth * 2.2;
    ctx.stroke();
  }

  for (let x = -12; x < cols + 12; x += 3) {
    ctx.beginPath();
    for (let y = 0; y <= rows; y += 1) {
      const depth = y / rows;
      const py = horizon + Math.pow(depth, 1.85) * height * 0.72;
      const spread = (x - cols / 2) * colWidth * (0.18 + depth * 1.45);
      const wave = Math.sin(y * 0.38 + x * 0.2 + t * 5) * 18 * depth;
      const px = width * 0.5 + spread + wave;

      if (y === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }

    ctx.strokeStyle = "rgba(244, 239, 233, 0.035)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  ctx.restore();
  ctx.globalCompositeOperation = "source-over";

  const vignette = ctx.createRadialGradient(width * 0.5, height * 0.42, height * 0.18, width * 0.5, height * 0.42, width * 0.78);
  vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
  vignette.addColorStop(1, "rgba(0, 0, 0, 0.76)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);

  requestAnimationFrame(draw);
}

resize();
window.addEventListener("resize", resize);
requestAnimationFrame(draw);
