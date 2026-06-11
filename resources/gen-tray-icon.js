const sharp = require('sharp');
const path = require('path');

// 托盘图标：滴答清单风格的勾选（单色，用于 Template Image）
const size = 44;
const padding = 4;

// 生成 SVG（简洁勾选）
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <path d="M${padding + 6} ${size / 2 + 2} L${size / 2 - 2} ${size - padding - 6} L${size - padding - 6} ${padding + 6}" 
        fill="none" stroke="black" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const outputPath = path.join(__dirname, 'tray-icon.png');

sharp(Buffer.from(svg))
  .resize(size, size)
  .png()
  .toFile(outputPath)
  .then(() => {
    console.log('Tray icon generated:', outputPath);
  })
  .catch(err => {
    console.error('Error:', err);
  });
