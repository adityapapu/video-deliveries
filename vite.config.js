import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import fs from 'fs';
import path from 'path';

function ConfigReplacePlugin() {
  console.log('[vite-plugin-config-replace] Plugin initialized');

  return {
    name: 'vite-plugin-config-replace',

    transformIndexHtml(html, { filename, mode }) {
      const envMode = process.env.VITE_ENV_MODE || mode || 'prod';
      const configFilePath = path.join(path.dirname(filename), `config-${envMode}.json`);

      console.log(`[vite-plugin-config-replace] Processing HTML file: ${filename}`);
      console.log(`[vite-plugin-config-replace] Using config mode: ${envMode}`);

      if (!fs.existsSync(configFilePath)) {
        console.warn(`[vite-plugin-config-replace] Warning: Config file not found at ${configFilePath}.`);
        return html;
      }

      let configData = {};
      if (fs.existsSync(configFilePath)) {
        try {
          configData = JSON.parse(fs.readFileSync(configFilePath, 'utf-8'));
        } catch (error) {
          console.error(`[vite-plugin-config-replace] Failed to parse JSON in ${configFilePath}:`, error.message);
        }
      } else {
        console.warn(`[vite-plugin-config-replace] Warning: Config file not found at ${configFilePath}.`);
      }

      return html.replace(/__([A-Z_]+)__/g, (match, p1) => {
        return configData[p1] !== undefined ? configData[p1] : match;
      });
    },

    configureServer(server) {
      console.log('[vite-plugin-config-replace] configureServer hook executed');

      server.middlewares.use((req, res, next) => {
        let filePath;

        if (req.url.endsWith('/')) {
          filePath = path.join(__dirname, req.url, 'index.html');
        } else if (req.url.endsWith('.html')) {
          filePath = path.join(__dirname, req.url);
        } else {
          next();
          return;
        }

        const envMode = process.env.VITE_ENV_MODE || 'prod';
        const configFilePath = path.join(path.dirname(filePath), `config-${envMode}.json`);

        if (fs.existsSync(filePath) && fs.existsSync(configFilePath)) {
          let html = fs.readFileSync(filePath, 'utf-8');
          let configData = {};
          if (fs.existsSync(configFilePath)) {
            try {
              configData = JSON.parse(fs.readFileSync(configFilePath, 'utf-8'));
            } catch (error) {
              console.error(`[vite-plugin-config-replace] Failed to parse JSON in ${configFilePath}:`, error.message);
            }
          } else {
            console.warn(`[vite-plugin-config-replace] Warning: Config file not found at ${configFilePath}.`);
          }

        
          html = html.replace(/___([A-Z_]+)___/g, (match, p1) => {
            return configData[p1] !== undefined ? configData[p1] : match;
          });

          res.setHeader('Content-Type', 'text/html');
          res.end(html);
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig(({ command, mode }) => {
  const inputFile = process.env.INPUT_FILE ? path.resolve(__dirname, process.env.INPUT_FILE) : path.resolve(__dirname, 'index.html');
  const outputDir = process.env.OUTPUT_DIR ? path.resolve(__dirname, process.env.OUTPUT_DIR) : path.resolve(__dirname, 'dist');

  return {
    plugins: [
      viteSingleFile({ removeViteModuleLoader: true }),
      ConfigReplacePlugin(),
    ],
    build: {
      rollupOptions: {
        input: inputFile,
        output: {
          entryFileNames: '[name].html',
        }
      },
      outDir: outputDir,
      emptyOutDir: false,
      target: 'esnext',
      assetsInlineLimit: 100000000,
    },
  };
});
