const crypto = require('crypto');
const Blockchain = require('../models/Blockchain');
const notificationService = require('./notification.service');

/**
 * Blockchain service to handle cryptocurrency and tokenization
 */
class BlockchainService {
  /**
   * Create a new wallet for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Created wallet
   */
  async createWallet(userId) {
    try {
      // Check if user already has a wallet
      const existingWallet = await Blockchain.Wallet.findOne({ owner: userId });
      
      if (existingWallet) {
        throw new Error('User already has a wallet');
      }
      
      // In a real implementation, this would connect to an Ethereum node
      // For now, we'll simulate wallet creation
      
      // Generate a random private key (this is just a simulation)
      const privateKey = crypto.randomBytes(32).toString('hex');
      
      // Generate a public key from the private key (in a real implementation)
      // Here we're just creating a random string for simulation
      const publicKey = `0x${crypto.randomBytes(20).toString('hex')}`;
      
      // Create wallet in database
      const wallet = new Blockchain.Wallet({
        owner: userId,
        address: publicKey,
        // In a real implementation, we would never store the private key
        // This is just for simulation purposes
        encryptedPrivateKey: this.simulateEncryption(privateKey),
        balance: 0,
        createdAt: new Date()
      });
      
      await wallet.save();
      
      // Create notification for user
      await notificationService.createBlockchainNotification(
        userId,
        'Wallet Created',
        'Your AGM cryptocurrency wallet has been created successfully.',
        {
          type: 'success',
          priority: 'medium',
          actionRequired: false,
          actionLink: '/blockchain/wallet'
        }
      );
      
      return {
        address: wallet.address,
        balance: wallet.balance,
        createdAt: wallet.createdAt
      };
    } catch (error) {
      console.error('Error creating wallet:', error);
      throw new Error('Failed to create wallet');
    }
  }
  
  /**
   * Get wallet for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User wallet
   */
  async getWallet(userId) {
    try {
      const wallet = await Blockchain.Wallet.findOne({ owner: userId });
      
      if (!wallet) {
        throw new Error('Wallet not found');
      }
      
      // In a real implementation, we would fetch the current balance from the blockchain
      // For now, we'll just return the stored balance
      
      return {
        address: wallet.address,
        balance: wallet.balance,
        createdAt: wallet.createdAt,
        updatedAt: wallet.updatedAt
      };
    } catch (error) {
      console.error('Error getting wallet:', error);
      throw new Error('Failed to get wallet');
    }
  }
  
  /**
   * Transfer AGM tokens
   * @param {string} userId - User ID
   * @param {string} toAddress - Recipient address
   * @param {number} amount - Amount to transfer
   * @returns {Promise<Object>} Transaction details
   */
  async transferTokens(userId, toAddress, amount) {
    try {
      // Get user's wallet
      const wallet = await Blockchain.Wallet.findOne({ owner: userId });
      
      if (!wallet) {
        throw new Error('Wallet not found');
      }
      
      // Check if user has enough balance
      if (wallet.balance < amount) {
        throw new Error('Insufficient balance');
      }
      
      // In a real implementation, this would create a blockchain transaction
      // For now, we'll simulate the transaction
      
      // Generate a transaction hash
      const txHash = `0x${crypto.randomBytes(32).toString('hex')}`;
      
      // Create transaction record
      const transaction = new Blockchain.Transaction({
        from: wallet.address,
        to: toAddress,
        amount,
        tokenType: 'AGM',
        txHash,
        status: 'pending',
        initiatedBy: userId,
        initiatedAt: new Date()
      });
      
      await transaction.save();
      
      // Simulate transaction processing
      setTimeout(async () => {
        try {
          // Update transaction status
          transaction.status = 'completed';
          transaction.completedAt = new Date();
          await transaction.save();
          
          // Update wallet balance
          wallet.balance -= amount;
          await wallet.save();
          
          // Create notification for user
          await notificationService.createBlockchainNotification(
            userId,
            'Transaction Completed',
            `Your transfer of ${amount} AGM to ${toAddress} has been completed successfully.`,
            {
              type: 'success',
              priority: 'medium',
              actionRequired: false,
              actionLink: `/blockchain/transactions/${transaction._id}`
            }
          );
        } catch (error) {
          console.error('Error processing transaction:', error);
          
          // Update transaction status to failed
          transaction.status = 'failed';
          transaction.error = 'Transaction processing failed';
          await transaction.save();
          
          // Create notification for user
          await notificationService.createBlockchainNotification(
            userId,
            'Transaction Failed',
            `Your transfer of ${amount} AGM to ${toAddress} has failed.`,
            {
              type: 'error',
              priority: 'high',
              actionRequired: true,
              actionLink: `/blockchain/transactions/${transaction._id}`
            }
          );
        }
      }, 5000); // Simulate 5-second processing time
      
      return {
        txHash,
        from: wallet.address,
        to: toAddress,
        amount,
        status: 'pending',
        initiatedAt: transaction.initiatedAt
      };
    } catch (error) {
      console.error('Error transferring tokens:', error);
      throw new Error(error.message || 'Failed to transfer tokens');
    }
  }
  
