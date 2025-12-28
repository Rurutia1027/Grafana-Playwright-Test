import { test, expect } from '@grafana/plugin-e2e'; 
import geoMapDashboard from '../dashboards/panel-geomap/geomap-spatial-operations-transformer.json'; 

const DASHBOARD_ID = 'P2jR04WVk'; 
const MAP_LAYERS_TYPE = 'Map layers Layer type'; 
const MAP_LAYERS_DATA = 'Map layers Data'; 
const MAP_LAYERS_GEOJSON = 'Map layers GeoJSON URL'; 

test.beforeAll(async ({ request }) => {
  await request.post('/api/dashboards/import', {
    headers: {
      Authorization:
        'Basic ' + Buffer.from('admin:admin').toString('base64'),
    },
    data: {
      dashboard: geoMapDashboard,
      overwrite: true,
    },
  });
});

test.describe(
    'Panels test: Geomap layer types', 
    {
        tag: ['@panels'], 
    }, 
    () => { 
        test('Test changing the layer type', async ({ gotoDashboardPage, selectors, page }) => {
            const dashboardPage = await gotoDashboardPage({
                uid: DASHBOARD_ID,
                queryParams: new URLSearchParams({
                    editPanel: '1'
                }),
            }); 

            await expect(page.locator('[data-testid="layer-drag-drop-list"]')).toBeVisible(); 
            const field = dashboardPage.getByGrafanaSelector(
                selectors.components.PanelEditor.OptionsPane.fieldLabel(MAP_LAYERS_TYPE)
            ); 
            await expect(field).toBeVisible(); 
            await expect(page.locator('[data-testid="layer-drag-drop-list"]')).toContainText('markers'); 


            // Heatmap 
        }); 
    }
); 