import { expect } from 'chai';
import sinon from 'sinon';
import { Request, Response } from 'express';
import * as FieldsController from '../FieldsController';
import Fields from '../../models/Fields';
import mongoose from 'mongoose';

describe('Fields Controller', () => {
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
    findStub = sinon.stub(Fields, 'find');
    findByIdStub = sinon.stub(Fields, 'findById');
    createStub = sinon.stub(Fields, 'create');
    findByIdAndUpdateStub = sinon.stub(Fields, 'findByIdAndUpdate');
    findByIdAndDeleteStub = sinon.stub(Fields, 'findByIdAndDelete');
  });

  afterEach(() => {
    // Restore all stubs
    sinon.restore();
  });

  describe('getAllfields', () => {
    it('should return all fields', async () => {
      // Mock data
      const mockfields = [
        {
          _id: '60d21b4667d0d8992e610c85',
          name: 'North Fields',
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
          name: 'South Fields',
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
      findStub.resolves(mockfields);

      // Call the controller method
      await FieldsController.getAllfields(req as Request, res as Response);

      // Verify the results
      expect(findStub.calledOnce).to.be.true;
      expect(statusStub.calledWith(200)).to.be.true;
      expect(jsonStub.calledWith(mockfields)).to.be.true;
    });

    it('should handle errors', async () => {
      // Setup the stub to throw an error
      const error = new Error('Database error');
      findStub.rejects(error);

      // Call the controller method
      await FieldsController.getAllfields(req as Request, res as Response);

      // Verify the results
      expect(findStub.calledOnce).to.be.true;
      expect(statusStub.calledWith(500)).to.be.true;
      expect(jsonStub.calledWith({ error: 'Failed to fetch fields', details: error.message })).to.be.true;
    });
  });

  describe('getFieldsById', () => {
    it('should return a Fields by ID', async () => {
      // Mock data
      const mockFields = {
        _id: '60d21b4667d0d8992e610c85',
        name: 'North Fields',
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
      req.params = { id: mockFields._id };

      // Setup the stub to return mock data
      findByIdStub.resolves(mockFields);

      // Call the controller method
      await FieldsController.getFieldsById(req as Request, res as Response);

      // Verify the results
      expect(findByIdStub.calledWith(mockFields._id)).to.be.true;
      expect(statusStub.calledWith(200)).to.be.true;
      expect(jsonStub.calledWith(mockFields)).to.be.true;
    });

    it('should return 404 if Fields not found', async () => {
      // Setup request params
      req.params = { id: '60d21b4667d0d8992e610c85' };

      // Setup the stub to return null (Fields not found)
      findByIdStub.resolves(null);

      // Call the controller method
      await FieldsController.getFieldsById(req as Request, res as Response);

      // Verify the results
      expect(findByIdStub.calledWith(req.params.id)).to.be.true;
      expect(statusStub.calledWith(404)).to.be.true;
      expect(jsonStub.calledWith({ error: 'Fields not found' })).to.be.true;
    });

    it('should handle invalid ID format', async () => {
      // Setup request params with invalid ID
      req.params = { id: 'invalid-id' };

      // Setup the stub to throw an error for invalid ID
      findByIdStub.rejects(new mongoose.Error.CastError('ObjectId', 'invalid-id', 'id'));

      // Call the controller method
      await FieldsController.getFieldsById(req as Request, res as Response);

      // Verify the results
      expect(statusStub.calledWith(400)).to.be.true;
      expect(jsonStub.calledWith({ error: 'Invalid Fields ID format' })).to.be.true;
    });

    it('should handle other errors', async () => {
      // Setup request params
      req.params = { id: '60d21b4667d0d8992e610c85' };

      // Setup the stub to throw a generic error
      const error = new Error('Database error');
      findByIdStub.rejects(error);

      // Call the controller method
      await FieldsController.getFieldsById(req as Request, res as Response);

      // Verify the results
      expect(findByIdStub.calledWith(req.params.id)).to.be.true;
      expect(statusStub.calledWith(500)).to.be.true;
      expect(jsonStub.calledWith({ error: 'Failed to fetch Fields', details: error.message })).to.be.true;
    });
  });

  describe('createFields', () => {
    it('should create a new Fields', async () => {
      // Mock request body
      const FieldsData = {
        name: 'East Fields',
        area: 15.2,
        location: {
          type: 'Point',
          coordinates: [-121.1767, 37.6564]
        },
        crop: 'Wheat',
        soilType: 'Sandy Loam',
        owner: '60d21b4667d0d8992e610c80'
      };

      // Mock created Fields
      const createdFields = {
        _id: '60d21b4667d0d8992e610c87',
        ...FieldsData
      };

      // Setup request body
      req.body = FieldsData;

      // Setup the stub to return the created Fields
      createStub.resolves(createdFields);

      // Call the controller method
      await FieldsController.createFields(req as Request, res as Response);

      // Verify the results
      expect(createStub.calledWith(FieldsData)).to.be.true;
      expect(statusStub.calledWith(201)).to.be.true;
      expect(jsonStub.calledWith(createdFields)).to.be.true;
    });

    it('should handle validation errors', async () => {
      // Mock request with invalid data (missing required Fields)
      req.body = {
        // Missing name Fields
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
      await FieldsController.createFields(req as Request, res as Response);

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
        name: 'East Fields',
        area: 15.2
      };

      // Setup the stub to throw a generic error
      const error = new Error('Database error');
      createStub.rejects(error);

      // Call the controller method
      await FieldsController.createFields(req as Request, res as Response);

      // Verify the results
      expect(createStub.calledWith(req.body)).to.be.true;
      expect(statusStub.calledWith(500)).to.be.true;
      expect(jsonStub.calledWith({ error: 'Failed to create Fields', details: error.message })).to.be.true;
    });
  });

  describe('updateFields', () => {
    it('should update a Fields', async () => {
      // Mock Fields ID and update data
      const FieldsId = '60d21b4667d0d8992e610c85';
      const updateData = {
        name: 'Updated North Fields',
        crop: 'Soybeans'
      };

      // Mock updated Fields
      const updatedFields = {
        _id: FieldsId,
        name: 'Updated North Fields',
        area: 25.4,
        crop: 'Soybeans',
        soilType: 'Clay Loam'
      };

      // Setup request params and body
      req.params = { id: FieldsId };
      req.body = updateData;

      // Setup the stub to return the updated Fields
      findByIdAndUpdateStub.resolves(updatedFields);

      // Call the controller method
      await FieldsController.updateFields(req as Request, res as Response);

      // Verify the results
      expect(findByIdAndUpdateStub.calledWith(
        FieldsId,
        updateData,
        { new: true, runValidators: true }
      )).to.be.true;
      expect(statusStub.calledWith(200)).to.be.true;
      expect(jsonStub.calledWith(updatedFields)).to.be.true;
    });

    it('should return 404 if Fields not found', async () => {
      // Setup request params and body
      req.params = { id: '60d21b4667d0d8992e610c85' };
      req.body = { name: 'Updated Fields' };

      // Setup the stub to return null (Fields not found)
      findByIdAndUpdateStub.resolves(null);

      // Call the controller method
      await FieldsController.updateFields(req as Request, res as Response);

      // Verify the results
      expect(statusStub.calledWith(404)).to.be.true;
      expect(jsonStub.calledWith({ error: 'Fields not found' })).to.be.true;
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
      await FieldsController.updateFields(req as Request, res as Response);

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
      req.body = { name: 'Updated Fields' };

      // Setup the stub to throw a generic error
      const error = new Error('Database error');
      findByIdAndUpdateStub.rejects(error);

      // Call the controller method
      await FieldsController.updateFields(req as Request, res as Response);

      // Verify the results
      expect(statusStub.calledWith(500)).to.be.true;
      expect(jsonStub.calledWith({ error: 'Failed to update Fields', details: error.message })).to.be.true;
    });
  });

  describe('deleteFields', () => {
    it('should delete a Fields', async () => {
      // Mock Fields ID
      const FieldsId = '60d21b4667d0d8992e610c85';
      
      // Mock deleted Fields
      const deletedFields = {
        _id: FieldsId,
        name: 'North Fields',
        area: 25.4
      };

      // Setup request params
      req.params = { id: FieldsId };

      // Setup the stub to return the deleted Fields
      findByIdAndDeleteStub.resolves(deletedFields);

      // Call the controller method
      await FieldsController.deleteFields(req as Request, res as Response);

      // Verify the results
      expect(findByIdAndDeleteStub.calledWith(FieldsId)).to.be.true;
      expect(statusStub.calledWith(200)).to.be.true;
      expect(jsonStub.calledWith({ message: 'Fields deleted successfully', Fields: deletedFields })).to.be.true;
    });

    it('should return 404 if Fields not found', async () => {
      // Setup request params
      req.params = { id: '60d21b4667d0d8992e610c85' };

      // Setup the stub to return null (Fields not found)
      findByIdAndDeleteStub.resolves(null);

      // Call the controller method
      await FieldsController.deleteFields(req as Request, res as Response);

      // Verify the results
      expect(findByIdAndDeleteStub.calledWith(req.params.id)).to.be.true;
      expect(statusStub.calledWith(404)).to.be.true;
      expect(jsonStub.calledWith({ error: 'Fields not found' })).to.be.true;
    });

    it('should handle errors', async () => {
      // Setup request params
      req.params = { id: '60d21b4667d0d8992e610c85' };

      // Setup the stub to throw a generic error
      const error = new Error('Database error');
      findByIdAndDeleteStub.rejects(error);

      // Call the controller method
      await FieldsController.deleteFields(req as Request, res as Response);

      // Verify the results
      expect(findByIdAndDeleteStub.calledWith(req.params.id)).to.be.true;
      expect(statusStub.calledWith(500)).to.be.true;
      expect(jsonStub.calledWith({ error: 'Failed to delete Fields', details: error.message })).to.be.true;
    });
  });
});