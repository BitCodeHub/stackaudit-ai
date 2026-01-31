import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for Settings Page
 */
export class SettingsPage {
  readonly page: Page;
  
  // Tab Navigation
  readonly profileTab: Locator;
  readonly companyTab: Locator;
  readonly billingTab: Locator;
  readonly notificationsTab: Locator;
  readonly securityTab: Locator;
  
  // Profile Tab
  readonly profileNameInput: Locator;
  readonly profileEmailInput: Locator;
  readonly timezoneSelect: Locator;
  readonly languageSelect: Locator;
  readonly changePhotoButton: Locator;
  readonly saveProfileButton: Locator;
  
  // Company Tab
  readonly companyNameInput: Locator;
  readonly companySizeSelect: Locator;
  readonly industrySelect: Locator;
  readonly saveCompanyButton: Locator;
  
  // Billing Tab
  readonly currentPlanCard: Locator;
  readonly planCards: Locator;
  readonly freePlanCard: Locator;
  readonly proPlanCard: Locator;
  readonly enterprisePlanCard: Locator;
  readonly upgradeButtons: Locator;
  readonly paymentMethodCard: Locator;
  readonly addPaymentButton: Locator;
  readonly auditsThisMonth: Locator;
  readonly teamMembers: Locator;
  readonly toolsTracked: Locator;
  
  // Notifications Tab
  readonly weeklyReportToggle: Locator;
  readonly newRecommendationsToggle: Locator;
  readonly savingsAlertsToggle: Locator;
  readonly productUpdatesToggle: Locator;
  readonly marketingEmailsToggle: Locator;
  
  // Security Tab
  readonly currentPasswordInput: Locator;
  readonly newPasswordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly updatePasswordButton: Locator;
  readonly enable2FAButton: Locator;
  readonly deleteAccountButton: Locator;
  
  // Page elements
  readonly pageTitle: Locator;
  readonly saveSuccessMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Tab Navigation
    this.profileTab = page.getByRole('button', { name: /profile/i });
    this.companyTab = page.getByRole('button', { name: /company/i });
    this.billingTab = page.getByRole('button', { name: /billing/i });
    this.notificationsTab = page.getByRole('button', { name: /notifications/i });
    this.securityTab = page.getByRole('button', { name: /security/i });
    
    // Profile Tab
    this.profileNameInput = page.getByLabel(/full name/i);
    this.profileEmailInput = page.getByLabel(/email/i);
    this.timezoneSelect = page.getByLabel(/timezone/i);
    this.languageSelect = page.getByLabel(/language/i);
    this.changePhotoButton = page.getByRole('button', { name: /change photo/i });
    this.saveProfileButton = page.getByRole('button', { name: /save changes/i });
    
    // Company Tab
    this.companyNameInput = page.getByLabel(/company name/i);
    this.companySizeSelect = page.getByLabel(/company size/i);
    this.industrySelect = page.getByLabel(/industry/i);
    this.saveCompanyButton = page.getByRole('button', { name: /save changes/i });
    
    // Billing Tab
    this.currentPlanCard = page.locator('text=Current Plan').locator('..');
    this.planCards = page.locator('[class*="border rounded-xl"]').filter({ has: page.locator('h3') });
    this.freePlanCard = page.locator('h3:text("Free")').locator('..');
    this.proPlanCard = page.locator('h3:text("Pro")').locator('..');
    this.enterprisePlanCard = page.locator('h3:text("Enterprise")').locator('..');
    this.upgradeButtons = page.getByRole('button', { name: /upgrade/i });
    this.paymentMethodCard = page.locator('text=Payment Method').locator('..');
    this.addPaymentButton = page.getByRole('button', { name: /add new/i });
    this.auditsThisMonth = page.locator('text=Audits this month').locator('..');
    this.teamMembers = page.locator('text=Team members').locator('..');
    this.toolsTracked = page.locator('text=Tools tracked').locator('..');
    
    // Notifications Tab
    this.weeklyReportToggle = page.locator('text=Weekly Stack Report').locator('..').locator('button[role="switch"]');
    this.newRecommendationsToggle = page.locator('text=New Recommendations').locator('..').locator('button[role="switch"]');
    this.savingsAlertsToggle = page.locator('text=Savings Alerts').locator('..').locator('button[role="switch"]');
    this.productUpdatesToggle = page.locator('text=Product Updates').locator('..').locator('button[role="switch"]');
    this.marketingEmailsToggle = page.locator('text=Marketing Emails').locator('..').locator('button[role="switch"]');
    
    // Security Tab
    this.currentPasswordInput = page.getByLabel(/current password/i);
    this.newPasswordInput = page.getByLabel(/new password/i).first();
    this.confirmPasswordInput = page.getByLabel(/confirm.*password/i);
    this.updatePasswordButton = page.getByRole('button', { name: /update password/i });
    this.enable2FAButton = page.getByRole('button', { name: /enable 2fa/i });
    this.deleteAccountButton = page.getByRole('button', { name: /delete account/i });
    
