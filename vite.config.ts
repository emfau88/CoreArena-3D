import { defineConfig } from 'vite';
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const source = createHash('sha256');
const files = readdirSync('src', { recursive: true, withFileTypes: true })
  .filter(entry => entry.isFile()).map(entry => `${entry.parentPath}/${entry.name}`.replaceAll('\\', '/'));
for (const file of [...files, 'vite.config.ts', 'package-lock.json'].sort()) source.update(file).update(readFileSync(file));
const build = { commit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), sourceHash: source.digest('hex') };

export default defineConfig(({mode})=>({
  base: mode==='adventure-preview'?'/CoreArena-3D/adventure-preview/':'/CoreArena-3D/',
  define: { __ADVENTURE_BUILD__: JSON.stringify(build) },
  plugins: mode==='adventure-preview'||mode==='environment-test'?[{
    name:'adventure-build-version',
    generateBundle(){this.emitFile({type:'asset',fileName:mode==='environment-test'?'environment-version.json':'preview-version.json',source:JSON.stringify(build,null,2)+'\n'});},
  }]:[],
  build: { target: 'es2022' },
}));
