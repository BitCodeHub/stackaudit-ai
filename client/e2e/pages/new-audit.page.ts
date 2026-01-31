import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for New Audit Page (Multi-step wizard)
 */
export class NewAuditPage {
  readonly page: Page;
  
  // Navigation
  readonly backButton: Locator;
  readonly nextButton: Locator;
  readonly backStepButton: Locator;
  readonly submitButton: Locator;
  
  // Progress steps
  readonly step1Indicator: Locator;
  readonly step2Indicator: Locator;
  readonly step3Indicator: Locator;
  readonly step4Indicator: Locator;
  
  // Step 1: Select Tools
  readonly auditNameInput: Locator;
  readonly toolSearchInput: Locator;
  readonly toolCards: Locator;
  readonly selectedToolsBadges: Locator;
  readonly addCustomToolButton: Locator;
  
  // Step 2: Add Costs
  readonly costInputs: Locator;
  readonly totalCostDisplay: Locator;
  
  // Step 3: Usage Data
  readonly userInputs: Locator;
  readonly utilizationInputs: Locator;
  readonly totalUsersDisplay: Locator;
  readonly avgUtilizationDisplay: Locator;
  
  // Step 4: Review
  readonly reviewSummary: Locator;
  readonly toolsList: Locator;
  readonly runAnalysisButton: Locator;
  
  // Page elements
  readonly pageTitle: Locator;
  readonly stepTitle: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Navigation
    this.backButton = page.getByRole('button', { name: /back to dashboard/i });
    this.nextButton = page.getByRole('button', { name: /continue/i });
    this.backStepButton = page.getByRole('button', { name: /^back$/i });
    this.submitButton = page.getByRole('button', { name: /run analysis/i });
    
    // Progress steps (by step number)
    this.step1Indicator = page.locator('.rounded-full').filter({ hasText: '1' });
    this.step2Indicator = page.locator('.rounded-full').filter({ hasText: '2' });
    this.step3Indicator = page.locator('.rounded-full').filter({ hasText: '3' });
    this.step4Indicator = page.locator('.rounded-full').filter({ hasText: '4' });
    
    // Step 1: Select Tools
    this.auditNameInput = page.getByPlaceholder(/q1 2024|stack review/i);
    this.toolSearchInput = page.getByPlaceholder(/search tools/i);
    this.toolCards = page.locator('button').filter({ has: page.locator('span.text-2xl') }); // Tool cards with emoji
    this.selectedToolsBadges = page.locator('[class*="badge"], .badge').filter({ has: page.locator('button') });
    this.addCustomToolButton = page.getByText(/add custom tool/i);
    
    // Step 2: Add Costs
    this.costInputs = page.locator('input[type="number"]');
    this.totalCostDisplay = page.locator('text=Total Monthly Cost').locator('..').locator('span');
    
    // Step 3: Usage Data
    this.userInputs = page.locator('input[placeholder*="50"]');
    this.utilizationInputs = page.locator('input[placeholder*="75"]');
    this.totalUsersDisplay = page.locator('text=Total Licensed Users').locator('..');
    this.avgUtilizationDisplay = page.locator('text=Avg. Utilization').locator('..');
    
    // Step 4: Review
    this.reviewSummary = page.locator('text=Review Your Audit').locator('..');
    this.toolsList = page.locator('.border.rounded-xl').filter({ has: page.locator('text=/mo') });
    this.runAnalysisButton = page.getByRole('button', { name: /run analysis/i });
    
