// Common types for the application

export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    verificationStatus: 'unverified' | 'pending' | 'verified';
    emailVerified: boolean;
    phoneVerified: boolean;
    isSystemAdmin?: boolean;
    provider?: 'local' | 'google';
    createdAt: string;
    lastLogin?: string;
    phone?: {
      number: string;
      verified: boolean;
    };
    address?: {
      street: string;
      city: string;
      state: string;
      country: string;
      zipCode: string;
    };
  }
  
  export interface LandToken {
    _id: string;
    landId: string;
    owner: {
      _id: string;
      name: string;
      email: string;
    };
    landDetails: {
      area: {
        value: number;
        unit: string;
      };
      location: {
        address: string;
        city: string;
        state: string;
        country: string;
        coordinates?: {
          latitude: number;
          longitude: number;
        };
      };
      soilType: string;
      landUse: string;
      waterSource?: string;
      irrigation: string;
    };
    tokenization: {
      totalTokens: number;
      tokenPrice: number;
      currency: string;
      availableTokens: number;
      soldTokens: number;
      minimumPurchase: number;
      maximumPurchase?: number;
    };
    verification: {
      status: 'pending' | 'under_review' | 'verified' | 'rejected';
      verifiedBy?: string;
      verifiedAt?: string;
      verificationNotes?: string;
      rejectionReason?: string;
    };
    status: 'draft' | 'pending_approval' | 'active' | 'sold_out' | 'suspended' | 'expired';
    createdAt: string;
    updatedAt: string;
  }
  
  export interface BulkUpload {
    _id: string;
    uploadedBy: string;
    fileName: string;
    originalFileName: string;
    fileSize: number;
    uploadType: 'farmer' | 'buyer' | 'logistics' | 'agronomist' | 'investor';
    status: 'processing' | 'completed' | 'failed' | 'partially_completed';
    totalRecords: number;
    processedRecords: number;
    successfulRecords: number;
    failedRecords: number;
    errors: Array<{
      row: number;
      field: string;
      message: string;
      data: any;
    }>;
    createdAt: string;
    completedAt?: string;
    processingTime?: number;
  }
  
  export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: Array<{
      field: string;
      message: string;
    }>;
  }
  
  export interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    pages: number;
  }
  
  export interface PaginatedResponse<T = any> {
    data: T[];
    pagination: PaginationInfo;
  }