const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const svg = document.getElementById('doodleSVG');

let currentMode = 'brush'; // 'brush' or 'fill'
let drawing = false;
let color = document.getElementById('colorPicker').value;
let brushTexture = new Image();
brushTexture.src = 'assets/pencil-texture.png'; // tekstur pensil kecil

// Mode switching
document.getElementById('brushMode').addEventListener('click', () => currentMode = 'brush');
document.getElementById('fillMode').addEventListener('click', () => currentMode = 'fill');
document.getElementById('colorPicker').addEventListener('input', e => color = e.target.value);

// Brush drawing
canvas.addEventListener('mousedown', () => {
  if (currentMode === 'brush') drawing = true;
});
canvas.addEventListener('mouseup', () => drawing = false);
canvas.addEventListener('mousemove', e => {
  if (drawing && currentMode === 'brush') {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const pattern = ctx.createPattern(brushTexture, 'repeat');
    ctx.strokeStyle = color;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 0.5, y + 0.5);
    ctx.stroke();
    ctx.closePath();
  }
});

// Fill mode
svg.addEventListener('click', e => {
  if (currentMode === 'fill' && e.target.tagName === 'path' || e.target.tagName === 'circle') {
    e.target.setAttribute('fill', color);
  }
});

// Save
document.getElementById('save').addEventListener('click', () => {
  const dataURL = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = 'doodle.png';
  link.click();
});
