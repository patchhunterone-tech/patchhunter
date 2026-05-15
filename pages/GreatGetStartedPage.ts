import { expect, Page } from '@playwright/test';

export class GreatGetStartedPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigate(url: string) {
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  async handleCookiePopup() {
    try {
      console.log('Checking for cookie popup...');

      const cookieBanner = this.page.locator('text=/We use cookies to help enhance your experience on our site/i, text=/We use cookies to help enhance your experience/i');
      const bannerVisible = await cookieBanner.first().isVisible({ timeout: 3000 }).catch(() => false);

      const bannerSelectors = [
        'div:has-text("We use cookies to help enhance your experience")',
        'div:has-text("We may also use cookies for marketing purposes")',
        'div:has-text("Privacy Notice")',
        '.cookie-banner',
        '.cookie-consent',
        '#onetrust-banner-sdk',
        '.onetrust-banner-container'
      ];

      if (bannerVisible) {
        console.log('Cookie banner found by text');
      }

      let clicked = false;

      const buttonSelectors = [
        'button:has-text("Accept")',
        'button:has-text("Yes")',
        'button:has-text("Agree")',
        'button:has-text("Got it")',
        'button:has-text("Close")',
        'button:has-text("Dismiss")',
        'button:has-text("Save and Exit")',
        'button:has-text("Accept All")',
        '#onetrust-accept-btn-all',
        '#onetrust-accept-btn',
        '.onetrust-close-btn-handler',
        '.onetrust-banner-close-button'
      ];

      for (const selector of buttonSelectors) {
        const button = this.page.locator(selector).first();
        if (await button.isVisible({ timeout: 2000 }).catch(() => false)) {
          await button.click({ timeout: 5000 }).catch(() => {});
          console.log(`Clicked cookie button: ${selector}`);
          clicked = true;
          break;
        }
      }

      if (!clicked) {
        for (const selector of bannerSelectors) {
          const banner = this.page.locator(selector).first();
          if (await banner.isVisible({ timeout: 2000 }).catch(() => false)) {
            const button = banner.locator('button');
            if (await button.first().isVisible({ timeout: 2000 }).catch(() => false)) {
              await button.first().click({ timeout: 5000 }).catch(() => {});
              console.log(`Clicked button inside cookie banner selector: ${selector}`);
              clicked = true;
              break;
            }
          }
        }
      }

      if (clicked) {
        console.log('Cookie popup closed');
        return;
      }

      console.log('No cookie popup found');
    } catch (error) {
      console.log('Error handling cookie popup:', (error as Error).message);
    }
  }

  get logo() {
    return this.page.locator('img[alt*="Quantum"], img[src*="quantum"], [class*="logo"] img, img[alt*="Fiber"]').first();
  }

