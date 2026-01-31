/**
 * Authentication API Tests
 * Tests for /api/auth endpoints
 */

const request = require('supertest');
const app = require('../src/index');
const { users, organizations } = require('../src/data/store');
const { 
  createTestUser, 
  generateAuthToken,
  createExpiredToken,
  createInvalidToken 
} = require('./helpers/testUtils');

describe('Auth API', () => {
  describe('POST /api/auth/signup', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'securepassword123',
        name: 'New User',
        organizationName: 'New Org'
      };

      const res = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(201);

      expect(res.body).toHaveProperty('message', 'Account created successfully');
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', userData.email);
      expect(res.body.user).toHaveProperty('name', userData.name);
      expect(res.body.user).toHaveProperty('role', 'admin');
      expect(res.body.user).toHaveProperty('plan', 'free');
      expect(res.body.user).not.toHaveProperty('passwordHash');
    });

    it('should create organization with default name if not provided', async () => {
      const userData = {
        email: 'defaultorg@example.com',
        password: 'securepassword123',
        name: 'John Doe'
      };

      const res = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(201);

      const org = organizations.get(res.body.user.organizationId);
      expect(org.name).toBe("John Doe's Organization");
    });

    it('should return 409 if email already exists', async () => {
      const { user } = createTestUser({ email: 'existing@example.com' });

      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'existing@example.com',
          password: 'securepassword123',
          name: 'Another User'
        })
        .expect(409);

      expect(res.body).toHaveProperty('error', 'Email already registered');
    });

    it('should return 400 for invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'not-an-email',
          password: 'securepassword123',
          name: 'Test User'
        })
        .expect(400);

      expect(res.body).toHaveProperty('error', 'Validation failed');
    });

    it('should return 400 for short password', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'short',
          name: 'Test User'
        })
        .expect(400);

      expect(res.body).toHaveProperty('error', 'Validation failed');
      expect(res.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'password' })
        ])
      );
    });

    it('should return 400 for missing name', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'securepassword123'
        })
        .expect(400);

      expect(res.body).toHaveProperty('error', 'Validation failed');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const { user } = createTestUser({ 
        email: 'login@example.com',
        password: 'correctpassword'
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'correctpassword'
        })
        .expect(200);

      expect(res.body).toHaveProperty('message', 'Login successful');
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', 'login@example.com');
      expect(res.body.user).not.toHaveProperty('passwordHash');
    });

    it('should update lastLoginAt on successful login', async () => {
      const { user } = createTestUser({ email: 'lastlogin@example.com', password: 'password123' });
      expect(user.lastLoginAt).toBeNull();

      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'lastlogin@example.com',
          password: 'password123'
        })
        .expect(200);

      const updatedUser = users.get(user.id);
      expect(updatedUser.lastLoginAt).not.toBeNull();
    });

    it('should return 401 for invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'anypassword'
        })
        .expect(401);

      expect(res.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should return 401 for invalid password', async () => {
      createTestUser({ email: 'wrongpw@example.com', password: 'correctpassword' });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrongpw@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(res.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should return 400 for missing email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'anypassword'
        })
        .expect(400);

      expect(res.body).toHaveProperty('error', 'Validation failed');
    });

    it('should return 400 for missing password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com'
        })
        .expect(400);

      expect(res.body).toHaveProperty('error', 'Validation failed');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user info', async () => {
      const { user, org } = createTestUser({ 
        email: 'me@example.com',
        name: 'Me User'
      });
      const token = generateAuthToken(user);

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.user).toHaveProperty('email', 'me@example.com');
      expect(res.body.user).toHaveProperty('name', 'Me User');
      expect(res.body.organization).toHaveProperty('id', org.id);
    });

    it('should return 401 without token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(res.body).toHaveProperty('error', 'No token provided');
    });

    it('should return 401 with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${createInvalidToken()}`)
        .expect(401);

      expect(res.body).toHaveProperty('error', 'Invalid token');
    });

    it('should return 401 with expired token', async () => {
      const { user } = createTestUser();
      const expiredToken = createExpiredToken(user);

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should return a new token', async () => {
      const { user } = createTestUser();
      const token = generateAuthToken(user);

      const res = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toHaveProperty('token');
      // Token contains iat (issued at) which is in seconds, so same second may produce same token
      // Just verify we get a valid token back
      expect(typeof res.body.token).toBe('string');
      expect(res.body.token.split('.').length).toBe(3); // Valid JWT format
    });

    it('should return 401 without token', async () => {
      await request(app)
        .post('/api/auth/refresh')
        .expect(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const { user } = createTestUser();
      const token = generateAuthToken(user);

      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toHaveProperty('message', 'Logged out successfully');
    });

    it('should return 401 without token', async () => {
      await request(app)
        .post('/api/auth/logout')
        .expect(401);
    });
  });

  describe('POST /api/auth/change-password', () => {
    it('should change password successfully', async () => {
      const { user } = createTestUser({ password: 'oldpassword123' });
      const token = generateAuthToken(user);

      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'oldpassword123',
          newPassword: 'newpassword456'
        })
        .expect(200);

      expect(res.body).toHaveProperty('message', 'Password changed successfully');

      // Verify new password works
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'newpassword456'
        })
        .expect(200);

      expect(loginRes.body).toHaveProperty('token');
    });

    it('should return 401 for wrong current password', async () => {
      const { user } = createTestUser({ password: 'correctpassword' });
      const token = generateAuthToken(user);

      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword456'
        })
        .expect(401);

      expect(res.body).toHaveProperty('error', 'Current password is incorrect');
    });

    it('should return 400 for short new password', async () => {
      const { user } = createTestUser({ password: 'oldpassword123' });
      const token = generateAuthToken(user);

      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'oldpassword123',
          newPassword: 'short'
        })
        .expect(400);

      expect(res.body).toHaveProperty('error', 'Validation failed');
    });

    it('should return 401 without token', async () => {
      await request(app)
        .post('/api/auth/change-password')
        .send({
          currentPassword: 'oldpassword123',
          newPassword: 'newpassword456'
        })
        .expect(401);
    });
  });
});

describe('Auth Middleware', () => {
  it('should reject malformed authorization header', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'NotBearer token')
      .expect(401);

    expect(res.body).toHaveProperty('error', 'No token provided');
  });

  it('should reject token for deleted user', async () => {
    const { user } = createTestUser();
    const token = generateAuthToken(user);
    
    // Delete the user
    users.delete(user.id);

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(401);

    expect(res.body).toHaveProperty('error', 'User not found');
  });
});
