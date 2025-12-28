import { test, expect } from '@grafana/plugin-e2e';
import datagridDashboard from '../dashboards/panel-datagrid-data-change/datagrid_metric_values.json'; 

const DASHBOARD_ID = 'c01bf42b-b783-4447-a304-8554cee9627';

test.use({
  featureToggles: {
    enableDatagridEditing: true,
  },
});

test.beforeAll(async ({ request }) => {
  await request.post('/api/dashboards/import', {
    headers: {
      Authorization:
        'Basic ' + Buffer.from('admin:admin').toString('base64'),
    },
    data: {
      dashboard: datagridDashboard,
      overwrite: true,
    },
  });
});


// TODO enable this test when panel goes live 
test.describe.skip(
    'Datagrid data changes',
    {
        tag: ['@panels'],
    },
    () => { 
        test('Testing changing data in the grid', async ({ gotoDashboardPage, selectors, page }) => { 
            await gotoDashboardPage({
                uid: DASHBOARD_ID,
                queryParams: new URLSearchParams({ editPanel: '1' }),
            });
            
            // Edit datagrid which triggers a snapshot query 
            await page.locator('.dvn-scroller').click({ position: { x: 200, y: 100 } }); 
            await expect(page.getByTestId('glide-cell-2-1')).toHaveAttribute('aria-selected', 'true'); 
            await page.keyboard.type('123'); 
            await page.keyboard.press('Enter'); 

            await page.getByTestId('data-testid Confirm Modal Danger Button').click(); 

            // Delete a cell 
            await page.locator('.dvn-scroller').click({ position: { x: 200, y: 100 } }); 
            await page.keyboard.press('Delete'); 
            await expect(page.getByTestId('glide-cell-2-4')).toHaveText('0'); 

            // Delete a selection 
            await page.locator('.dvn-scroller').click({ position: { x: 50, y: 100 }, modifiers: ['Shift'] });
            await page.keyboard.press('Delete');
            await expect(page.getByTestId('glide-cell-2-3')).toHaveText('0');
            await expect(page.getByTestId('glide-cell-2-2')).toHaveText('0');
            await expect(page.getByTestId('glide-cell-2-1')).toHaveText('0');
            await expect(page.getByTestId('glide-cell-2-0')).toHaveText('1');
            await expect(page.getByTestId('glide-cell-1-3')).toHaveText('');
            await expect(page.getByTestId('glide-cell-1-2')).toHaveText('');
            await expect(page.getByTestId('glide-cell-1-1')).toHaveText('');
            await expect(page.getByTestId('glide-cell-1-0')).not.toHaveText('');
        }); 
    }
)