    // Page elements
    this.pageTitle = page.getByRole('heading', { name: /create new audit/i });
    this.stepTitle = page.getByRole('heading', { level: 2 });
  }

  /**
   * Navigate to new audit page
   */
  async goto() {
    await this.page.goto('/audit/new');
    await this.waitForLoad();
  }

  /**
   * Wait for page to fully load
   */
  async waitForLoad() {
    await this.pageTitle.waitFor({ state: 'visible' });
    await this.toolCards.first().waitFor({ state: 'visible' });
  }

  /**
   * Set audit name
   */
  async setAuditName(name: string) {
    await this.auditNameInput.fill(name);
  }

  /**
   * Search for a tool
   */
  async searchTool(query: string) {
    await this.toolSearchInput.fill(query);
  }

  /**
   * Select a tool by name
   */
  async selectTool(toolName: string) {
    const toolCard = this.page.locator('button').filter({ hasText: toolName });
    await toolCard.click();
  }

  /**
   * Select multiple tools by name
   */
  async selectTools(toolNames: string[]) {
    for (const name of toolNames) {
      await this.selectTool(name);
    }
  }

  /**
   * Deselect a tool by clicking on its badge
   */
  async deselectTool(toolName: string) {
    const badge = this.selectedToolsBadges.filter({ hasText: toolName });
    const removeButton = badge.locator('button');
    await removeButton.click();
  }

  /**
   * Go to next step
   */
  async nextStep() {
    await this.nextButton.click();
    await this.page.waitForTimeout(300); // Wait for animation
  }

  /**
   * Go to previous step
   */
  async previousStep() {
    await this.backStepButton.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Set cost for a tool (by index)
   */
  async setToolCost(index: number, cost: string) {
    await this.costInputs.nth(index).fill(cost);
  }

  /**
   * Set costs for all selected tools
   */
  async setAllCosts(costs: string[]) {
    for (let i = 0; i < costs.length; i++) {
      await this.setToolCost(i, costs[i]);
    }
  }

  /**
   * Set usage data for a tool (by index)
   */
  async setToolUsage(index: number, users: string, utilization: string) {
    // Find the tool usage inputs in the correct container
    const toolContainers = this.page.locator('.bg-neutral-50.rounded-xl');
    const container = toolContainers.nth(index);
    
    await container.locator('input[placeholder*="50"]').fill(users);
    await container.locator('input[placeholder*="75"]').fill(utilization);
  }

  /**
   * Set usage data for all tools
   */
  async setAllUsage(usageData: Array<{ users: string; utilization: string }>) {
    for (let i = 0; i < usageData.length; i++) {
      await this.setToolUsage(i, usageData[i].users, usageData[i].utilization);
    }
  }

  /**
   * Submit the audit (final step)
   */
  async submit() {
    await this.submitButton.click();
  }

  /**
   * Complete the entire audit creation flow
   */
  async createAudit(data: {
    name: string;
    tools: string[];
    costs: string[];
    usage: Array<{ users: string; utilization: string }>;
  }) {
    // Step 1: Select tools
    await this.setAuditName(data.name);
    await this.selectTools(data.tools);
    await this.nextStep();
    
    // Step 2: Add costs
    await this.setAllCosts(data.costs);
    await this.nextStep();
    
    // Step 3: Add usage
    await this.setAllUsage(data.usage);
    await this.nextStep();
    
    // Step 4: Review and submit
    await this.submit();
  }

  /**
   * Assert current step
   */
  async assertCurrentStep(stepNumber: 1 | 2 | 3 | 4) {
    const stepIndicators = [
      this.step1Indicator,
      this.step2Indicator,
      this.step3Indicator,
      this.step4Indicator,
    ];
    
    // Current step should have ring styling (active indicator)
    await expect(stepIndicators[stepNumber - 1]).toHaveClass(/ring-4/);
  }

  /**
   * Assert tools are selected
   */
  async assertToolsSelected(count: number) {
    await expect(this.page.locator(`text=Selected (${count})`)).toBeVisible();
  }

  /**
   * Assert total cost is displayed
   */
  async assertTotalCost(expectedAmount: string) {
    await expect(this.page.locator(`text=${expectedAmount}`).first()).toBeVisible();
  }

  /**
   * Assert redirect to audit results
   */
  async assertAuditCreated() {
    await this.page.waitForURL(/\/audit\/\d+/, { timeout: 15000 });
  }

  /**
   * Assert continue button is disabled
   */
  async assertContinueDisabled() {
    await expect(this.nextButton).toBeDisabled();
  }

  /**
   * Assert continue button is enabled
   */
  async assertContinueEnabled() {
    await expect(this.nextButton).toBeEnabled();
  }
}
