import { test, expect } from '@playwright/test';
import { SettingsPage } from './pages/settings.page';
import { setAuthState, clearAuthState } from './utils/helpers';

test.describe('Billing Flow', () => {
  let settingsPage: SettingsPage;

  test.beforeEach(async ({ page }) => {
    await clearAuthState(page);
    await setAuthState(page, {
      email: 'test@stackaudit.ai',
      name: 'Test User',
      plan: 'pro',
    });
    
    settingsPage = new SettingsPage(page);
    await settingsPage.goto();
    await settingsPage.goToBillingTab();
  });

  test.describe('Current Plan Display', () => {
    test('should show current plan card', async () => {
      await expect(settingsPage.currentPlanCard).toBeVisible();
    });

    test('should display Pro plan as active', async () => {
      await settingsPage.assertCurrentPlan('Pro Plan');
    });

    test('should show active badge', async ({ page }) => {
      await expect(page.locator('text=Active').first()).toBeVisible();
    });

    test('should show renewal date', async ({ page }) => {
      await expect(page.locator('text=Renews')).toBeVisible();
    });

    test('should have manage button', async ({ page }) => {
      await expect(page.getByRole('button', { name: /manage/i })).toBeVisible();
    });
  });

  test.describe('Usage Statistics', () => {
    test('should show audits this month', async ({ page }) => {
      await expect(page.locator('text=Audits this month')).toBeVisible();
      await expect(page.locator('text=12')).toBeVisible();
    });

    test('should show team members count', async ({ page }) => {
      await expect(page.locator('text=Team members')).toBeVisible();
      await expect(page.locator('text=3')).toBeVisible();
    });

    test('should show tools tracked count', async ({ page }) => {
      await expect(page.locator('text=Tools tracked')).toBeVisible();
      await expect(page.locator('text=47')).toBeVisible();
    });
  });

  test.describe('Available Plans', () => {
    test('should display all plan options', async ({ page }) => {
      await expect(page.locator('text=Available Plans')).toBeVisible();
    });

    test('should show Free plan', async ({ page }) => {
      await expect(page.locator('h3:text("Free")')).toBeVisible();
      await expect(page.locator('text=$0')).toBeVisible();
    });

    test('should show Pro plan', async ({ page }) => {
      await expect(page.locator('h3:text("Pro")')).toBeVisible();
      await expect(page.locator('text=$49')).toBeVisible();
    });

    test('should show Enterprise plan', async ({ page }) => {
      await expect(page.locator('h3:text("Enterprise")')).toBeVisible();
      await expect(page.locator('text=Custom')).toBeVisible();
    });

    test('should mark Pro as most popular', async ({ page }) => {
      await expect(page.locator('text=Most Popular')).toBeVisible();
    });

    test('should show current plan as selected', async ({ page }) => {
      const proPlanCard = page.locator('h3:text("Pro")').locator('../..');
      await expect(proPlanCard.getByRole('button', { name: /current plan/i })).toBeVisible();
    });
  });

  test.describe('Plan Features', () => {
    test('should show Free plan features', async ({ page }) => {
      await expect(page.locator('text=3 audits/month')).toBeVisible();
      await expect(page.locator('text=Basic recommendations')).toBeVisible();
      await expect(page.locator('text=Email support')).toBeVisible();
    });

    test('should show Pro plan features', async ({ page }) => {
      await expect(page.locator('text=Unlimited audits')).toBeVisible();
      await expect(page.locator('text=Advanced AI insights')).toBeVisible();
      await expect(page.locator('text=Priority support')).toBeVisible();
      await expect(page.locator('text=Team collaboration')).toBeVisible();
      await expect(page.locator('text=Custom reports')).toBeVisible();
    });

    test('should show Enterprise plan features', async ({ page }) => {
      await expect(page.locator('text=Everything in Pro')).toBeVisible();
      await expect(page.locator('text=SSO/SAML')).toBeVisible();
      await expect(page.locator('text=Dedicated account manager')).toBeVisible();
      await expect(page.locator('text=Custom integrations')).toBeVisible();
      await expect(page.locator('text=SLA guarantee')).toBeVisible();
    });
  });

  test.describe('Plan Upgrade Actions', () => {
    test('should disable upgrade on current plan', async ({ page }) => {
      const proPlanCard = page.locator('h3:text("Pro")').locator('../..');
      const currentPlanButton = proPlanCard.getByRole('button');
      await expect(currentPlanButton).toBeDisabled();
    });

    test('should show Contact Sales for Enterprise', async ({ page }) => {
      await expect(page.getByRole('button', { name: /contact sales/i })).toBeVisible();
    });

    test('should allow upgrade to different plan', async ({ page }) => {
      // Free plan should have Upgrade button (if user is on pro, this would be "Current Plan" 
      // or downgrade option depending on implementation)
      const freePlanCard = page.locator('h3:text("Free")').locator('../..');
      const button = freePlanCard.getByRole('button');
      await expect(button).toBeVisible();
    });
  });

  test.describe('Payment Method', () => {
    test('should show payment method section', async () => {
      await settingsPage.assertPaymentMethodVisible();
    });

    test('should display card details', async ({ page }) => {
      await expect(page.locator('text=•••• •••• •••• 4242')).toBeVisible();
      await expect(page.locator('text=Expires 12/26')).toBeVisible();
    });

    test('should show VISA branding', async ({ page }) => {
      await expect(page.locator('text=VISA')).toBeVisible();
    });

    test('should mark default payment method', async ({ page }) => {
      await expect(page.locator('text=Default')).toBeVisible();
    });

    test('should have add new payment method button', async () => {
      await expect(settingsPage.addPaymentButton).toBeVisible();
    });
  });
});

