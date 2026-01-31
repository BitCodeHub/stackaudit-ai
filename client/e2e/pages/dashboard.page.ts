import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for Dashboard Page
 */
export class DashboardPage {
  readonly page: Page;
  
  // Navigation
  readonly newAuditButton: Locator;
  readonly settingsLink: Locator;
  readonly recommendationsLink: Locator;
  readonly logoutButton: Locator;
  
  // Stats cards
  readonly totalSpendCard: Locator;
  readonly potentialSavingsCard: Locator;
  readonly toolsAnalyzedCard: Locator;
  readonly roiScoreCard: Locator;
  
  // Audit list
  readonly auditList: Locator;
  readonly auditItems: Locator;
  readonly emptyState: Locator;
  
  // User info
  readonly userMenu: Locator;
  readonly userName: Locator;
  
  // Page elements
  readonly pageTitle: Locator;
  readonly sidebar: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Navigation
    this.newAuditButton = page.getByRole('link', { name: /new audit|create audit/i });
    this.settingsLink = page.getByRole('link', { name: /settings/i });
    this.recommendationsLink = page.getByRole('link', { name: /recommendations/i });
    this.logoutButton = page.getByRole('button', { name: /logout|sign out/i });
    
    // Stats cards - look for specific text content
    this.totalSpendCard = page.locator('text=Total Spend').locator('..');
    this.potentialSavingsCard = page.locator('text=Potential Savings').locator('..');
    this.toolsAnalyzedCard = page.locator('text=Tools Analyzed').locator('..');
    this.roiScoreCard = page.locator('text=ROI Score').locator('..');
    
    // Audit list
    this.auditList = page.locator('[data-testid="audit-list"]').or(page.locator('table, .audit-list'));
    this.auditItems = page.locator('[data-testid="audit-item"]').or(page.locator('tr[data-audit-id], .audit-item'));
    this.emptyState = page.locator('text=No audits yet');
    
    // User info
    this.userMenu = page.locator('[data-testid="user-menu"]').or(page.getByRole('button', { name: /account|profile/i }));
    this.userName = page.locator('[data-testid="user-name"]');
    
    // Page elements
    this.pageTitle = page.getByRole('heading', { name: /dashboard/i });
    this.sidebar = page.locator('nav, aside, [data-testid="sidebar"]');
  }

  /**
   * Navigate to dashboard
   */
  async goto() {
    await this.page.goto('/dashboard');
    await this.waitForLoad();
  }

  /**
   * Wait for page to fully load
   */
  async waitForLoad() {
    await this.page.waitForLoadState('networkidle');
    // Wait for main content area to be visible
    await this.page.locator('main, [role="main"], .dashboard-content').first().waitFor({ state: 'visible' });
  }

  /**
   * Navigate to new audit page
   */
  async goToNewAudit() {
    await this.newAuditButton.click();
    await this.page.waitForURL(/\/audit\/new/);
  }

  /**
   * Navigate to settings
   */
  async goToSettings() {
    await this.settingsLink.click();
    await this.page.waitForURL(/\/settings/);
  }

  /**
   * Navigate to recommendations
   */
  async goToRecommendations() {
    await this.recommendationsLink.click();
    await this.page.waitForURL(/\/recommendations/);
  }

  /**
   * Click on an audit to view details
   */
  async viewAudit(auditName: string) {
    await this.page.getByText(auditName).click();
    await this.page.waitForURL(/\/audit\/\d+/);
  }

  /**
   * Logout
   */
  async logout() {
    await this.userMenu.click();
    await this.logoutButton.click();
    await this.page.waitForURL(/\/login/);
  }

  /**
   * Get audit count
   */
  async getAuditCount(): Promise<number> {
    return await this.auditItems.count();
  }

  /**
   * Assert dashboard loaded correctly
   */
  async assertLoaded() {
    // Check that we're on the dashboard
    await expect(this.page).toHaveURL(/\/dashboard/);
    // Check for main content
    await expect(this.page.locator('main, [role="main"]').first()).toBeVisible();
  }

  /**
   * Assert total spend value
   */
  async assertTotalSpend(expectedValue: string) {
    await expect(this.totalSpendCard).toContainText(expectedValue);
  }

  /**
   * Assert potential savings value
   */
  async assertPotentialSavings(expectedValue: string) {
    await expect(this.potentialSavingsCard).toContainText(expectedValue);
  }

  /**
   * Assert has audits listed
   */
  async assertHasAudits() {
    await expect(this.auditItems.first()).toBeVisible();
  }

  /**
   * Assert empty state is shown
   */
  async assertEmptyState() {
    await expect(this.emptyState).toBeVisible();
  }
}
