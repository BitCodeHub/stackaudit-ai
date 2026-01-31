import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for Sign Up Page
 */
export class SignUpPage {
  readonly page: Page;
  
  // Form elements
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly companyInput: Locator;
  readonly submitButton: Locator;
  readonly termsCheckbox: Locator;
  readonly loginLink: Locator;
  
  // Social signup buttons
  readonly googleButton: Locator;
  readonly githubButton: Locator;
  
  // Page elements
  readonly pageTitle: Locator;
  readonly errorAlert: Locator;

  constructor(page: Page) {
    this.page = page;
    
    this.nameInput = page.getByPlaceholder('John Smith');
    this.emailInput = page.getByPlaceholder('you@company.com');
    this.passwordInput = page.getByPlaceholder(/password|••••/i);
    this.companyInput = page.getByPlaceholder(/company/i);
    this.submitButton = page.getByRole('button', { name: /create account|sign up/i });
    this.termsCheckbox = page.getByRole('checkbox');
    this.loginLink = page.getByRole('link', { name: /sign in/i });
    
    this.googleButton = page.getByRole('button', { name: /google/i });
    this.githubButton = page.getByRole('button', { name: /github/i });
    
    this.pageTitle = page.getByRole('heading', { name: /create.*account|get started/i });
    this.errorAlert = page.locator('.bg-danger-50, [role="alert"]');
  }

  /**
   * Navigate to signup page
   */
  async goto() {
    await this.page.goto('/signup');
    await this.waitForLoad();
  }

  /**
   * Wait for page to fully load
   */
  async waitForLoad() {
    await this.emailInput.waitFor({ state: 'visible' });
  }

  /**
   * Fill signup form
   */
  async fillForm(data: {
    name: string;
    email: string;
    password: string;
    company?: string;
  }) {
    await this.nameInput.fill(data.name);
    await this.emailInput.fill(data.email);
    await this.passwordInput.fill(data.password);
    if (data.company) {
      await this.companyInput.fill(data.company);
    }
  }

  /**
   * Accept terms and conditions
   */
  async acceptTerms() {
    await this.termsCheckbox.check();
  }

  /**
   * Submit signup form
   */
  async submit() {
    await this.submitButton.click();
  }

  /**
   * Complete signup flow
   */
  async signup(data: {
    name: string;
    email: string;
    password: string;
    company?: string;
    acceptTerms?: boolean;
  }) {
    await this.fillForm(data);
    if (data.acceptTerms !== false) {
      await this.acceptTerms();
    }
    await this.submit();
  }

  /**
   * Navigate to login page
   */
  async goToLogin() {
    await this.loginLink.click();
    await this.page.waitForURL(/\/login/);
  }

  /**
   * Assert error message is shown
   */
  async assertError(expectedMessage?: string) {
    await expect(this.errorAlert).toBeVisible();
    if (expectedMessage) {
      await expect(this.errorAlert).toContainText(expectedMessage);
    }
  }

  /**
   * Assert successful signup redirect
   */
  async assertSignupSuccess() {
    await this.page.waitForURL(/\/dashboard/, { timeout: 10000 });
  }
}