test.describe('Settings - Profile Tab', () => {
  let settingsPage: SettingsPage;

  test.beforeEach(async ({ page }) => {
    await clearAuthState(page);
    await setAuthState(page, {
      email: 'test@stackaudit.ai',
      name: 'Test User',
      plan: 'pro',
    });
    
    settingsPage = new SettingsPage(page);
    await settingsPage.goto();
  });

  test('should display profile form', async () => {
    await expect(settingsPage.profileNameInput).toBeVisible();
    await expect(settingsPage.profileEmailInput).toBeVisible();
    await expect(settingsPage.timezoneSelect).toBeVisible();
    await expect(settingsPage.languageSelect).toBeVisible();
  });

  test('should show user avatar', async ({ page }) => {
    // Avatar shows first letter of name
    await expect(page.locator('.rounded-full').filter({ hasText: 'T' })).toBeVisible();
  });

  test('should allow updating profile', async () => {
    await settingsPage.updateProfile({ name: 'Updated Name' });
    await settingsPage.assertProfileSaved();
  });

  test('should have timezone options', async ({ page }) => {
    await settingsPage.timezoneSelect.click();
    await expect(page.locator('option:text("Pacific Time")')).toBeVisible();
    await expect(page.locator('option:text("Eastern Time")')).toBeVisible();
  });

  test('should have language options', async ({ page }) => {
    await settingsPage.languageSelect.click();
    await expect(page.locator('option:text("English")')).toBeVisible();
    await expect(page.locator('option:text("Spanish")')).toBeVisible();
  });
});

test.describe('Settings - Company Tab', () => {
  let settingsPage: SettingsPage;

  test.beforeEach(async ({ page }) => {
    await clearAuthState(page);
    await setAuthState(page, {
      email: 'test@stackaudit.ai',
      name: 'Test User',
      plan: 'pro',
    });
    
    settingsPage = new SettingsPage(page);
    await settingsPage.goto();
    await settingsPage.goToCompanyTab();
  });

  test('should display company form', async () => {
    await expect(settingsPage.companyNameInput).toBeVisible();
    await expect(settingsPage.companySizeSelect).toBeVisible();
    await expect(settingsPage.industrySelect).toBeVisible();
  });

  test('should have company size options', async ({ page }) => {
    await settingsPage.companySizeSelect.click();
    await expect(page.locator('option:text("1-10 employees")')).toBeVisible();
    await expect(page.locator('option:text("50-100 employees")')).toBeVisible();
    await expect(page.locator('option:text("500+ employees")')).toBeVisible();
  });

  test('should have industry options', async ({ page }) => {
    await settingsPage.industrySelect.click();
    await expect(page.locator('option:text("Technology")')).toBeVisible();
    await expect(page.locator('option:text("Finance")')).toBeVisible();
    await expect(page.locator('option:text("Healthcare")')).toBeVisible();
  });
});

