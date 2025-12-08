const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

const functions = ['get-expenses', 'create-expense', 'update-expense', 'delete-expense'];
const srcDir = path.join(__dirname, '..', 'src');
const distDir = path.join(__dirname, '..', 'dist');

// Create dist directory if it doesn't exist
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Bundle each function
async function bundleAll() {
  const promises = functions.map(async (funcName) => {
    const entryPoint = path.join(srcDir, 'expenses', funcName, 'index.ts');
    const outfile = path.join(distDir, funcName, 'index.js');

    // Create function directory
    const funcDir = path.dirname(outfile);
    if (!fs.existsSync(funcDir)) {
      fs.mkdirSync(funcDir, { recursive: true });
    }

    try {
      await esbuild.build({
        entryPoints: [entryPoint],
        bundle: true,
        platform: 'node',
        target: 'node20',
        format: 'cjs',
        outfile: outfile,
        external: ['@aws-sdk/*'],
        minify: true,
        sourcemap: true,
      });
      console.log(`✓ Bundled ${funcName}`);
    } catch (error) {
      console.error(`✗ Failed to bundle ${funcName}:`, error);
      throw error;
    }
  });

  await Promise.all(promises);
  console.log('✓ All functions bundled successfully');
}

bundleAll().catch((error) => {
  console.error('Build failed:', error);
  process.exit(1);
});

