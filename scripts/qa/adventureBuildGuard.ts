import assert from 'node:assert/strict';
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { preview } from 'vite';
import { chromium } from '@playwright/test';

// Check the actual production artifact, including a deliberately requested lab URL.
const assets = readdirSync('dist/assets');
assert.ok(!assets.some(name => name.includes('adventureLab')), 'Lab chunk shipped in production');
for (const name of assets.filter(name => name.endsWith('.js'))) {
  const source = readFileSync(`dist/assets/${name}`, 'utf8');
  assert.ok(!source.includes('stone-boss-a0-v1') && !source.includes('lab-start'), name);
}
const server = await preview({ preview: { host: '127.0.0.1', port: 8745, strictPort: true } });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
  const errors:string[]=[]; page.on('pageerror', error=>errors.push(error.message));
  await page.goto('http://127.0.0.1:8745/CoreArena-3D/?mode=pve&level=stone&adventure=1&combat=prototype&lab=boss');
  await page.locator('#app[data-ready="true"]').waitFor({timeout:30_000});
  const result = await page.evaluate(() => ({
    diagnosticHook: '__coreArena' in window,
    lab: !!document.querySelector('#adventure-lab'),
    restart: document.querySelector('#pve-restart')?.textContent,
    room: document.querySelector('#room-name')?.textContent,
    bossHidden: document.querySelector<HTMLElement>('#adventure-boss')?.hidden,
  }));
  assert.equal(result.diagnosticHook, false); assert.equal(result.lab, false);
  assert.equal(result.restart, 'Level neu starten'); assert.equal(result.bossHidden, true);
  assert.deepEqual(errors, []);
  mkdirSync('docs/qa/adventure-a0',{recursive:true});
  writeFileSync('docs/qa/adventure-a0/production-guard.json',JSON.stringify({result,errors},null,2)+'\n');
  console.log(JSON.stringify(result));
} finally {
  await browser.close();
  await new Promise<void>((resolve,reject)=>server.httpServer.close(error=>error?reject(error):resolve()));
}
