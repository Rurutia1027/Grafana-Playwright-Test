import { test, expect } from '@grafana/plugin-e2e'; 
import datagridDashboard from '../dashboards/panel-datagrid-data-change/datagrid_metric_values.json'; 

const DASHBOARD_ID = 'c01bf42b-b783-4447-a304-8554cee1843b';
const DATAGRID_SELECT_SERIES = 'Datagrid Select series';

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

test.use({
    featureToggles: {
        enableDatagridEditing: true,
    }
}); 

test.describe(
    'Datagrid data changes',
    {
        tag: ['@panels'],
    },
    () => { 
        test.skip('Test changing data in the grid', async ({ gotoDashboardPage, selectors, page }) => {
            const dashboardPage = await gotoDashboardPage({
                uid: DASHBOARD_ID,
                queryParams: new URLSearchParams({ editPanel: '1' }),
            });

            // Check that the data is series A
            await expect(dashboardPage.getByGrafanaSelector(
                selectors.components.PanelEditor.OptionsPane.fieldLabel(DATAGRID_SELECT_SERIES)
            )).toBeVisible();

            await expect(page.getByTestId('glide-cell-2-0')).toHaveText('1');
            await expect(page.getByTestId('glide-cell-2-1')).toHaveText('20');
            await expect(page.getByTestId('glide-cell-2-2')).toHaveText('90');

            // Change the series to B
            const seriesInput = dashboardPage
                .getByGrafanaSelector(selectors.components.PanelEditor.OptionsPane.fieldLabel(DATAGRID_SELECT_SERIES))
                .locator('input');
            await seriesInput.fill('B');
            await seriesInput.press('Enter');
            await expect(page.getByTestId('glide-cell-2-3')).toHaveText('30');
            await expect(page.getByTestId('glide-cell-2-4')).toHaveText('40');
            await expect(page.getByTestId('glide-cell-2-5')).toHaveText('50');

            // Edit datagrid which triggers a snapshot query
            await page.locator('.dvn-scroller').click({ position: { x: 200, y: 100 } });
            await expect(page.getByTestId('glide-cell-2-1')).toHaveAttribute('aria-selected', 'true');
            await page.keyboard.type('12');
            await page.keyboard.press('Enter');
            
            await page.getByTestId('data-testid Confirm Modal Danger Button').click();
            await expect(page.getByTestId('query-editor-row')).toContainText('Snapshot');
        }); 
    }
); 