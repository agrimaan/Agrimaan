const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../server');
const User = require('../models/User');

describe('Authentication API', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'John Farmer',
        email: 'john@example.com',
        password: 'password123',
        role: 'farmer',
        phone: '+91 9876543210',
        address: {
          street: '123 Farm Road',
          city: 'Delhi',
          state: 'Delhi',
          country: 'India',
          zipCode: '110001'
        }
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.role).toBe(userData.role);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should not register user with existing email', async () => {
      const userData = {
        name: 'John Farmer',
        email: 'john@example.com',
        password: 'password123',
        role: 'farmer',
        phone: '+91 9876543210'
      };

      // Create user first
      await global.testUtils.createTestUser({ email: userData.email });

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('already exists');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Farmer'
          // Missing required fields
        })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    it('should validate email format', async () => {
      const userData = {
        name: 'John Farmer',
        email: 'invalid-email',
        password: 'password123',
        role: 'farmer',
        phone: '+91 9876543210'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('should validate password length', async () => {
      const userData = {
        name: 'John Farmer',
        email: 'john@example.com',
        password: '123', // Too short
        role: 'farmer',
        phone: '+91 9876543210'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('POST /api/auth/login', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await global.testUtils.createTestUser({
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10)
      });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should not login with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should not login with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should validate required fields for login', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com'
          // Missing password
        })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('GET /api/auth/me', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await global.testUtils.createTestUser();
    });

    it('should get current user with valid token', async () => {
      const token = global.testUtils.generateTestToken(testUser._id, testUser.role);

      const response = await request(app)
        .get('/api/auth/me')
        .set('x-auth-token', token)
        .expect(200);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.email).toBe(testUser.email);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should not get user without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('No token');
    });

    it('should not get user with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('x-auth-token', 'invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Token is not valid');
    });
  });

  describe('PUT /api/auth/change-password', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await global.testUtils.createTestUser({
        password: await bcrypt.hash('oldpassword', 10)
      });
    });

    it('should change password with valid current password', async () => {
      const token = global.testUtils.generateTestToken(testUser._id, testUser.role);

      const response = await request(app)
        .put('/api/auth/change-password')
        .set('x-auth-token', token)
        .send({
          currentPassword: 'oldpassword',
          newPassword: 'newpassword123'
        })
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Password updated');

      // Verify password was actually changed
      const updatedUser = await User.findById(testUser._id);
      const isNewPasswordValid = await bcrypt.compare('newpassword123', updatedUser.password);
      expect(isNewPasswordValid).toBe(true);
    });

    it('should not change password with invalid current password', async () => {
      const token = global.testUtils.generateTestToken(testUser._id, testUser.role);

      const response = await request(app)
        .put('/api/auth/change-password')
        .set('x-auth-token', token)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword123'
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Current password is incorrect');
    });

    it('should validate new password length', async () => {
      const token = global.testUtils.generateTestToken(testUser._id, testUser.role);

      const response = await request(app)
        .put('/api/auth/change-password')
        .set('x-auth-token', token)
        .send({
          currentPassword: 'oldpassword',
          newPassword: '123' // Too short
        })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .put('/api/auth/change-password')
        .send({
          currentPassword: 'oldpassword',
          newPassword: 'newpassword123'
        })
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('No token');
    });
  });
});