  /**
   * Get transaction history for a user
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Array<Object>>} Transaction history
   */
  async getTransactionHistory(userId, options = {}) {
    try {
      // Get user's wallet
      const wallet = await Blockchain.Wallet.findOne({ owner: userId });
      
      if (!wallet) {
        throw new Error('Wallet not found');
      }
      
      // Set up query
      const query = {
        $or: [
          { from: wallet.address },
          { to: wallet.address }
        ]
      };
      
      // Apply filters
      if (options.status) {
        query.status = options.status;
      }
      
      if (options.tokenType) {
        query.tokenType = options.tokenType;
      }
      
      // Set up pagination
      const limit = options.limit || 20;
      const skip = options.skip || 0;
      
      // Get transactions
      const transactions = await Blockchain.Transaction.find(query)
        .sort({ initiatedAt: -1 })
        .skip(skip)
        .limit(limit);
      
      return transactions.map(tx => ({
        id: tx._id,
        txHash: tx.txHash,
        from: tx.from,
        to: tx.to,
        amount: tx.amount,
        tokenType: tx.tokenType,
        status: tx.status,
        initiatedAt: tx.initiatedAt,
        completedAt: tx.completedAt,
        type: tx.from === wallet.address ? 'outgoing' : 'incoming'
      }));
    } catch (error) {
      console.error('Error getting transaction history:', error);
      throw new Error('Failed to get transaction history');
    }
  }
  
  /**
   * Create a Fields token
   * @param {string} userId - User ID
   * @param {Object} FieldsData - Fields data
   * @returns {Promise<Object>} Created token
   */
  async createFieldsToken(userId, FieldsData) {
    try {
      // Get user's wallet
      const wallet = await Blockchain.Wallet.findOne({ owner: userId });
      
      if (!wallet) {
        throw new Error('Wallet not found');
      }
      
      // In a real implementation, this would deploy a smart contract
      // For now, we'll simulate token creation
      
      // Generate a token ID
      const tokenId = `Fields-${crypto.randomBytes(8).toString('hex')}`;
      
      // Create token record
      const token = new Blockchain.Token({
        tokenId,
        tokenType: 'Fields',
        owner: userId,
        ownerAddress: wallet.address,
        metadata: {
          name: FieldsData.name,
          description: FieldsData.description,
          location: FieldsData.location,
          area: FieldsData.area,
          coordinates: FieldsData.coordinates,
          propertyType: FieldsData.propertyType,
          soilType: FieldsData.soilType,
          documents: FieldsData.documents || []
        },
        status: 'active',
        createdAt: new Date(),
        createdBy: userId
      });
      
      await token.save();
      
      // Create notification for user
      await notificationService.createBlockchainNotification(
        userId,
        'Fields Token Created',
        `Your Fields token for ${FieldsData.name} has been created successfully.`,
        {
          type: 'success',
          priority: 'medium',
          actionRequired: false,
          actionLink: `/blockchain/tokens/${token._id}`
        }
      );
      
      return {
        tokenId: token.tokenId,
        tokenType: token.tokenType,
        metadata: token.metadata,
        status: token.status,
        createdAt: token.createdAt
      };
    } catch (error) {
      console.error('Error creating Fields token:', error);
      throw new Error('Failed to create Fields token');
    }
  }
  
