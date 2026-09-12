/**
 * Script tự động sinh bộ tài liệu kỹ thuật & đặc tả dự án QTDND_YenTho_Luong
 */
const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, '..', 'docs');
if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });

console.log('Docs directory ready:', docsDir);
