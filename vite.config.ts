import { defineConfig } from 'vite';
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const source = createHash('sha256');
const files = readdirSync('src', { recursive: true, withFileTypes: true })
  .filter(entry => entry.isFile()).map(entry => `${entry.parentPath}/${entry.name}`.replaceAll('\\', '/'));
for (const file of [...files, 'vite.config.ts', 'package-lock.json'].sort()) source.update(file).update(readFileSync(file));
const build = { commit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), sourceHash: source.digest('hex') };

export default defineConfig({
  base: '/CoreArena-3D/',
  define: { __ADVENTURE_BUILD__: JSON.stringify(build) },
  build: { target: 'es2022' },
});