  /**
   * Create a farmhouse token
   * @param {string} userId - User ID
   * @param {Object} farmhouseData - Farmhouse data
   * @returns {Promise<Object>} Created token
   */
  async createFarmhouseToken(userId, farmhouseData) {
    try {
      // Get user's wallet
      const wallet = await Blockchain.Wallet.findOne({ owner: userId });
      
      if (!wallet) {
        throw new Error('Wallet not found');
      }
      
      // In a real implementation, this would deploy a smart contract
      // For now, we'll simulate token creation
      
      // Generate a token ID
      const tokenId = `FARM-${crypto.randomBytes(8).toString('hex')}`;
      
      // Create token record
      const token = new Blockchain.Token({
        tokenId,
        tokenType: 'FARMHOUSE',
        owner: userId,
        ownerAddress: wallet.address,
        metadata: {
          name: farmhouseData.name,
          description: farmhouseData.description,
          location: farmhouseData.location,
          area: farmhouseData.area,
          buildingType: farmhouseData.buildingType,
          facilities: farmhouseData.facilities || [],
          yearBuilt: farmhouseData.yearBuilt,
          valuation: farmhouseData.valuation,
          documents: farmhouseData.documents || []
        },
        status: 'active',
        createdAt: new Date(),
        createdBy: userId
      });
      
      await token.save();
      
      // Create notification for user
      await notificationService.createBlockchainNotification(
        userId,
        'Farmhouse Token Created',
        `Your farmhouse token for ${farmhouseData.name} has been created successfully.`,
        {
          type: 'success',
          priority: 'medium',
          actionRequired: false,
          actionLink: `/blockchain/tokens/${token._id}`
        }
      );
      
      return {
        tokenId: token.tokenId,
        tokenType: token.tokenType,
        metadata: token.metadata,
        status: token.status,
        createdAt: token.createdAt
      };
    } catch (error) {
      console.error('Error creating farmhouse token:', error);
      throw new Error('Failed to create farmhouse token');
    }
  }
  
  /**
   * Get tokens owned by a user
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Array<Object>>} User tokens
   */
  async getUserTokens(userId, options = {}) {
    try {
      // Set up query
      const query = { owner: userId };
      
      // Apply filters
      if (options.tokenType) {
        query.tokenType = options.tokenType;
      }
      
      if (options.status) {
        query.status = options.status;
      }
      
      // Get tokens
      const tokens = await Blockchain.Token.find(query).sort({ createdAt: -1 });
      
      return tokens;
    } catch (error) {
      console.error('Error getting user tokens:', error);
      throw new Error('Failed to get user tokens');
    }
  }
  
