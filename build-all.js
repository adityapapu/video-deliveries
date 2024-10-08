import { execSync } from 'child_process';
import { resolve, basename, dirname } from 'path';
import { readdirSync, statSync, mkdirSync, renameSync, existsSync, rmSync } from 'fs';

// Recursively get all HTML files in the "customers" directory
function getCustomerPages(dirPath, basePath = '') {
  const entries = readdirSync(dirPath);
  let pages = [];

  for (const entry of entries) {
    const fullPath = resolve(dirPath, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      pages = [...pages, ...getCustomerPages(fullPath, `${basePath}${entry}/`)];
    } else if (stats.isFile() && entry.endsWith('.html')) {
      pages.push({ path: fullPath, name: `${basePath}${entry.replace('.html', '')}` });
    }
  }

  return pages;
}

const customerPages = getCustomerPages(resolve(process.cwd(), 'customers'));

customerPages.forEach(page => {
  const outputDir = resolve('dist', page.name);
  const outputFileName = basename(page.path); // Should be 'index.html'

  console.log(`Building: ${page.path} into ${outputDir}`);
  
  try {
    // Set INPUT_FILE and OUTPUT_DIR environment variables for each build
    execSync(`INPUT_FILE=${page.path} OUTPUT_DIR=dist/temp npm run build`, { stdio: 'inherit', shell: true });

    // Move the generated HTML file to the correct output directory after the build
    const builtFilePath = resolve('dist/temp', outputFileName);
    
    if (existsSync(builtFilePath)) {
      mkdirSync(outputDir, { recursive: true });
      const targetFilePath = resolve(outputDir, 'index.html');
      
      renameSync(builtFilePath, targetFilePath);
      console.log(`Moved built file to: ${targetFilePath}`);
    } else {
      console.error(`Error: Built file not found at ${builtFilePath}`);
    }

    // Clean up the temporary directory
    cleanEmptyDirs(resolve('dist/temp'));

  } catch (error) {
    console.error(`Failed to build: ${page.path}`);
    console.error(`Error details: ${error.message}`);
  }
});

// Helper function to clean empty directories
function cleanEmptyDirs(dirPath) {
  if (!existsSync(dirPath) || !statSync(dirPath).isDirectory()) {
    return;
  }

  const files = readdirSync(dirPath);
  files.forEach(file => {
    const currentPath = resolve(dirPath, file);
    if (statSync(currentPath).isDirectory()) {
      cleanEmptyDirs(currentPath);
    }
  });

  // Re-check if the directory is empty after cleaning children
  if (readdirSync(dirPath).length === 0) {
    rmSync(dirPath, { recursive: true, force: true });
  }
}
