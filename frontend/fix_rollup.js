import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nativeJsPath = path.join(__dirname, 'node_modules', 'rollup', 'dist', 'native.js');

if (fs.existsSync(nativeJsPath)) {
  let content = fs.readFileSync(nativeJsPath, 'utf8');
  if (content.includes('const nativeModule = requireWithFriendlyError(')) {
    content = content.replace(
      /const nativeModule = requireWithFriendlyError\([\s\S]*?\);/,
      `let nativeModule;\ntry {\n\tnativeModule = requireWithFriendlyError(\n\t\texistsSync(path.join(__dirname, localName)) ? localName : \`@rollup/rollup-\${packageBase}\`\n\t);\n} catch (e) {\n\tnativeModule = require('@rollup/wasm-node/dist/native.js');\n}`
    );
    fs.writeFileSync(nativeJsPath, content, 'utf8');
    console.log('Successfully patched rollup native.js for Wasm fallback');
  }
}

