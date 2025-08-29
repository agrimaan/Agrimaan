import { expect } from 'chai';
import sinon from 'sinon';
import { Request, Response } from 'express';
import * as fieldController from '../fieldController';
import Field from '../../models/Field';
import mongoose from 'mongoose';

describe('Field Controller', () => {
  // Create stubs for req, res objects
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusStub: sinon.SinonStub;
  let jsonStub: sinon.SinonStub;
  let findStub: sinon.SinonStub;
  let findByIdStub: sinon.SinonStub;
  let createStub: sinon.SinonStub;
  let findByIdAndUpdateStub: sinon.SinonStub;
  let findByIdAndDeleteStub: sinon.SinonStub;

  beforeEach(() => {
    // Setup request and response stubs
    jsonStub = sinon.stub();
    statusStub = sinon.stub().returns({ json: jsonStub });
    req = {};
    res = {
      status: statusStub,
      json: jsonStub
    };

    // Setup database model stubs
    findStub = sinon.stub(Field, 'find');
    findByIdStub = sinon.stub(Field, 'findById');
    createStub = sinon.stub(Field, 'create');
    findByIdAndUpdateStub = sinon.stub(Field, 'findByIdAndUpdate');
    findByIdAndDeleteStub = sinon.stub(Field, 'findByIdAndDelete');
  });

  afterEach(() => {
    // Restore all stubs
    sinon.restore();
  });

  describe('getAllFields', () => {
    it('should return all fields', async () => {
      // Mock data
      const mockFields = [
        {
          _id: '60d21b4667d0d8992e610c85',
          name: 'North Field',
          area: 25.4,
          location: {
            type: 'Point',
            coordinates: [-121.1867, 37.6564]
          },
          crop: 'Corn',
          soilType: 'Clay Loam',
          owner: '60d21b4667d0d8992e610c80'
        },
        {
          _id: '60d21b4667d0d8992e610c86',
          name: 'South Field',
          area: 18.7,
          location: {
            type: 'Point',
            coordinates: [-121.1867, 37.6464]
          },
          crop: 'Soybeans',
          soilType: 'Silt Loam',
          owner: '60d21b4667d0d8992e610c80'
        }
      ];

      // Setup the stub to return mock data
      findStub.resolves(mockFields);

      // Call the controller method
      await fieldController.getAllFields(req as Request, res as Response);

      // Verify the results
      expect(findStub.calledOnce).to.be.true;
      expect(statusStub.calledWith(200)).to.be.true;
      expect(jsonStub.calledWith(mockFields)).to.be.true;
    });

    it('should handle errors', async () => {
      // Setup the stub to throw an error
      const error = new Error('Database error');
      findStub.rejects(error);

      // Call the controller method
      await fieldController.getAllFields(req as Request, res as Response);

      // Verify the results
      expect(findStub.calledOnce).to.be.true;
      expect(statusStub.calledWith(500)).to.be.true;
      expect(jsonStub.calledWith({ error: 'Failed to fetch fields', details: error.message })).to.be.true;
    });
  });

  describe('getFieldById', () => {
    it('should return a field by ID', async () => {
      // Mock data
      const mockField = {
        _id: '60d21b4667d0d8992e610c85',
        name: 'North Field',
        area: 25.4,
        location: {
          type: 'Point',
          coordinates: [-121.1867, 37.6564]
        },
        crop: 'Corn',
        soilType: 'Clay Loam',
        owner: '60d21b4667d0d8992e610c80'
      };

      // Setup request params
      req.params = { id: mockField._id };

      // Setup the stub to return mock data
      findByIdStub.resolves(mockField);

      // Call the controller method
      await fieldController.getFieldById(req as Request, res as Response);

      // Verify the results
      expect(findByIdStub.calledWith(mockField._id)).to.be.true;
      expect(statusStub.calledWith(200)).to.be.true;
      expect(jsonStub.calledWith(mockField)).to.be.true;
    });

    it('should return 404 if field not found', async () => {
      // Setup request params
      req.params = { id: '60d21b4667d0d8992e610c85' };

      // Setup the stub to return null (field not found)
      findByIdStub.resolves(null);

      // Call the controller method
      await fieldController.getFieldById(req as Request, res as Response);

      // Verify the results
      expect(findByIdStub.calledWith(req.params.id)).to.be.true;
      expect(statusStub.calledWith(404)).to.be.true;
      expect(jsonStub.calledWith({ error: 'Field not found' })).to.be.true;
    });

    it('should handle invalid ID format', async () => {
      // Setup request params with invalid ID
      req.params = { id: 'invalid-id' };

      // Setup the stub to throw an error for invalid ID
      findByIdStub.rejects(new mongoose.Error.CastError('ObjectId', 'invalid-id', 'id'));

      // Call the controller method
      await fieldController.getFieldById(req as Request, res as Response);

      // Verify the results
      expect(statusStub.calledWith(400)).to.be.true;
      expect(jsonStub.calledWith({ error: 'Invalid field ID format' })).to.be.true;
    });

    it('should handle other errors', async () => {
      // Setup request params
      req.params = { id: '60d21b4667d0d8992e610c85' };

      // Setup the stub to throw a generic error
      const error = new Error('Database error');
      findByIdStub.rejects(error);

      // Call the controller method
      await fieldController.getFieldById(req as Request, res as Response);

      // Verify the results
      expect(findByIdStub.calledWith(req.params.id)).to.be.true;
      expect(statusStub.calledWith(500)).to.be.true;
      expect(jsonStub.calledWith({ error: 'Failed to fetch field', details: error.message })).to.be.true;
    });
  });

  describe('createField', () => {
    it('should create a new field', async () => {
      // Mock request body
      const fieldData = {
        name: 'East Field',
        area: 15.2,
        location: {
          type: 'Point',
          coordinates: [-121.1767, 37.6564]
        },
        crop: 'Wheat',
        soilType: 'Sandy Loam',
        owner: '60d21b4667d0d8992e610c80'
      };

      // Mock created field
      const createdField = {
        _id: '60d21b4667d0d8992e610c87',
        ...fieldData
      };

      // Setup request body
      req.body = fieldData;

      // Setup the stub to return the created field
      createStub.resolves(createdField);

      // Call the controller method
      await fieldController.createField(req as Request, res as Response);

      // Verify the results
      expect(createStub.calledWith(fieldData)).to.be.true;
      expect(statusStub.calledWith(201)).to.be.true;
      expect(jsonStub.calledWith(createdField)).to.be.true;
    });

    it('should handle validation errors', async () => {
      // Mock request with invalid data (missing required field)
      req.body = {
        // Missing name field
        area: 15.2,
        location: {
          type: 'Point',
          coordinates: [-121.1767, 37.6564]
        }
      };

      // Setup the stub to throw a validation error
      const validationError = new mongoose.Error.ValidationError();
      validationError.errors = {
        name: new mongoose.Error.ValidatorError({ message: 'Name is required', path: 'name' })
      };
      createStub.rejects(validationError);

      // Call the controller method
      await fieldController.createField(req as Request, res as Response);

      // Verify the results
      expect(statusStub.calledWith(400)).to.be.true;
      expect(jsonStub.calledWith({ 
        error: 'Validation error', 
        details: { name: 'Name is required' } 
      })).to.be.true;
    });

    it('should handle other errors', async () => {
      // Setup request body
      req.body = {
        name: 'East Field',
        area: 15.2
      };

      // Setup the stub to throw a generic error
      const error = new Error('Database error');
      createStub.rejects(error);

      // Call the controller method
      await fieldController.createField(req as Request, res as Response);

      // Verify the results
      expect(createStub.calledWith(req.body)).to.be.true;
      expect(statusStub.calledWith(500)).to.be.true;
      expect(jsonStub.calledWith({ error: 'Failed to create field', details: error.message })).to.be.true;
    });
  });

  describe('updateField', () => {
    it('should update a field', async () => {
      // Mock field ID and update data
      const fieldId = '60d21b4667d0d8992e610c85';
      const updateData = {
        name: 'Updated North Field',
        crop: 'Soybeans'
      };

      // Mock updated field
      const updatedField = {
        _id: fieldId,
        name: 'Updated North Field',
        area: 25.4,
        crop: 'Soybeans',
        soilType: 'Clay Loam'
      };

      // Setup request params and body
      req.params = { id: fieldId };
      req.body = updateData;

      // Setup the stub to return the updated field
      findByIdAndUpdateStub.resolves(updatedField);

      // Call the controller method
      await fieldController.updateField(req as Request, res as Response);

      // Verify the results
      expect(findByIdAndUpdateStub.calledWith(
        fieldId,
        updateData,
        { new: true, runValidators: true }
      )).to.be.true;
      expect(statusStub.calledWith(200)).to.be.true;
      expect(jsonStub.calledWith(updatedField)).to.be.true;
    });

    it('should return 404 if field not found', async () => {
      // Setup request params and body
      req.params = { id: '60d21b4667d0d8992e610c85' };
      req.body = { name: 'Updated Field' };

      // Setup the stub to return null (field not found)
      findByIdAndUpdateStub.resolves(null);

      // Call the controller method
      await fieldController.updateField(req as Request, res as Response);

      // Verify the results
      expect(statusStub.calledWith(404)).to.be.true;
      expect(jsonStub.calledWith({ error: 'Field not found' })).to.be.true;
    });

    it('should handle validation errors', async () => {
      // Setup request params and body with invalid data
      req.params = { id: '60d21b4667d0d8992e610c85' };
      req.body = { area: -10 }; // Invalid area (negative value)

      // Setup the stub to throw a validation error
      const validationError = new mongoose.Error.ValidationError();
      validationError.errors = {
        area: new mongoose.Error.ValidatorError({ message: 'Area must be positive', path: 'area' })
      };
      findByIdAndUpdateStub.rejects(validationError);

      // Call the controller method
      await fieldController.updateField(req as Request, res as Response);

      // Verify the results
      expect(statusStub.calledWith(400)).to.be.true;
      expect(jsonStub.calledWith({ 
        error: 'Validation error', 
        details: { area: 'Area must be positive' } 
      })).to.be.true;
    });

    it('should handle other errors', async () => {
      // Setup request params and body
      req.params = { id: '60d21b4667d0d8992e610c85' };
      req.body = { name: 'Updated Field' };

      // Setup the stub to throw a generic error
      const error = new Error('Database error');
      findByIdAndUpdateStub.rejects(error);

      // Call the controller method
      await fieldController.updateField(req as Request, res as Response);

      // Verify the results
      expect(statusStub.calledWith(500)).to.be.true;
      expect(jsonStub.calledWith({ error: 'Failed to update field', details: error.message })).to.be.true;
    });
  });

  describe('deleteField', () => {
    it('should delete a field', async () => {
      // Mock field ID
      const fieldId = '60d21b4667d0d8992e610c85';
      
      // Mock deleted field
      const deletedField = {
        _id: fieldId,
        name: 'North Field',
        area: 25.4
      };

      // Setup request params
      req.params = { id: fieldId };

      // Setup the stub to return the deleted field
      findByIdAndDeleteStub.resolves(deletedField);

      // Call the controller method
      await fieldController.deleteField(req as Request, res as Response);

      // Verify the results
      expect(findByIdAndDeleteStub.calledWith(fieldId)).to.be.true;
      expect(statusStub.calledWith(200)).to.be.true;
      expect(jsonStub.calledWith({ message: 'Field deleted successfully', field: deletedField })).to.be.true;
    });

    it('should return 404 if field not found', async () => {
      // Setup request params
      req.params = { id: '60d21b4667d0d8992e610c85' };

      // Setup the stub to return null (field not found)
      findByIdAndDeleteStub.resolves(null);

      // Call the controller method
      await fieldController.deleteField(req as Request, res as Response);

      // Verify the results
      expect(findByIdAndDeleteStub.calledWith(req.params.id)).to.be.true;
      expect(statusStub.calledWith(404)).to.be.true;
      expect(jsonStub.calledWith({ error: 'Field not found' })).to.be.true;
    });

    it('should handle errors', async () => {
      // Setup request params
      req.params = { id: '60d21b4667d0d8992e610c85' };

      // Setup the stub to throw a generic error
      const error = new Error('Database error');
      findByIdAndDeleteStub.rejects(error);

      // Call the controller method
      await fieldController.deleteField(req as Request, res as Response);

      // Verify the results
      expect(findByIdAndDeleteStub.calledWith(req.params.id)).to.be.true;
      expect(statusStub.calledWith(500)).to.be.true;
      expect(jsonStub.calledWith({ error: 'Failed to delete field', details: error.message })).to.be.true;
    });
  });
});