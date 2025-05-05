import { defineConfig } from 'vite';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import dts from 'vite-plugin-dts';

// https://vite.dev/config/
export default defineConfig({
  esbuild: {
    // Completely disable TypeScript checking
    tsconfigRaw: '{ "compilerOptions": { "module": "esnext", "moduleResolution": "bundler" } }',
  },
  plugins: [
    react({
      // Disable TypeScript checking in the React plugin
      tsDecorators: true,
    }),
    tailwindcss()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'Speechly',
      fileName: (format) => `speechly.${format}.js`,
      formats: ['es', 'umd']
    },
    rollupOptions: {
      // Make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['react', 'react-dom'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        },
        // Add this to inject CSS into the JS bundle
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'speechly.css';
          return assetInfo.name;
        },
      }
    },
    // Add this to inject CSS into the JS bundle
    cssCodeSplit: false,
    // This ensures CSS is included in the bundle
    emptyOutDir: true,
  },
  css: {
    // This ensures CSS is injected into the JS bundle
    inject: true,
  }
});