  /**
   * Create a fractional token offering
   * @param {string} userId - User ID
   * @param {string} tokenId - Parent token ID
   * @param {Object} offeringData - Offering data
   * @returns {Promise<Object>} Created offering
   */
  async createFractionalOffering(userId, tokenId, offeringData) {
    try {
      // Get the parent token
      const parentToken = await Blockchain.Token.findOne({ tokenId });
      
      if (!parentToken) {
        throw new Error('Token not found');
      }
      
      // Check if user owns the token
      if (parentToken.owner.toString() !== userId) {
        throw new Error('You do not own this token');
      }
      
      // Check if token is already fractionalized
      if (parentToken.fractionalized) {
        throw new Error('Token is already fractionalized');
      }
      
      // In a real implementation, this would deploy a smart contract
      // For now, we'll simulate offering creation
      
      // Generate an offering ID
      const offeringId = `OFFER-${crypto.randomBytes(8).toString('hex')}`;
      
      // Create offering record
      const offering = new Blockchain.FractionalOffering({
        offeringId,
        parentToken: parentToken._id,
        tokenType: parentToken.tokenType,
        totalShares: offeringData.totalShares,
        pricePerShare: offeringData.pricePerShare,
        minInvestment: offeringData.minInvestment,
        maxInvestment: offeringData.maxInvestment,
        description: offeringData.description,
        terms: offeringData.terms,
        creator: userId,
        status: 'active',
        createdAt: new Date()
      });
      
      await offering.save();
      
      // Update parent token
      parentToken.fractionalized = true;
      parentToken.fractionalOffering = offering._id;
      await parentToken.save();
      
      // Create notification for user
      await notificationService.createBlockchainNotification(
        userId,
        'Fractional Offering Created',
        `Your fractional offering for ${parentToken.metadata.name} has been created successfully.`,
        {
          type: 'success',
          priority: 'medium',
          actionRequired: false,
          actionLink: `/blockchain/offerings/${offering._id}`
        }
      );
      
      return {
        offeringId: offering.offeringId,
        parentToken: {
          tokenId: parentToken.tokenId,
          tokenType: parentToken.tokenType,
          metadata: parentToken.metadata
        },
        totalShares: offering.totalShares,
        pricePerShare: offering.pricePerShare,
        minInvestment: offering.minInvestment,
        maxInvestment: offering.maxInvestment,
        status: offering.status,
        createdAt: offering.createdAt
      };
    } catch (error) {
      console.error('Error creating fractional offering:', error);
      throw new Error(error.message || 'Failed to create fractional offering');
    }
  }
  
  /**
   * Invest in a fractional offering
   * @param {string} userId - User ID
   * @param {string} offeringId - Offering ID
   * @param {number} shares - Number of shares to purchase
   * @returns {Promise<Object>} Investment details
   */
  async investInOffering(userId, offeringId, shares) {
    try {
      // Get user's wallet
      const wallet = await Blockchain.Wallet.findOne({ owner: userId });
      
      if (!wallet) {
        throw new Error('Wallet not found');
      }
      
      // Get the offering
      const offering = await Blockchain.FractionalOffering.findOne({ offeringId })
        .populate('parentToken');
      
      if (!offering) {
        throw new Error('Offering not found');
      }
      
      // Check if offering is active
      if (offering.status !== 'active') {
        throw new Error('Offering is not active');
      }
      
      // Check if there are enough shares available
      const totalInvestedShares = await this.getTotalInvestedShares(offering._id);
      const availableShares = offering.totalShares - totalInvestedShares;
      
      if (shares > availableShares) {
        throw new Error(`Only ${availableShares} shares available`);
      }
      
      // Check if investment is within limits
      const amount = shares * offering.pricePerShare;
      
      if (amount < offering.minInvestment) {
        throw new Error(`Minimum investment is ${offering.minInvestment} AGM`);
      }
      
      if (offering.maxInvestment && amount > offering.maxInvestment) {
        throw new Error(`Maximum investment is ${offering.maxInvestment} AGM`);
      }
      
      // Check if user has enough balance
      if (wallet.balance < amount) {
        throw new Error('Insufficient balance');
      }
      
      // In a real implementation, this would create a blockchain transaction
      // For now, we'll simulate the investment
      
      // Create investment record
      const investment = new Blockchain.Investment({
        investor: userId,
        investorAddress: wallet.address,
        offering: offering._id,
        shares,
        amount,
        status: 'completed',
        createdAt: new Date()
      });
      
      await investment.save();
      
      // Update wallet balance
      wallet.balance -= amount;
      await wallet.save();
      
      // Create transaction record
      const transaction = new Blockchain.Transaction({
        from: wallet.address,
        to: offering.parentToken.ownerAddress,
        amount,
        tokenType: 'AGM',
        txHash: `0x${crypto.randomBytes(32).toString('hex')}`,
        status: 'completed',
        initiatedBy: userId,
        initiatedAt: new Date(),
        completedAt: new Date(),
        metadata: {
          type: 'investment',
          offeringId: offering.offeringId,
          shares
        }
      });
      
      await transaction.save();
      
      // Check if offering is fully invested
      const newTotalInvestedShares = totalInvestedShares + shares;
      if (newTotalInvestedShares >= offering.totalShares) {
        offering.status = 'completed';
        await offering.save();
      }
      
      // Create notification for investor
      await notificationService.createBlockchainNotification(
        userId,
        'Investment Successful',
        `You have successfully invested ${amount} AGM for ${shares} shares in ${offering.parentToken.metadata.name}.`,
        {
          type: 'success',
          priority: 'medium',
          actionRequired: false,
          actionLink: `/blockchain/investments/${investment._id}`
        }
      );
      
      // Create notification for offering creator
      await notificationService.createBlockchainNotification(
        offering.creator,
        'New Investment Received',
        `You have received a new investment of ${amount} AGM for ${shares} shares in your ${offering.parentToken.metadata.name} offering.`,
        {
          type: 'info',
          priority: 'medium',
          actionRequired: false,
          actionLink: `/blockchain/offerings/${offering._id}`
        }
      );
      
      return {
        investmentId: investment._id,
        offering: {
          offeringId: offering.offeringId,
          parentToken: {
            tokenId: offering.parentToken.tokenId,
            tokenType: offering.parentToken.tokenType,
            metadata: offering.parentToken.metadata
          }
        },
        shares,
        amount,
        status: investment.status,
        createdAt: investment.createdAt
      };
    } catch (error) {
      console.error('Error investing in offering:', error);
      throw new Error(error.message || 'Failed to invest in offering');
    }
  }
  
