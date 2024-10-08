import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { resolve, basename } from 'path';

export default defineConfig(({ command, mode }) => {
  const inputFile = process.env.INPUT_FILE ? resolve(__dirname, process.env.INPUT_FILE) : resolve(__dirname, 'index.html');
  const outputDir = process.env.OUTPUT_DIR ? resolve(__dirname, process.env.OUTPUT_DIR) : resolve(__dirname, 'dist');

  return {
    plugins: [viteSingleFile({ removeViteModuleLoader: true })],
    build: {
      rollupOptions: {
        input: inputFile,
        output: {
          entryFileNames: '[name].html', // This should prevent extra nesting
        }
      },
      outDir: outputDir,
      emptyOutDir: false, // Prevent clearing the dist folder for each individual build
      target: 'esnext', // Ensures modern JS is supported for better inlining
      assetsInlineLimit: 100000000, // Set a high limit to ensure everything gets inlined properly
    },
  };
});
