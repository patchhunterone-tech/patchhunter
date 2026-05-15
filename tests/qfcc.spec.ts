import { test } from '@playwright/test';
import { GreatGetStartedPage } from '../pages/GreatGetStartedPage';
import { getTestData, readJsonData } from '../utils/dataReader';

type TestData = {
  app: string;
  url: string;
  address: string;
  unit: string | null;
};

test.describe('QFCC Great Get Started flow', () => {
  test('Address and Unit flow based on test data', async ({ page }) => {
    const allData = readJsonData('testData.json');
    const data = getTestData(allData, 'TEST1');
    const greatPage = new GreatGetStartedPage(page);

    await greatPage.navigate(data.url);
    await greatPage.handleCookiePopup();

    await greatPage.validateTexts();
    await greatPage.validateButtons();

    // Enter address and select from dropdown
    await greatPage.enterAddress(data.address);
    
    // If unit provided, enter and select unit
    if (data.unit) {
      console.log(`Unit provided: ${data.unit}`);
      await greatPage.enterUnit(data.unit);
    } else {
      console.log('No unit provided - address only flow');
    }
    
    await greatPage.validateCheckAvailabilityEnabled();
  });
});