    // Page elements
    this.pageTitle = page.getByRole('heading', { name: /settings/i });
    this.saveSuccessMessage = page.locator('text=saved successfully, text=Saved!');
  }

  /**
   * Navigate to settings page
   */
  async goto() {
    await this.page.goto('/settings');
    await this.waitForLoad();
  }

  /**
   * Wait for page to fully load
   */
  async waitForLoad() {
    await this.pageTitle.waitFor({ state: 'visible' });
  }

  // Tab Navigation Methods

  async goToProfileTab() {
    await this.profileTab.click();
  }

  async goToCompanyTab() {
    await this.companyTab.click();
  }

  async goToBillingTab() {
    await this.billingTab.click();
    await this.currentPlanCard.waitFor({ state: 'visible' });
  }

  async goToNotificationsTab() {
    await this.notificationsTab.click();
  }

  async goToSecurityTab() {
    await this.securityTab.click();
  }

  // Profile Methods

  async updateProfile(data: { name?: string; email?: string; timezone?: string; language?: string }) {
    if (data.name) {
      await this.profileNameInput.fill(data.name);
    }
    if (data.email) {
      await this.profileEmailInput.fill(data.email);
    }
    if (data.timezone) {
      await this.timezoneSelect.selectOption(data.timezone);
    }
    if (data.language) {
      await this.languageSelect.selectOption(data.language);
    }
    await this.saveProfileButton.click();
  }

  // Company Methods

  async updateCompany(data: { name?: string; size?: string; industry?: string }) {
    await this.goToCompanyTab();
    if (data.name) {
      await this.companyNameInput.fill(data.name);
    }
    if (data.size) {
      await this.companySizeSelect.selectOption(data.size);
    }
    if (data.industry) {
      await this.industrySelect.selectOption(data.industry);
    }
    await this.saveCompanyButton.click();
  }

  // Billing Methods

  async selectPlan(planName: 'Free' | 'Pro' | 'Enterprise') {
    await this.goToBillingTab();
    const planCard = this.page.locator(`h3:text("${planName}")`).locator('..').locator('..');
    await planCard.getByRole('button').click();
  }

  async addPaymentMethod() {
    await this.goToBillingTab();
    await this.addPaymentButton.click();
  }

  // Notification Methods

  async toggleNotification(setting: 'weeklyReport' | 'newRecommendations' | 'savingsAlerts' | 'productUpdates' | 'marketingEmails') {
    await this.goToNotificationsTab();
    const toggleMap = {
      weeklyReport: this.weeklyReportToggle,
      newRecommendations: this.newRecommendationsToggle,
      savingsAlerts: this.savingsAlertsToggle,
      productUpdates: this.productUpdatesToggle,
      marketingEmails: this.marketingEmailsToggle,
    };
    await toggleMap[setting].click();
  }

  // Security Methods

  async changePassword(currentPassword: string, newPassword: string) {
    await this.goToSecurityTab();
    await this.currentPasswordInput.fill(currentPassword);
    await this.newPasswordInput.fill(newPassword);
    await this.confirmPasswordInput.fill(newPassword);
    await this.updatePasswordButton.click();
  }

  async enable2FA() {
    await this.goToSecurityTab();
    await this.enable2FAButton.click();
  }

  async deleteAccount() {
    await this.goToSecurityTab();
    await this.deleteAccountButton.click();
  }

  // Assertions

  async assertCurrentPlan(planName: string) {
    await this.goToBillingTab();
    await expect(this.currentPlanCard).toContainText(planName);
  }

  async assertPaymentMethodVisible() {
    await this.goToBillingTab();
    await expect(this.paymentMethodCard).toBeVisible();
    await expect(this.page.locator('text=•••• •••• •••• 4242')).toBeVisible();
  }

  async assertAuditsCount(count: number) {
    await this.goToBillingTab();
    await expect(this.auditsThisMonth).toContainText(count.toString());
  }

  async assertProfileSaved() {
    await expect(this.page.locator('text=Saved!')).toBeVisible();
  }

  async assert2FANotEnabled() {
    await this.goToSecurityTab();
    await expect(this.page.locator('text=2FA is not enabled')).toBeVisible();
  }

  async assertNotificationEnabled(setting: string) {
    await this.goToNotificationsTab();
    const toggle = this.page.locator(`text=${setting}`).locator('..').locator('button[role="switch"]');
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
  }

  async assertNotificationDisabled(setting: string) {
    await this.goToNotificationsTab();
    const toggle = this.page.locator(`text=${setting}`).locator('..').locator('button[role="switch"]');
    await expect(toggle).toHaveAttribute('aria-checked', 'false');
  }
}
