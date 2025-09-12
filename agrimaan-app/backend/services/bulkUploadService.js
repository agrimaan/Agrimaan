const csv = require('csv-parser');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const BulkUpload = require('../models/BulkUpload');
const emailService = require('./emailService');

class BulkUploadService {
  constructor() {
    this.supportedFormats = ['.csv', '.xlsx', '.xls'];
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
    this.batchSize = 100; // Process in batches
  }

  // Validate file format and size
  validateFile(file) {
    const errors = [];
    
    if (!file) {
      errors.push('No file provided');
      return { valid: false, errors };
    }

    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (!this.supportedFormats.includes(fileExtension)) {
      errors.push(`Unsupported file format. Supported formats: ${this.supportedFormats.join(', ')}`);
    }

    if (file.size > this.maxFileSize) {
      errors.push(`File size exceeds maximum limit of ${this.maxFileSize / (1024 * 1024)}MB`);
    }

    return { valid: errors.length === 0, errors };
  }

  // Parse CSV file
  async parseCSV(filePath) {
    return new Promise((resolve, reject) => {
      const results = [];
      const errors = [];
      let rowIndex = 0;

      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
          rowIndex++;
          try {
            // Clean and validate data
            const cleanedData = this.cleanRowData(data, rowIndex);
            results.push(cleanedData);
          } catch (error) {
            errors.push({
              row: rowIndex,
              error: error.message,
              data: data
            });
          }
        })
        .on('end', () => {
          resolve({ data: results, errors });
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  // Parse Excel file
  async parseExcel(filePath) {
    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const results = [];
      const errors = [];

      jsonData.forEach((row, index) => {
        try {
          const cleanedData = this.cleanRowData(row, index + 2); // +2 because Excel rows start from 1 and we skip header
          results.push(cleanedData);
        } catch (error) {
          errors.push({
            row: index + 2,
            error: error.message,
            data: row
          });
        }
      });

      return { data: results, errors };
    } catch (error) {
      throw new Error(`Failed to parse Excel file: ${error.message}`);
    }
  }

  // Clean and validate row data
  cleanRowData(row, rowIndex) {
    const cleaned = {};
    
    // Map common field variations
    const fieldMappings = {
      name: ['name', 'full_name', 'fullname', 'user_name', 'username'],
      email: ['email', 'email_address', 'emailaddress', 'mail'],
      phone: ['phone', 'mobile', 'phone_number', 'mobile_number', 'contact'],
      role: ['role', 'user_role', 'type', 'user_type'],
      address: ['address', 'location', 'city'],
      state: ['state', 'province'],
      country: ['country', 'nation']
    };

    // Normalize field names and extract data
    Object.keys(row).forEach(key => {
      const normalizedKey = key.toLowerCase().trim().replace(/\s+/g, '_');
      
      for (const [standardField, variations] of Object.entries(fieldMappings)) {
        if (variations.includes(normalizedKey)) {
          cleaned[standardField] = row[key]?.toString().trim();
          break;
        }
      }
    });

    // Validate required fields
    if (!cleaned.name || cleaned.name.length < 2) {
      throw new Error('Name is required and must be at least 2 characters');
    }

    if (!cleaned.email || !this.validateEmail(cleaned.email)) {
      throw new Error('Valid email address is required');
    }

    // Validate role
    const validRoles = ['farmer', 'agronomist', 'admin', 'investor', 'buyer', 'logistics'];
    if (cleaned.role && !validRoles.includes(cleaned.role.toLowerCase())) {
      cleaned.role = 'farmer'; // Default role
    } else if (cleaned.role) {
      cleaned.role = cleaned.role.toLowerCase();
    } else {
      cleaned.role = 'farmer';
    }

    // Validate phone number
    if (cleaned.phone) {
      const phoneValidation = this.validatePhoneNumber(cleaned.phone);
      if (!phoneValidation.valid) {
        throw new Error(`Invalid phone number: ${phoneValidation.error}`);
      }
      cleaned.phone = phoneValidation.formatted;
    }

    return cleaned;
  }

  // Process bulk upload
  async processBulkUpload(file, uploadType, uploadedBy) {
    const startTime = Date.now();
    
    // Create bulk upload record
    const bulkUpload = new BulkUpload({
      uploadedBy,
      fileName: file.filename,
      originalFileName: file.originalname,
      fileSize: file.size,
      uploadType,
      status: 'processing'
    });

    try {
      await bulkUpload.save();

      // Parse file based on extension
      const fileExtension = path.extname(file.originalname).toLowerCase();
      let parseResult;

      if (fileExtension === '.csv') {
        parseResult = await this.parseCSV(file.path);
      } else if (['.xlsx', '.xls'].includes(fileExtension)) {
        parseResult = await this.parseExcel(file.path);
      } else {
        throw new Error('Unsupported file format');
      }

      // Update bulk upload with parsing results
      bulkUpload.totalRecords = parseResult.data.length;
      bulkUpload.errors = parseResult.errors;
      await bulkUpload.save();

      // Process data in batches
      const processedData = [];
      let successCount = 0;
      let failureCount = 0;

      for (let i = 0; i < parseResult.data.length; i += this.batchSize) {
        const batch = parseResult.data.slice(i, i + this.batchSize);
        const batchResults = await this.processBatch(batch, i);
        
        processedData.push(...batchResults);
        successCount += batchResults.filter(r => r.status === 'success').length;
        failureCount += batchResults.filter(r => r.status === 'failed').length;

        // Update progress
        bulkUpload.processedRecords = i + batch.length;
        bulkUpload.successfulRecords = successCount;
        bulkUpload.failedRecords = failureCount;
        await bulkUpload.save();
      }

      // Finalize bulk upload
      const endTime = Date.now();
      bulkUpload.status = failureCount === 0 ? 'completed' : 'partially_completed';
      bulkUpload.processedData = processedData;
      bulkUpload.completedAt = new Date();
      bulkUpload.processingTime = endTime - startTime;
      await bulkUpload.save();

      // Clean up uploaded file
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      // Send notification email to admin
      const admin = await User.findById(uploadedBy);
      if (admin) {
        await emailService.sendBulkUploadNotification(admin, bulkUpload);
      }

      return bulkUpload;

    } catch (error) {
      // Update bulk upload with error
      bulkUpload.status = 'failed';
      bulkUpload.errors.push({
        row: 0,
        field: 'system',
        message: error.message
      });
      bulkUpload.completedAt = new Date();
      bulkUpload.processingTime = Date.now() - startTime;
      await bulkUpload.save();

      // Clean up uploaded file
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      throw error;
    }
  }

  // Process batch of users
  async processBatch(batch, startIndex) {
    const results = [];

    for (let i = 0; i < batch.length; i++) {
      const rowData = batch[i];
      const rowIndex = startIndex + i + 1;

      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: rowData.email });
        
        if (existingUser) {
          results.push({
            row: rowIndex,
            status: 'failed',
            data: rowData,
            error: 'User with this email already exists'
          });
          continue;
        }

        // Create new user
        const userData = {
          name: rowData.name,
          email: rowData.email,
          role: rowData.role,
          verificationStatus: 'unverified',
          emailVerification: {
            verified: false
          }
        };

        if (rowData.phone) {
          userData.phone = {
            number: rowData.phone,
            verified: false
          };
        }

        if (rowData.address || rowData.state || rowData.country) {
          userData.address = {
            street: rowData.address,
            state: rowData.state,
            country: rowData.country
          };
        }

        // Generate temporary password
        userData.password = this.generateTemporaryPassword();

        const user = new User(userData);
        await user.save();

        results.push({
          row: rowIndex,
          status: 'success',
          userId: user._id,
          data: rowData
        });

      } catch (error) {
        results.push({
          row: rowIndex,
          status: 'failed',
          data: rowData,
          error: error.message
        });
      }
    }