test.describe('Settings - Notifications Tab', () => {
  let settingsPage: SettingsPage;

  test.beforeEach(async ({ page }) => {
    await clearAuthState(page);
    await setAuthState(page, {
      email: 'test@stackaudit.ai',
      name: 'Test User',
      plan: 'pro',
    });
    
    settingsPage = new SettingsPage(page);
    await settingsPage.goto();
    await settingsPage.goToNotificationsTab();
  });

  test('should display all notification options', async ({ page }) => {
    await expect(page.locator('text=Weekly Stack Report')).toBeVisible();
    await expect(page.locator('text=New Recommendations')).toBeVisible();
    await expect(page.locator('text=Savings Alerts')).toBeVisible();
    await expect(page.locator('text=Product Updates')).toBeVisible();
    await expect(page.locator('text=Marketing Emails')).toBeVisible();
  });

  test('should have toggle switches', async ({ page }) => {
    const toggles = page.locator('button[role="switch"]');
    await expect(toggles).toHaveCount(5);
  });

  test('should toggle notification setting', async ({ page }) => {
    // Get initial state
    const weeklyToggle = page.locator('text=Weekly Stack Report').locator('..').locator('button[role="switch"]');
    const initialState = await weeklyToggle.getAttribute('aria-checked');
    
    // Toggle
    await weeklyToggle.click();
    
    // State should change
    const newState = await weeklyToggle.getAttribute('aria-checked');
    expect(newState).not.toBe(initialState);
  });
});

test.describe('Settings - Security Tab', () => {
  let settingsPage: SettingsPage;

  test.beforeEach(async ({ page }) => {
    await clearAuthState(page);
    await setAuthState(page, {
      email: 'test@stackaudit.ai',
      name: 'Test User',
      plan: 'pro',
    });
    
    settingsPage = new SettingsPage(page);
    await settingsPage.goto();
    await settingsPage.goToSecurityTab();
  });

  test('should display change password form', async () => {
    await expect(settingsPage.currentPasswordInput).toBeVisible();
    await expect(settingsPage.newPasswordInput).toBeVisible();
    await expect(settingsPage.confirmPasswordInput).toBeVisible();
    await expect(settingsPage.updatePasswordButton).toBeVisible();
  });

  test('should display 2FA section', async () => {
    await settingsPage.assert2FANotEnabled();
    await expect(settingsPage.enable2FAButton).toBeVisible();
  });

  test('should display danger zone', async ({ page }) => {
    await expect(page.locator('text=Danger Zone')).toBeVisible();
    await expect(settingsPage.deleteAccountButton).toBeVisible();
  });

  test('delete account button should be visible', async () => {
    await expect(settingsPage.deleteAccountButton).toBeVisible();
    await expect(settingsPage.deleteAccountButton).toHaveText(/delete account/i);
  });
});

test.describe('Settings - Authentication', () => {
  test('should redirect to login if not authenticated', async ({ page }) => {
    await clearAuthState(page);
    await page.goto('/settings');
    
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Settings - Tab Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuthState(page);
    await setAuthState(page, {
      email: 'test@stackaudit.ai',
      name: 'Test User',
      plan: 'pro',
    });
  });

  test('should navigate between all tabs', async ({ page }) => {
    const settingsPage = new SettingsPage(page);
    await settingsPage.goto();
    
    // Start on Profile tab
    await expect(settingsPage.profileNameInput).toBeVisible();
    
    // Go to Company
    await settingsPage.goToCompanyTab();
    await expect(settingsPage.companyNameInput).toBeVisible();
    
    // Go to Billing
    await settingsPage.goToBillingTab();
    await expect(settingsPage.currentPlanCard).toBeVisible();
    
    // Go to Notifications
    await settingsPage.goToNotificationsTab();
    await expect(page.locator('text=Weekly Stack Report')).toBeVisible();
    
    // Go to Security
    await settingsPage.goToSecurityTab();
    await expect(settingsPage.currentPasswordInput).toBeVisible();
    
    // Go back to Profile
    await settingsPage.goToProfileTab();
    await expect(settingsPage.profileNameInput).toBeVisible();
  });
});
