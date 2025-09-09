const request = require('supertest');
const app = require('../server');
const Fields = require('../models/Fields');

describe('Fields API', () => {
  let farmer, buyer, admin;

  beforeEach(async () => {
    farmer = await global.testUtils.createTestUser({ 
      role: 'farmer', 
      email: 'farmer@example.com' 
    });
    buyer = await global.testUtils.createTestUser({ 
      role: 'buyer', 
      email: 'buyer@example.com' 
    });
    admin = await global.testUtils.createTestUser({ 
      role: 'admin', 
      email: 'admin@example.com' 
    });
  });

  describe('GET /api/fields', () => {
    beforeEach(async () => {
      // Create test fields
      await global.testUtils.createTestField({ name: 'Field 1' }, farmer);
      await global.testUtils.createTestField({ name: 'Field 2' }, farmer);
      
      // Create field for different farmer
      const otherFarmer = await global.testUtils.createTestUser({ 
        role: 'farmer', 
        email: 'other@example.com' 
      });
      await global.testUtils.createTestField({ name: 'Other Field' }, otherFarmer);
    });

    it('should get all fields for farmer (own fields only)', async () => {
      const response = await global.testUtils.authenticateRequest(
        request(app).get('/api/fields'),
        farmer
      ).expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].name).toMatch(/Field [12]/);
      expect(response.body[1].name).toMatch(/Field [12]/);
    });

    it('should get all fields for admin', async () => {
      const response = await global.testUtils.authenticateRequest(
        request(app).get('/api/fields'),
        admin
      ).expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(3); // All fields
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/fields')
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('No token');
    });

    it('should support pagination', async () => {
      const response = await global.testUtils.authenticateRequest(
        request(app).get('/api/fields?page=1&limit=1'),
        farmer
      ).expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);
    });

    it('should support filtering by status', async () => {
      // Create field with specific status
      await global.testUtils.createTestField({ 
        name: 'Active Field', 
        status: 'active' 
      }, farmer);
      await global.testUtils.createTestField({ 
        name: 'Inactive Field', 
        status: 'inactive' 
      }, farmer);

      const response = await global.testUtils.authenticateRequest(
        request(app).get('/api/fields?status=active'),
        farmer
      ).expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach(field => {
        expect(field.status).toBe('active');
      });
    });
  });

  describe('GET /api/fields/:id', () => {
    let testField;

    beforeEach(async () => {
      testField = await global.testUtils.createTestField({}, farmer);
    });

    it('should get field by id for owner', async () => {
      const response = await global.testUtils.authenticateRequest(
        request(app).get(`/api/fields/${testField._id}`),
        farmer
      ).expect(200);

      expect(response.body._id).toBe(testField._id.toString());
      expect(response.body.name).toBe(testField.name);
      expect(response.body.farmer._id).toBe(farmer._id.toString());
    });

    it('should get field by id for admin', async () => {
      const response = await global.testUtils.authenticateRequest(
        request(app).get(`/api/fields/${testField._id}`),
        admin
      ).expect(200);

      expect(response.body._id).toBe(testField._id.toString());
    });

    it('should not get field for non-owner non-admin', async () => {
      const response = await global.testUtils.authenticateRequest(
        request(app).get(`/api/fields/${testField._id}`),
        buyer
      ).expect(403);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Access denied');
    });

    it('should return 404 for non-existent field', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await global.testUtils.authenticateRequest(
        request(app).get(`/api/fields/${fakeId}`),
        farmer
      ).expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Field not found');
    });

    it('should return 400 for invalid field id', async () => {
      const response = await global.testUtils.authenticateRequest(
        request(app).get('/api/fields/invalid-id'),
        farmer
      ).expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Invalid field ID');
    });
  });

  describe('POST /api/fields', () => {
    const validFieldData = {
      name: 'New Test Field',
      location: {
        type: 'Point',
        coordinates: [77.2090, 28.6139]
      },
      address: {
        street: '123 New Farm Road',
        city: 'New Delhi',
        state: 'Delhi',
        country: 'India',
        zipCode: '110001'
      },
      size: 15.5,
      unit: 'acres',
      soilType: 'loamy',
      cropType: 'rice',
      irrigationType: 'sprinkler',
      status: 'active'
    };

    it('should create new field for farmer', async () => {
      const response = await global.testUtils.authenticateRequest(
        request(app).post('/api/fields').send(validFieldData),
        farmer
      ).expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.name).toBe(validFieldData.name);
      expect(response.body.farmer).toBe(farmer._id.toString());
      expect(response.body.size).toBe(validFieldData.size);

      // Verify field was saved to database
      const savedField = await Fields.findById(response.body._id);
      expect(savedField).toBeTruthy();
      expect(savedField.name).toBe(validFieldData.name);
    });

    it('should not allow non-farmer to create field', async () => {
      const response = await global.testUtils.authenticateRequest(
        request(app).post('/api/fields').send(validFieldData),
        buyer
      ).expect(403);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Access denied');
    });

    it('should validate required fields', async () => {
      const invalidData = {
        name: 'Test Field'
        // Missing required fields
      };

      const response = await global.testUtils.authenticateRequest(
        request(app).post('/api/fields').send(invalidData),
        farmer
      ).expect(400);

      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    it('should validate location coordinates', async () => {
      const invalidData = {
        ...validFieldData,
        location: {
          type: 'Point',
          coordinates: [200, 100] // Invalid coordinates
        }
      };

      const response = await global.testUtils.authenticateRequest(
        request(app).post('/api/fields').send(invalidData),
        farmer
      ).expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('should validate size is positive', async () => {
      const invalidData = {
        ...validFieldData,
        size: -5
      };

      const response = await global.testUtils.authenticateRequest(
        request(app).post('/api/fields').send(invalidData),
        farmer
      ).expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('should set default values for optional fields', async () => {
      const minimalData = {
        name: 'Minimal Field',
        location: {
          type: 'Point',
          coordinates: [77.2090, 28.6139]
        },
        size: 10,
        unit: 'acres'
      };

      const response = await global.testUtils.authenticateRequest(
        request(app).post('/api/fields').send(minimalData),
        farmer
      ).expect(201);

      expect(response.body.status).toBe('active'); // Default status
      expect(response.body.farmer).toBe(farmer._id.toString());
    });
  });

  describe('PUT /api/fields/:id', () => {
    let testField;

    beforeEach(async () => {
      testField = await global.testUtils.createTestField({}, farmer);
    });

    it('should update field for owner', async () => {
      const updateData = {
        name: 'Updated Field Name',
        size: 20.5,
        status: 'inactive'
      };

      const response = await global.testUtils.authenticateRequest(
        request(app).put(`/api/fields/${testField._id}`).send(updateData),
        farmer
      ).expect(200);

      expect(response.body.name).toBe(updateData.name);
      expect(response.body.size).toBe(updateData.size);
      expect(response.body.status).toBe(updateData.status);

      // Verify field was updated in database
      const updatedField = await Fields.findById(testField._id);
      expect(updatedField.name).toBe(updateData.name);
      expect(updatedField.size).toBe(updateData.size);
    });

    it('should update field for admin', async () => {
      const updateData = {
        name: 'Admin Updated Field'
      };

      const response = await global.testUtils.authenticateRequest(
        request(app).put(`/api/fields/${testField._id}`).send(updateData),
        admin
      ).expect(200);

      expect(response.body.name).toBe(updateData.name);
    });

    it('should not update field for non-owner non-admin', async () => {
      const updateData = {
        name: 'Unauthorized Update'
      };

      const response = await global.testUtils.authenticateRequest(
        request(app).put(`/api/fields/${testField._id}`).send(updateData),
        buyer
      ).expect(403);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Access denied');
    });

    it('should validate update data', async () => {
      const invalidData = {
        size: -10 // Invalid size
      };

      const response = await global.testUtils.authenticateRequest(
        request(app).put(`/api/fields/${testField._id}`).send(invalidData),
        farmer
      ).expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('should return 404 for non-existent field', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const updateData = { name: 'Updated Name' };

      const response = await global.testUtils.authenticateRequest(
        request(app).put(`/api/fields/${fakeId}`).send(updateData),
        farmer
      ).expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Field not found');
    });
  });

  describe('DELETE /api/fields/:id', () => {
    let testField;

    beforeEach(async () => {
      testField = await global.testUtils.createTestField({}, farmer);
    });

    it('should delete field for owner', async () => {
      const response = await global.testUtils.authenticateRequest(
        request(app).delete(`/api/fields/${testField._id}`),
        farmer
      ).expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Field deleted');

      // Verify field was deleted from database
      const deletedField = await Fields.findById(testField._id);
      expect(deletedField).toBeNull();
    });

    it('should delete field for admin', async () => {
      const response = await global.testUtils.authenticateRequest(
        request(app).delete(`/api/fields/${testField._id}`),
        admin
      ).expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Field deleted');
    });

    it('should not delete field for non-owner non-admin', async () => {
      const response = await global.testUtils.authenticateRequest(
        request(app).delete(`/api/fields/${testField._id}`),
        buyer
      ).expect(403);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Access denied');

      // Verify field was not deleted
      const field = await Fields.findById(testField._id);
      expect(field).toBeTruthy();
    });

    it('should return 404 for non-existent field', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await global.testUtils.authenticateRequest(
        request(app).delete(`/api/fields/${fakeId}`),
        farmer
      ).expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Field not found');
    });
  });

  describe('GET /api/fields/:id/analytics', () => {
    let testField;

    beforeEach(async () => {
      testField = await global.testUtils.createTestField({}, farmer);
    });

    it('should get field analytics for owner', async () => {
      const response = await global.testUtils.authenticateRequest(
        request(app).get(`/api/fields/${testField._id}/analytics`),
        farmer
      ).expect(200);

      expect(response.body).toHaveProperty('fieldId');
      expect(response.body).toHaveProperty('analytics');
      expect(response.body.fieldId).toBe(testField._id.toString());
    });

    it('should get field analytics for admin', async () => {
      const response = await global.testUtils.authenticateRequest(
        request(app).get(`/api/fields/${testField._id}/analytics`),
        admin
      ).expect(200);

      expect(response.body).toHaveProperty('analytics');
    });

    it('should not get field analytics for non-owner non-admin', async () => {
      const response = await global.testUtils.authenticateRequest(
        request(app).get(`/api/fields/${testField._id}/analytics`),
        buyer
      ).expect(403);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Access denied');
    });
  });
});