  /**
   * Get total invested shares for an offering
   * @param {string} offeringId - Offering ID
   * @returns {Promise<number>} Total invested shares
   */
  async getTotalInvestedShares(offeringId) {
    try {
      const result = await Blockchain.Investment.aggregate([
        { $match: { offering: offeringId, status: 'completed' } },
        { $group: { _id: null, totalShares: { $sum: '$shares' } } }
      ]);
      
      return result.length > 0 ? result[0].totalShares : 0;
    } catch (error) {
      console.error('Error getting total invested shares:', error);
      throw new Error('Failed to get total invested shares');
    }
  }
  
  /**
   * Get user investments
   * @param {string} userId - User ID
   * @returns {Promise<Array<Object>>} User investments
   */
  async getUserInvestments(userId) {
    try {
      const investments = await Blockchain.Investment.find({ investor: userId })
        .populate({
          path: 'offering',
          populate: {
            path: 'parentToken'
          }
        })
        .sort({ createdAt: -1 });
      
      return investments.map(investment => ({
        investmentId: investment._id,
        offering: {
          offeringId: investment.offering.offeringId,
          parentToken: {
            tokenId: investment.offering.parentToken.tokenId,
            tokenType: investment.offering.parentToken.tokenType,
            metadata: investment.offering.parentToken.metadata
          },
          pricePerShare: investment.offering.pricePerShare
        },
        shares: investment.shares,
        amount: investment.amount,
        status: investment.status,
        createdAt: investment.createdAt
      }));
    } catch (error) {
      console.error('Error getting user investments:', error);
      throw new Error('Failed to get user investments');
    }
  }
  
  /**
   * Simulate encryption (for demo purposes only)
   * @param {string} data - Data to encrypt
   * @returns {string} Encrypted data
   */
  simulateEncryption(data) {
    // This is just a simulation - in a real implementation, we would use proper encryption
    return `encrypted:${data}`;
  }
}

module.exports = new BlockchainService();