  get headlineText() {
    return this.page.getByText(/Great! Let(’|')s get started/i).first();
  }

  get availabilityText() {
    return this.page.getByText(/Check availability/i).first();
  }

  get addressInstructionText() {
    return this.page.getByText(/Enter your address to check availability/i).first();
  }

  get whyAddressText() {
    return this.page.getByRole('link', { name: /Why do.*address/i }).first();
  }

  get signInLink() {
    return this.page.getByRole('link', { name: /Already a Quantum Fiber customer\? Sign In/i }).first();
  }

  get backButton() {
    return this.page.getByRole('link', { name: /Back/i }).first();
  }

  get checkAvailabilityButton() {
    return this.page.locator('#adresscheck-submit');
  }

  get addressInput() {
    return this.page.locator('#o2check');
  }

  get unitSelect() {
    return this.page.locator('#o2UnitsOptions');
  }

  get unitInput() {
    return this.page.locator('#o2UnitNumber');
  }

  get suggestionItems() {
    return this.page.locator('[role="listbox"] li, .typeahead-results li, .autocomplete__option, .tt-suggestion');
  }

  async validateLogo() {
    const visible = await this.logo.isVisible().catch(() => false);
    if (visible) {
      console.log('SUCCESS: Quantum Fiber from AT&T logo is visible');
    } else {
      console.log('FAIL: Quantum Fiber from AT&T logo is missing');
    }
    expect(visible).toBeTruthy();
  }

  async validateTexts() {
    const items = [
      { locator: this.headlineText, text: "Great! Let's get started" },
      { locator: this.availabilityText, text: 'Check availability' },
      { locator: this.addressInstructionText, text: 'Enter your address to check availability' },
      { locator: this.whyAddressText, text: 'Why do you need my address?' },
      { locator: this.signInLink, text: 'Already a Quantum Fiber customer? Sign In' },
    ];

    for (const item of items) {
      const isVisible = await item.locator.isVisible().catch(() => false);
      if (isVisible) {
        console.log(`SUCCESS: ${item.text}`);
      } else {
        console.log(`FAIL: ${item.text} is missing`);
      }
      expect(isVisible).toBeTruthy();
    }
  }

  async validateButtons() {
    const backEnabled = await this.backButton.isEnabled().catch(() => false);
    const checkDisabled = await this.checkAvailabilityButton.isDisabled().catch(() => false);

    if (backEnabled) {
      console.log('SUCCESS: Back button is enabled');
    } else {
      console.log('FAIL: Back button is not enabled');
    }

    if (checkDisabled) {
      console.log('SUCCESS: Check Availability button is disabled initially');
    } else {
      console.log('FAIL: Check Availability button is not disabled initially');
    }

    expect(backEnabled).toBeTruthy();
    expect(checkDisabled).toBeTruthy();
  }

  async enterAddress(address: string) {
    console.log(`Entering address: ${address}`);
    await this.addressInput.fill(address);
    await this.addressInput.waitFor({ state: 'visible', timeout: 5000 });

    // Wait for suggestions to appear and select first one
    await this.page.waitForTimeout(500);
    const firstSuggestion = this.suggestionItems.first();
    if (await firstSuggestion.count() > 0) {
      try {
        await firstSuggestion.waitFor({ state: 'visible', timeout: 3000 });
        await firstSuggestion.click();
        console.log('Selected first address suggestion from dropdown');
      } catch (e) {
        console.log('No suggestion dropdown visible; submitting address by Enter');
        await this.addressInput.press('Enter');
      }
    } else {
      console.log('No suggestion dropdown found; submitting address by Enter');
      await this.addressInput.press('Enter');
    }

    await this.page.waitForTimeout(1000);
  }

  async enterUnit(unitValue: string) {
    console.log(`Entering unit: ${unitValue}`);

    // Try unit input field first
    if (await this.unitInput.isVisible().catch(() => false)) {
      await this.unitInput.fill(unitValue);
      await this.page.waitForTimeout(500);
      
      // If there's a dropdown, select first suggestion
      const unitSuggestions = this.page.locator('[role="listbox"] li, .typeahead-results li, .autocomplete__option, .tt-suggestion');
      if (await unitSuggestions.first().count() > 0) {
        try {
          await unitSuggestions.first().waitFor({ state: 'visible', timeout: 2000 });
          await unitSuggestions.first().click();
          console.log('Selected first unit suggestion from dropdown');
        } catch (e) {
          console.log('No unit suggestion dropdown; using entered value');
          await this.unitInput.press('Enter');
        }
      }
    } 
    // Try unit select field
    else if (await this.unitSelect.isVisible().catch(() => false)) {
      try {
        await this.unitSelect.selectOption({ label: unitValue });
        console.log(`Selected unit: ${unitValue} from select dropdown`);
      } catch (e) {
        console.log(`Unit option not found; trying to find and click`);
        const option = this.page.locator(`text=${unitValue}`).first();
        if (await option.isVisible().catch(() => false)) {
          await option.click();
          console.log('Selected unit option by text click');
        }
      }
    }
  }

  async validateCheckAvailabilityEnabled() {
    const enabled = await this.checkAvailabilityButton.isEnabled().catch(() => false);
    if (enabled) {
      console.log('SUCCESS: Check Availability is enabled');
    } else {
      console.log('FAIL: Check Availability is not enabled');
    }
    expect(enabled).toBeTruthy();
  }
}

