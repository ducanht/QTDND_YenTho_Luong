import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import fs from 'fs';
import path from 'path';

// Plugin tự động sao chép index.html sang gas_backend/Index.html sau khi build
function copyToBackendGasPlugin() {
  return {
    name: 'copy-to-backend-gas',
    closeBundle() {
      const distHtmlPath = path.resolve(__dirname, 'dist/index.html');
      const gasHtmlPath = path.resolve(__dirname, '../gas_backend/Index.html');

      if (fs.existsSync(distHtmlPath)) {
        let content = fs.readFileSync(distHtmlPath, 'utf-8');
        if (!content.includes('__INITIAL_DATA__')) {
          content = content.replace('</body>', '<script>window.__INITIAL_DATA__ = <?!= initialData ?>;</script></body>');
        }
        fs.writeFileSync(gasHtmlPath, content, 'utf-8');
        console.log('\n[Vite Plugin] ✅ Đã tự động sao chép index.html tối ưu sang gas_backend/Index.html!');
      }
    }
  };
}

export default defineConfig({
  plugins: [
    react(),
    viteSingleFile(),
    copyToBackendGasPlugin()
  ],
  build: {
    target: 'es2015',
    cssCodeSplit: false,
    assetsInlineLimit: 100000000,
    outDir: 'dist',
    sourcemap: false
  }
});
