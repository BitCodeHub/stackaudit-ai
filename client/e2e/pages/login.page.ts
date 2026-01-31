import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for Login Page
 */
export class LoginPage {
  readonly page: Page;
  
  // Form elements
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly rememberMeCheckbox: Locator;
  readonly forgotPasswordLink: Locator;
  readonly signUpLink: Locator;
  
  // Social login buttons
  readonly googleButton: Locator;
  readonly githubButton: Locator;
  
  // Password visibility toggle
  readonly passwordToggle: Locator;
  
  // Error message
  readonly errorAlert: Locator;
  
  // Page elements
  readonly pageTitle: Locator;
  readonly logo: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Form inputs - using placeholder text as identifiers
    this.emailInput = page.getByPlaceholder('you@company.com');
    this.passwordInput = page.getByPlaceholder('••••••••');
    this.submitButton = page.getByRole('button', { name: /sign in/i });
    this.rememberMeCheckbox = page.getByRole('checkbox');
    this.forgotPasswordLink = page.getByText('Forgot password?');
    this.signUpLink = page.getByRole('link', { name: /sign up free/i });
    
    // Social login
    this.googleButton = page.getByRole('button', { name: /google/i });
    this.githubButton = page.getByRole('button', { name: /github/i });
    
    // Password toggle (eye icon button)
    this.passwordToggle = page.locator('button').filter({ has: page.locator('svg') }).nth(1);
    
    // Error message
    this.errorAlert = page.locator('.bg-danger-50, [role="alert"]');
    
    // Page elements
    this.pageTitle = page.getByRole('heading', { name: /welcome back/i });
    this.logo = page.locator('text=StackAudit');
  }

  /**
   * Navigate to login page
   */
  async goto() {
    await this.page.goto('/login');
    await this.waitForLoad();
  }

  /**
   * Wait for page to fully load
   */
  async waitForLoad() {
    await this.emailInput.waitFor({ state: 'visible' });
    await expect(this.pageTitle).toBeVisible();
  }

  /**
   * Fill login form
   */
  async fillForm(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  /**
   * Submit login form
   */
  async submit() {
    await this.submitButton.click();
  }

  /**
   * Complete login flow
   */
  async login(email: string, password: string) {
    await this.fillForm(email, password);
    await this.submit();
  }

  /**
   * Toggle password visibility
   */
  async togglePasswordVisibility() {
    await this.passwordToggle.click();
  }

  /**
   * Check remember me
   */
  async checkRememberMe() {
    await this.rememberMeCheckbox.check();
  }

  /**
   * Navigate to sign up
   */
  async goToSignUp() {
    await this.signUpLink.click();
    await this.page.waitForURL(/\/signup/);
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
   * Assert no error is shown
   */
  async assertNoError() {
    await expect(this.errorAlert).not.toBeVisible();
  }

  /**
   * Assert form validation error on email
   */
  async assertEmailValidation() {
    const emailField = this.emailInput;
    await expect(emailField).toHaveAttribute('required', '');
  }

  /**
   * Assert form validation error on password
   */
  async assertPasswordValidation() {
    const passwordField = this.passwordInput;
    await expect(passwordField).toHaveAttribute('required', '');
  }

  /**
   * Assert successful redirect to dashboard
   */
  async assertLoginSuccess() {
    await this.page.waitForURL(/\/dashboard/, { timeout: 10000 });
  }

  /**
   * Assert password is visible/hidden
   */
  async assertPasswordVisible(isVisible: boolean) {
    const expectedType = isVisible ? 'text' : 'password';
    await expect(this.passwordInput).toHaveAttribute('type', expectedType);
  }
}
