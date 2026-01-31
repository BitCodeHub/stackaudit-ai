import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for Audit Results Page
 */
export class AuditResultsPage {
  readonly page: Page;
  
  // Navigation
  readonly backButton: Locator;
  readonly shareButton: Locator;
  readonly exportButton: Locator;
  readonly recommendationsButton: Locator;
  
  // Tabs
  readonly overviewTab: Locator;
  readonly toolsTab: Locator;
  readonly savingsTab: Locator;
  
  // Summary Stats
  readonly totalSpendStat: Locator;
  readonly potentialSavingsStat: Locator;
  readonly toolCountStat: Locator;
  readonly activeUsersStat: Locator;
  readonly wastePercentageStat: Locator;
  
  // Overview Tab
  readonly roiGauge: Locator;
  readonly spendChart: Locator;
  readonly categoryPieChart: Locator;
  readonly recommendationsPreview: Locator;
  
  // Tools Tab
  readonly toolsTable: Locator;
  readonly toolRows: Locator;
  
  // Savings Tab
  readonly savingsBreakdown: Locator;
  readonly implementationTimeline: Locator;
  
  // Page elements
  readonly auditName: Locator;
  readonly auditStatus: Locator;
  readonly createdDate: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Navigation
    this.backButton = page.getByRole('button', { name: /back to dashboard/i });
    this.shareButton = page.getByRole('button', { name: /share/i });
    this.exportButton = page.getByRole('button', { name: /export/i });
    this.recommendationsButton = page.getByRole('link', { name: /recommendations/i });
    
    // Tabs
    this.overviewTab = page.getByRole('button', { name: /overview/i });
    this.toolsTab = page.getByRole('button', { name: /tools analysis/i });
    this.savingsTab = page.getByRole('button', { name: /savings breakdown/i });
    
    // Summary Stats
    this.totalSpendStat = page.locator('text=Total Spend').locator('..');
    this.potentialSavingsStat = page.locator('text=Potential Savings').locator('..');
    this.toolCountStat = page.locator('text=Tools Analyzed').locator('..');
    this.activeUsersStat = page.locator('text=Active Users').locator('..');
    this.wastePercentageStat = page.locator('text=Waste Identified').locator('..');
    
    // Overview Tab
    this.roiGauge = page.locator('text=Stack ROI Score').locator('..');
    this.spendChart = page.locator('text=Spend & Savings Trend').locator('..');
    this.categoryPieChart = page.locator('text=Spend by Category').locator('..');
    this.recommendationsPreview = page.locator('text=Top Recommendations').locator('..');
    
    // Tools Tab
    this.toolsTable = page.locator('table');
    this.toolRows = page.locator('tbody tr');
    
    // Savings Tab
    this.savingsBreakdown = page.locator('text=Savings Breakdown').locator('..');
    this.implementationTimeline = page.locator('text=Implementation Timeline').locator('..');
    
    // Page elements
    this.auditName = page.getByRole('heading', { level: 1 });
    this.auditStatus = page.locator('.badge, [class*="Badge"]').filter({ hasText: /completed|in progress/i });
    this.createdDate = page.locator('text=Created').locator('..');
  }

  /**
   * Navigate to audit results page
   */
  async goto(auditId: string = '1') {
    await this.page.goto(`/audit/${auditId}`);
    await this.waitForLoad();
  }

  /**
   * Wait for page to fully load
   */
  async waitForLoad() {
    await this.auditName.waitFor({ state: 'visible' });
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Switch to overview tab
   */
  async goToOverviewTab() {
    await this.overviewTab.click();
  }

  /**
   * Switch to tools tab
   */
  async goToToolsTab() {
    await this.toolsTab.click();
    await this.toolsTable.waitFor({ state: 'visible' });
  }

  /**
   * Switch to savings tab
   */
  async goToSavingsTab() {
    await this.savingsTab.click();
    await this.savingsBreakdown.waitFor({ state: 'visible' });
  }

  /**
   * Navigate back to dashboard
   */
  async goBack() {
    await this.backButton.click();
    await this.page.waitForURL(/\/dashboard/);
  }

  /**
   * Navigate to recommendations
   */
  async goToRecommendations() {
    await this.recommendationsButton.click();
    await this.page.waitForURL(/\/recommendations/);
  }

  /**
   * Click share button
   */
  async clickShare() {
    await this.shareButton.click();
  }

  /**
   * Click export button
   */
  async clickExport() {
    await this.exportButton.click();
  }

  /**
   * Get tool count from table
   */
  async getToolCount(): Promise<number> {
    await this.goToToolsTab();
    return await this.toolRows.count();
  }

  /**
   * Assert audit name
   */
  async assertAuditName(name: string) {
    await expect(this.auditName).toContainText(name);
  }

  /**
   * Assert audit is completed
   */
  async assertCompleted() {
    await expect(this.auditStatus).toContainText(/completed/i);
  }

  /**
   * Assert total spend value
   */
  async assertTotalSpend(value: string) {
    await expect(this.totalSpendStat).toContainText(value);
  }

  /**
   * Assert potential savings value
   */
  async assertPotentialSavings(value: string) {
    await expect(this.potentialSavingsStat).toContainText(value);
  }

  /**
   * Assert tools count
   */
  async assertToolCount(count: number) {
    await expect(this.toolCountStat).toContainText(count.toString());
  }

  /**
   * Assert overview tab is visible
   */
  async assertOverviewTabContent() {
    await expect(this.roiGauge).toBeVisible();
    await expect(this.spendChart).toBeVisible();
    await expect(this.categoryPieChart).toBeVisible();
  }

  /**
   * Assert tools tab is visible
   */
  async assertToolsTabContent() {
    await expect(this.toolsTable).toBeVisible();
    await expect(this.toolRows.first()).toBeVisible();
  }

  /**
   * Assert savings tab is visible
   */
  async assertSavingsTabContent() {
    await expect(this.savingsBreakdown).toBeVisible();
    await expect(this.implementationTimeline).toBeVisible();
  }

  /**
   * Assert tool in table has specific status
   */
  async assertToolStatus(toolName: string, status: 'healthy' | 'warning' | 'danger') {
    const row = this.page.locator('tr').filter({ hasText: toolName });
    await expect(row.locator(`.badge, [class*="Badge"]`).filter({ hasText: new RegExp(status, 'i') })).toBeVisible();
  }
}
