import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';

const channels = [
  { name: 'chromium', channel: 'chromium' },
  ...(existsSync('C:/Program Files/Google/Chrome/Application/chrome.exe')
    ? [{ name: 'chrome', channel: 'chrome' }] : []),
  ...(existsSync('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe')
    ? [{ name: 'edge', channel: 'msedge' }] : []),
];

export default defineConfig({
  testDir: './tests/e2e',
  workers: 1,
  retries: 0,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: [['list'], ['json', { outputFile: 'test-results/report.json' }], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:8744/CoreArena-3D/',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: channels.flatMap(({ name, channel }) =>
    [{ width: 1366, height: 768 }, { width: 1920, height: 1080 }].map((viewport) => ({
      name: `${name}-${viewport.width}`,
      use: { browserName: 'chromium' as const, channel, viewport },
    })),
  ),
  webServer: {
    command: 'npm run preview:test',
    url: 'http://127.0.0.1:8744/CoreArena-3D/',
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
