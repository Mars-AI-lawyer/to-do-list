const sharp = require('sharp');
const path = require('path');

// 滴答清单风格图标：大胆白色勾选 + 蓝色渐变背景
const size = 512;

// 生成 SVG
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#4C8BF5"/>
      <stop offset="100%" stop-color="#3B6DD6"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="6" stdDeviation="12" flood-color="#000" flood-opacity="0.2"/>
    </filter>
  </defs>

  <!-- 背景圆角矩形 -->
  <rect x="16" y="16" width="${size - 32}" height="${size - 32}" rx="100" ry="100" fill="url(#bg)" filter="url(#shadow)"/>

  <!-- 勾选标记 - 滴答清单风格：粗壮、圆润 -->
  <path d="M150 275 L220 350 L370 170" fill="none" stroke="white" stroke-width="52" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const outputPath = path.join(__dirname, 'icon.png');

sharp(Buffer.from(svg))
  .resize(size, size)
  .png()
  .toFile(outputPath)
  .then(() => {
    console.log('App icon generated:', outputPath);
  })
  .catch(err => {
    console.error('Error:', err);
  });
