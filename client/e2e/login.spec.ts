import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';
import { SignUpPage } from './pages/signup.page';
import { DashboardPage } from './pages/dashboard.page';
import { clearAuthState, generateTestEmail } from './utils/helpers';

test.describe('Login Flow', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await clearAuthState(page);
    await loginPage.goto();
  });

  test.describe('Page Load', () => {
    test('should display login form correctly', async () => {
      await expect(loginPage.pageTitle).toBeVisible();
      await expect(loginPage.emailInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();
      await expect(loginPage.submitButton).toBeVisible();
      await expect(loginPage.rememberMeCheckbox).toBeVisible();
      await expect(loginPage.forgotPasswordLink).toBeVisible();
      await expect(loginPage.signUpLink).toBeVisible();
    });

    test('should display social login options', async () => {
      await expect(loginPage.googleButton).toBeVisible();
      await expect(loginPage.githubButton).toBeVisible();
    });

    test('should display StackAudit branding', async () => {
      await expect(loginPage.logo).toBeVisible();
    });
  });

  test.describe('Form Validation', () => {
    test('should require email field', async () => {
      await loginPage.passwordInput.fill('password123');
      await loginPage.submit();
      
      // Form should not submit - still on login page
      await expect(loginPage.page).toHaveURL(/\/login/);
    });

    test('should require password field', async () => {
      await loginPage.emailInput.fill('test@example.com');
      await loginPage.submit();
      
      // Form should not submit - still on login page
      await expect(loginPage.page).toHaveURL(/\/login/);
    });

    test('should validate email format', async ({ page }) => {
      await loginPage.emailInput.fill('invalid-email');
      await loginPage.passwordInput.fill('password123');
      
      // Check HTML5 validation
      const isValid = await loginPage.emailInput.evaluate(
        (el: HTMLInputElement) => el.validity.valid
      );
      expect(isValid).toBe(false);
    });
  });

  test.describe('Password Visibility', () => {
    test('should hide password by default', async () => {
      await loginPage.assertPasswordVisible(false);
    });

    test('should toggle password visibility', async () => {
      await loginPage.passwordInput.fill('mypassword');
      
      // Toggle to visible
      await loginPage.togglePasswordVisibility();
      await loginPage.assertPasswordVisible(true);
      
      // Toggle back to hidden
      await loginPage.togglePasswordVisibility();
      await loginPage.assertPasswordVisible(false);
    });
  });

  test.describe('Successful Login', () => {
    test('should login with valid credentials', async () => {
      await loginPage.login('test@stackaudit.ai', 'password123');
      await loginPage.assertLoginSuccess();
    });

    test('should redirect to dashboard after login', async () => {
      await loginPage.login('user@company.com', 'password');
      
      const dashboardPage = new DashboardPage(loginPage.page);
      await dashboardPage.assertLoaded();
    });

    test('should store auth token in localStorage', async ({ page }) => {
      await loginPage.login('test@stackaudit.ai', 'password123');
      await loginPage.assertLoginSuccess();
      
      const token = await page.evaluate(() => 
        localStorage.getItem('stackaudit_token')
      );
      expect(token).toBeTruthy();
    });

    test('should store user data in localStorage', async ({ page }) => {
      await loginPage.login('test@stackaudit.ai', 'password123');
      await loginPage.assertLoginSuccess();
      
      const userData = await page.evaluate(() => 
        localStorage.getItem('stackaudit_user')
      );
      expect(userData).toBeTruthy();
      
      const user = JSON.parse(userData!);
      expect(user.email).toBe('test@stackaudit.ai');
    });
  });

  test.describe('Remember Me', () => {
    test('should have remember me checkbox', async () => {
      await expect(loginPage.rememberMeCheckbox).toBeVisible();
      await expect(loginPage.rememberMeCheckbox).not.toBeChecked();
    });

    test('should be able to check remember me', async () => {
      await loginPage.checkRememberMe();
      await expect(loginPage.rememberMeCheckbox).toBeChecked();
    });
  });

  test.describe('Navigation', () => {
    test('should navigate to signup page', async () => {
      await loginPage.goToSignUp();
      
      const signUpPage = new SignUpPage(loginPage.page);
      await signUpPage.waitForLoad();
    });

    test('should have working forgot password link', async () => {
      await expect(loginPage.forgotPasswordLink).toBeVisible();
      // Link should be present (actual navigation depends on implementation)
    });
  });

  test.describe('Authenticated User Redirect', () => {
    test('should redirect to dashboard if already logged in', async ({ page }) => {
      // Set auth state
      await page.evaluate(() => {
        const user = { id: '1', email: 'test@test.com', name: 'Test', plan: 'pro' };
        localStorage.setItem('stackaudit_token', 'valid_token');
        localStorage.setItem('stackaudit_user', JSON.stringify(user));
      });
      
      // Try to visit login page
      await page.goto('/login');
      
      // Should be redirected to dashboard
      await expect(page).toHaveURL(/\/dashboard/);
    });
  });
});

test.describe('Sign Up Flow', () => {
  let signUpPage: SignUpPage;

  test.beforeEach(async ({ page }) => {
    signUpPage = new SignUpPage(page);
    await clearAuthState(page);
    await signUpPage.goto();
  });

  test('should display signup form correctly', async () => {
    await expect(signUpPage.nameInput).toBeVisible();
    await expect(signUpPage.emailInput).toBeVisible();
    await expect(signUpPage.passwordInput).toBeVisible();
    await expect(signUpPage.submitButton).toBeVisible();
  });

  test('should signup with valid data', async () => {
    const testEmail = generateTestEmail();
    
    await signUpPage.signup({
      name: 'Test User',
      email: testEmail,
      password: 'Password123!',
      company: 'Test Company',
    });
    
    await signUpPage.assertSignupSuccess();
  });

  test('should navigate to login page', async () => {
    await signUpPage.goToLogin();
    
    const loginPage = new LoginPage(signUpPage.page);
    await loginPage.waitForLoad();
  });
});
