const mongoose = require('mongoose');
const User = require('../models/User');
const TermsAndConditions = require('../models/TermsAndConditions');
require('dotenv').config();

async function setupEnhancedFeatures() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/agrimaan');
    console.log('Connected to MongoDB');

    // Create system admin if not exists
    const existingAdmin = await User.findOne({ email: 'admin@agrimaan.com' });
    
    if (!existingAdmin) {
      const admin = new User({
        name: 'System Administrator',
        email: 'admin@agrimaan.com',
        password: 'Admin@123456',
        role: 'admin',
        isSystemAdmin: true,
        verificationStatus: 'verified',
        emailVerification: {
          verified: true
        },
        termsAcceptance: {
          accepted: true,
          acceptedAt: new Date(),
          version: '1.0',
          ipAddress: '127.0.0.1'
        },
        communicationPreferences: {
          email: {
            marketing: false,
            notifications: true,
            updates: true
          },
          sms: {
            marketing: false,
            notifications: true,
            updates: true
          }
        }
      });

      await admin.save();
      console.log('✅ System admin created successfully');
      console.log('   Email: admin@agrimaan.com');
      console.log('   Password: Admin@123456');
    } else {
      console.log('ℹ️  System admin already exists');
    }

    // Create initial terms and conditions if not exists
    const existingTerms = await TermsAndConditions.findOne({ version: '1.0' });
    
    if (!existingTerms) {
      const admin = await User.findOne({ email: 'admin@agrimaan.com' });
      
      const terms = new TermsAndConditions({
        version: '1.0',
        title: 'Agrimaan Platform Terms and Conditions',
        content: `
# Terms and Conditions for Agrimaan Platform

## 1. Acceptance of Terms
By accessing and using the Agrimaan platform, you accept and agree to be bound by the terms and provision of this agreement.

## 2. User Registration
- Users must provide accurate and complete information during registration
- Users are responsible for maintaining the confidentiality of their account credentials
- Users must verify their email address and phone number as required

## 3. Land Tokenization
- Land tokenization is subject to verification and approval by Agrimaan administrators
- All legal documents must be authentic and verifiable
- Token holders have rights as specified in individual tokenization agreements

## 4. Data Privacy
- We collect and process personal data in accordance with our Privacy Policy
- Users can control their communication preferences
- We implement appropriate security measures to protect user data

## 5. Platform Usage
- Users must comply with all applicable laws and regulations
- Prohibited activities include fraud, spam, and misuse of the platform
- Agrimaan reserves the right to suspend or terminate accounts for violations

## 6. Investment Risks
- Land tokenization involves investment risks
- Past performance does not guarantee future results
- Users should carefully consider their financial situation before investing

## 7. Limitation of Liability
- Agrimaan provides the platform "as is" without warranties
- We are not liable for investment losses or damages
- Our liability is limited to the maximum extent permitted by law

## 8. Modifications
- These terms may be updated from time to time
- Users will be notified of significant changes
- Continued use constitutes acceptance of modified terms

## 9. Governing Law
These terms are governed by the laws of India and subject to the jurisdiction of Indian courts.

## 10. Contact Information
For questions about these terms, contact us at legal@agrimaan.com

Last updated: ${new Date().toLocaleDateString()}
        `,
        effectiveDate: new Date(),
        isActive: true,
        createdBy: admin._id,
        approvedBy: admin._id,
        approvedAt: new Date()
      });

      await terms.save();
      console.log('✅ Initial terms and conditions created');
    } else {
      console.log('ℹ️  Terms and conditions already exist');
    }

    // Create sample farmer user for testing
    const existingFarmer = await User.findOne({ email: 'farmer@example.com' });
    
    if (!existingFarmer) {
      const farmer = new User({
        name: 'Sample Farmer',
        email: 'farmer@example.com',
        password: 'Farmer@123',
        role: 'farmer',
        verificationStatus: 'pending',
        phone: {
          number: '9876543210',
          verified: false
        },
        address: {
          street: '123 Farm Road',
          city: 'Bangalore',
          state: 'Karnataka',
          country: 'India',
          zipCode: '560001'
        },
        emailVerification: {
          verified: true
        },
        termsAcceptance: {
          accepted: true,
          acceptedAt: new Date(),
          version: '1.0',
          ipAddress: '127.0.0.1'
        },
        communicationPreferences: {
          email: {
            marketing: true,
            notifications: true,
            updates: true
          },
          sms: {
            marketing: false,
            notifications: true,
            updates: true
          }
        }
      });

      await farmer.save();
      console.log('✅ Sample farmer user created');
      console.log('   Email: farmer@example.com');
      console.log('   Password: Farmer@123');
    } else {
      console.log('ℹ️  Sample farmer user already exists');
    }

    // Create sample investor user for testing
    const existingInvestor = await User.findOne({ email: 'investor@example.com' });
    
    if (!existingInvestor) {
      const investor = new User({
        name: 'Sample Investor',
        email: 'investor@example.com',
        password: 'Investor@123',
        role: 'investor',
        verificationStatus: 'verified',
        phone: {
          number: '9876543211',
          verified: true
        },
        address: {
          street: '456 Investment Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India',
          zipCode: '400001'
        },
        emailVerification: {
          verified: true
        },
        termsAcceptance: {
          accepted: true,
          acceptedAt: new Date(),
          version: '1.0',
          ipAddress: '127.0.0.1'
        },
        communicationPreferences: {
          email: {
            marketing: true,
            notifications: true,
            updates: true
          },
          sms: {
            marketing: true,
            notifications: true,
            updates: true
          }
        }
      });

      await investor.save();
      console.log('✅ Sample investor user created');
      console.log('   Email: investor@example.com');
      console.log('   Password: Investor@123');
    } else {
      console.log('ℹ️  Sample investor user already exists');
    }

    console.log('\n🎉 Enhanced features setup completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   - System admin account ready');
    console.log('   - Terms and conditions configured');
    console.log('   - Sample users created for testing');
    console.log('   - Database schema updated');
    
    console.log('\n🚀 Next steps:');
    console.log('   1. Configure your .env file with API keys');
    console.log('   2. Set up Google OAuth credentials');
    console.log('   3. Configure email and SMS services');
    console.log('   4. Start the backend server: npm run dev');
    console.log('   5. Test the new features');

    console.log('\n🔐 Test Accounts:');
    console.log('   Admin: admin@agrimaan.com / Admin@123456');
    console.log('   Farmer: farmer@example.com / Farmer@123');
    console.log('   Investor: investor@example.com / Investor@123');

  } catch (error) {
    console.error('❌ Setup failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the setup
setupEnhancedFeatures();