    return results;
  }

  // Generate temporary password
  generateTemporaryPassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  // Validate email format
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate phone number
  validatePhoneNumber(phone) {
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 10 && /^[6-9]/.test(cleaned)) {
      return { valid: true, formatted: cleaned };
    }
    
    if (cleaned.length === 12 && cleaned.startsWith('91')) {
      return { valid: true, formatted: cleaned.substring(2) };
    }
    
    return { valid: false, error: 'Invalid phone number format' };
  }

  // Get bulk upload status
  async getBulkUploadStatus(uploadId) {
    try {
      const bulkUpload = await BulkUpload.findById(uploadId)
        .populate('uploadedBy', 'name email')
        .lean();
      
      if (!bulkUpload) {
        throw new Error('Bulk upload not found');
      }

      return bulkUpload;
    } catch (error) {
      throw new Error('Failed to get bulk upload status: ' + error.message);
    }
  }

  // Get bulk upload history
  async getBulkUploadHistory(adminId, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      
      const uploads = await BulkUpload.find({ uploadedBy: adminId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('uploadedBy', 'name email')
        .lean();

      const total = await BulkUpload.countDocuments({ uploadedBy: adminId });

      return {
        uploads,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error('Failed to get bulk upload history: ' + error.message);
    }
  }

  // Generate sample CSV template
  generateSampleCSV(uploadType) {
    const headers = ['name', 'email', 'phone', 'role', 'address', 'state', 'country'];
    const sampleData = [
      ['John Doe', 'john.doe@example.com', '9876543210', uploadType, '123 Main St', 'Karnataka', 'India'],
      ['Jane Smith', 'jane.smith@example.com', '9876543211', uploadType, '456 Oak Ave', 'Maharashtra', 'India']
    ];

    let csvContent = headers.join(',') + '\n';
    sampleData.forEach(row => {
      csvContent += row.join(',') + '\n';
    });

    return csvContent;
  }

  // Delete bulk upload record and associated data
  async deleteBulkUpload(uploadId, adminId) {
    try {
      const bulkUpload = await BulkUpload.findOne({ 
        _id: uploadId, 
        uploadedBy: adminId 
      });

      if (!bulkUpload) {
        throw new Error('Bulk upload not found or access denied');
      }

      await BulkUpload.findByIdAndDelete(uploadId);
      return { success: true, message: 'Bulk upload record deleted successfully' };
    } catch (error) {
      throw new Error('Failed to delete bulk upload: ' + error.message);
    }
  }
}

module.exports = new BulkUploadService();