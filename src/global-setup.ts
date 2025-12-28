import type { FullConfig } from '@playwright/test';
import { request as playwrightRequest } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const GRAFANA_URL = process.env.GRAFANA_URL ?? 'http://localhost:3000';
const AUTH_HEADER =
  'Basic ' + Buffer.from('admin:admin').toString('base64');

const DASHBOARDS_ROOT = path.resolve(__dirname, 'dashboards');

function collectDashboardFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      return collectDashboardFiles(fullPath);
    }

    if (entry.isFile() && entry.name.endsWith('.json')) {
      return [fullPath];
    }

    return [];
  });
}

export default async function globalSetup(_config: FullConfig) {
  const dashboardFiles = collectDashboardFiles(DASHBOARDS_ROOT);

  console.log(`Found ${dashboardFiles.length} dashboard files`);

  const apiContext = await playwrightRequest.newContext({
    baseURL: GRAFANA_URL,
    extraHTTPHeaders: {
      Authorization: AUTH_HEADER,
      'Content-Type': 'application/json',
    },
  });

  for (const filePath of dashboardFiles) {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const dashboard = JSON.parse(raw);
    delete dashboard.id; 

    const res = await apiContext.post('/api/dashboards/import', {
    data: {
        dashboard,
        overwrite: true,
    },
    });

    if (!res.ok()) {
      const text = await res.text();
      throw new Error(
        `Failed to import dashboard ${path.basename(filePath)}: ${text}`
      );
    }

    console.log(
      `Imported dashboard: ${path.relative(DASHBOARDS_ROOT, filePath)}`
    );
  }

  await apiContext.dispose();

  console.log('All dashboards imported successfully');
}
